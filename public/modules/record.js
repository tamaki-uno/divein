
const API_ENDPOINT = '/api/v0/sync';

export default class Record {
    /**
     * コンストラクタ
     * @param {string} uuid - ユーザーのUUID
     */
    constructor(uuid) {
        this.uuid = uuid; // ユーザーのUUIDを設定
        this.data = []; // レコードデータを初期化
        // this.record = null; // レコードオブジェクトを初期化
        // this.html = ''; // HTMLコンテンツを初期化
    }
    /**
     * レコードをIndexedDBに保存する
     * @param {Object} record - 保存するレコードデータ
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @async
     */
    async getRecordFromIndexedDB(uuid) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('divein', 1);
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['records'], 'readonly');
                const store = transaction.objectStore('records');
                const getRequest = store.get(uuid);
                getRequest.onsuccess = (event) => {
                    resolve(event.target.result);
                };
                getRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };
            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
    /**
     * レコードをIndexedDBに保存する
     * @param {Object} record - 保存するレコードデータ
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @async
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
                body: JSON.stringify(record)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Sync successful:', data);
            return data;
        } catch (error) {
            console.error('Sync failed:', error);
            throw error;
        }
    }

}