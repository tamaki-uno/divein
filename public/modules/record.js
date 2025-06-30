import { getRecordFromIndexedDB, saveRecordToIndexedDB, syncRecord } from './database.js';

export default class Record {
    /**
     * コンストラクタ
     * @param {string} uuid - ユーザーのUUID
     */
    constructor(uuid) {
        this.uuid = uuid; // ユーザーのUUIDを設定
        this.init().then(() => this.render()); // 初期化とレンダリングを実行
        this.syncRecord().then(() => this.render()); // レコードを同期して再レンダリング
    }
    /**
     * 初期化処理
     * - HTMLを非同期で取得
     * - IndexedDBからレコードを取得
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @async
     */
    async init() {
        try {
            await this.fetchHtml(); // HTMLを非同期で取得
            await this.getRecordFromIndexedDB(this.uuid); // IndexedDBからレコードを取得
        } catch (error) {
            console.error('Initialization error:', error); // 初期化エラーをログ出力
        }
    }

    async fetchHtml() {
        return fetch('/modules/ui/html/record.html')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load record HTML');
                return response.text();
            })
            .then(html => {
                const parser = new DOMParser();
                this.html = parser.parseFromString(html, 'text/html');
                return this.html;
            })
            .catch(error => {
                console.error('Error loading record HTML:', error);
            });
    }


    /**
     * レコードをIndexedDBから取得し、this.recordに保存する
     * @param {string} uuid - 取得するレコードのUUID
     * @async
     * @return {Promise<Object>} - 取得したレコードオブジェクト
     * @throws {Error} - IndexedDBの操作に失敗した場合
     */
    async getRecordFromIndexedDB(uuid) {
        // return new Promise((resolve, reject) => {
        //     const request = indexedDB.open('divein', 1);
        //     request.onsuccess = (event) => {
        //         const db = event.target.result;
        //         const transaction = db.transaction(['records'], 'readonly');
        //         const store = transaction.objectStore('records');
        //         const getRequest = store.get(uuid);
        //         getRequest.onsuccess = (event) => {
        //             resolve(event.target.result);
        //         };
        //         getRequest.onerror = (event) => {
        //             reject(event.target.error);
        //         };
        //     };
        //     request.onerror = (event) => {
        //         reject(event.target.error);
        //     };
        // });
        try {
            const request = await indexedDB.open('divein', 1);
            const db = request.result;
            const transaction = db.transaction(['records'], 'readonly');
            const store = transaction.objectStore('records');
        // return indexedDB.open('divein', 1)
        //     .then(request => {
        //         const db = request.result;
        //         const transaction = db.transaction(['records'], 'readonly');
        //         const store = transaction.objectStore('records');
        //         return store.get(uuid)
        //             .then(getRequest => {
        //                 if (getRequest) {
        //                     this.record = getRequest; // レコードをthis.recordに保存
        //                     return this.record;
        //                 } else {
        //                     throw new Error(`Record with UUID ${uuid} not found`);
        //                 }
        //             });
    }

    /**
     * レコードをthis.recordからIndexedDBに保存する
     * @async
     * @param {Object} record - 保存するレコードオブジェクト
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @throws {Error} - IndexedDBの操作に失敗した場合
     */
    async saveRecordToIndexedDB(record) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('divein', 1);
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('records')) {
                    db.createObjectStore('records', { keyPath: 'uuid' });
                }
            };
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['records'], 'readwrite');
                const store = transaction.objectStore('records');
                const putRequest = store.put(record);
                putRequest.onsuccess = () => {
                    resolve();
                };
                putRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    /**
     * レコードをIndexedDBから取得し、APIと同期する
     * - レコードが存在しない場合は新規作成
     * - レコードが存在する場合はAPIと同期
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @async
     */
    async syncRecord() {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.record)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Sync successful:', data);
            this.record = data.record || this.record;
            return data;
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        }
    }

}