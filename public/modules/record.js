import { getRecordFromIndexedDB, saveRecordToIndexedDB, syncRecord } from './database.js';

/** * レコード親クラス
 * - ユーザーのレコードを管理
 * * - IndexedDBからレコードを取得・保存
 * - レコードの同期とレンダリングを行う
 * * @class
 * @param {string} uuid - ユーザーのUUID
 * @param {HTMLElement} parentNode - レコードを挿入する親ノード
 */
export default class Record {
    /**
     * コンストラクタ
     * @param {string} uuid - ユーザーのUUID
     * @param {HTMLElement} parentNode - レコードを挿入する親ノード
     * @constructor
     */
    constructor(uuid, parentNode) {
        console.log('[record] Record module initialized'); // レコードモジュール初期化ログ
        this.uuid = uuid; // ユーザーのUUIDを設定
        this.HTML_URL = '/modules/ui/html/record.html'; // レコードHTMLのURL
        this.init(parentNode).then(() => this.render()); // 初期化とレンダリングを実行
        syncRecord(uuid).then(() => this.rerender()); // レコードの同期後に再レンダリング
    }
    /**
     * 初期化処理
     * - HTMLを非同期で取得
     * - IndexedDBからレコードを取得
     * @param {HTMLElement} parentNode - レコードを挿入する親ノード
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @async
     */
    async init(parentNode) {
        console.log('[record] Initializing Record module'); // 初期化ログ
        try {
            this.parentNode = parentNode; // 親ノードを設定
            await this.fetchHtml(); // HTMLを非同期で取得
            this.html.id = this.uuid; // HTMLにUUIDを設定
            await getRecordFromIndexedDB(this.uuid); // IndexedDBからレコードを取得
        } catch (error) {
            console.error('Initialization error:', error); // 初期化エラーをログ出力
        }
    }

    /**
     * レコードを同期して再レンダリング
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @async
     */
    async fetchHtml() {
        return fetch(this.HTML_URL) // レコードHTMLを非同期で取得
            .then(response => {
                if (!response.ok) throw new Error('Failed to load record HTML');
                return response.text();
            })
            .then(html => {
                this.html = DOMParser.parseFromString(html, 'text/html');
                this.html.id = this.uuid; // HTMLにUUIDを設定
                return this.html; // HTMLを返す
            })
            .catch(error => {
                console.error('Error loading record HTML:', error);
            });
    }
    /**
     * レコードをレンダリング
     * - HTMLをbodyに挿入
     * - レコードデータを表示
     * @returns {HTMLElement} - レコードのHTML要素
     */
    render() {
        console.log('[record] Rendering Record module'); // レンダリングログ
        if (!this.html) this.fetchHtml(); // HTMLが未取得の場合は取得を試みる
        if (document.getElementById(this.uuid)) this.rerender(); // 既にレンダリング済みの場合は再レンダリング
        return this.parentNode.insertAdjacentHTML('beforeend', this.html); // HTMLを親ノードに挿入
    }
    /**
     * レコードを再レンダリング
     * - HTMLの内容を更新
     * - レコードが未レンダリングの場合はレンダリングを実行
     * @returns {void}
     */
    rerender() {
        console.log('[record] Re-rendering Record module'); // 再レンダリングログ
        if (!this.html) this.fetchHtml(); // HTMLが未取得の場合は取得を試みる
        if (!document.getElementById(this.uuid)) this.render(); // レコードが未レンダリングの場合はレンダリングを実行
        return document.getElementById(this.uuid).innerHTML = this.html.innerHTML; // HTMLの内容を更新
    }
    /**
     * レコードモジュールを開く
     * - レコードモジュールの初期化とレンダリングを実行
     * @returns {void}
     */
    open() {
        console.log('[record] Opening Record module'); // レコードモジュールを開くログ
    }
    /**
     * レコードモジュールを閉じる
     * - レコードモジュールのHTMLを削除
     * @returns {void}
     */
    close() {
        console.log('[record] Closing Record module'); // レコードモジュールを閉じるログ
    }
    /**
     * レコードモジュールに子要素を追加
     * - 子要素を追加するためのメソッド
     * @returns {void}
     */
    addChild() {
        console.log('[record] Adding child to Record module'); // レコードモジュールに子要素を追加するログ
    }
}