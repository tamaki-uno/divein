import { getRecordFromIndexedDB, saveRecordToIndexedDB, syncWithAPI } from './database.js';

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
        this.HTML_URL = '/modules/ui/html/record.html'; // レコードHTMLのURL
        this.uuid = uuid; // ユーザーのUUIDを設定
        this.parentNode = parentNode; // レコードを挿入する親ノードを設定
        this.child = []; // 子要素を管理する配列
        this.isOpen = false; // レコードの開閉状態を管理
        this.render(); // レコードをレンダリング
    }
    /**
     * レコードを同期して再レンダリング
     * @returns {Promise<void>} - 非同期処理の完了を示すPromise
     * @async
     */
    async fetchHtml() {
        console.log('[record] Fetching HTML for Record module'); // HTML取得ログ
        return fetch(this.HTML_URL) // レコードHTMLを非同期で取得
            .then(response => {
                if (!response.ok) throw new Error('Failed to load record HTML');
                return response.text();
            })
            .then(html => {
                const doc = new DOMParser().parseFromString(html, 'text/html'); // HTMLをパース
                console.log('[record] HTML fetched successfully:', doc); // HTML取得成功ログ
                this.doc = doc; // パースしたHTMLを保存
                return this.doc;
            })
            .catch(error => {
                console.error('Error loading record HTML:', error);
            });
    }
    /**
     * レコードのHTMLを初期化
     * - HTMLが未取得の場合はfetchHtmlを呼び出す
     * - HTMLにUUIDを設定
     * @returns {HTMLElement} - レコードのHTML要素
     */
    async initHtml() {
        console.log('[record] Initializing HTML for Record module'); // HTML初期化ログ
        if (this.recordContainer) return this.recordContainer; // レコードコンテナが既に存在する場合はそれを返す
        if (!this.doc) await this.fetchHtml(); // HTMLが未取得の場合はfetchHtmlを呼び出す
        this.recordContainer = document.getElementById(this.uuid);
        if (!this.recordContainer && !this.doc) {
            console.error('[record] Record container not found and document is not initialized'); // レコードコンテナが見つからない場合のエラーログ
            throw new Error('Record container not found');
        }

        this.recordContainer = this.doc.querySelector('.record-container'); // レコードコンテナを取得
        this.parentNode.appendChild(this.recordContainer); // 親ノードにレコードコンテナを追加
        //
        this.recordContainer.id = this.uuid; // レコードコンテナのIDをUUIDに設定
        this.querySelector = (selector) => this.recordContainer.querySelector(selector); // HTML要素のクエリセレクタを設定
        this.querySelectorAll = (selector) => this.recordContainer.querySelectorAll(selector); // HTML要素のクエリセレクタを設定
        // this.querySelector('.record-content').innerText = this.record.content; // レコード内容を設定
        // イベントリスナーを設定
        this.querySelector('.toggle-icon').addEventListener('click', (e) => this.toggle(e)); // トグルアイコンのクリックイベントを設定
        this.querySelector('.toggle-icon').addEventListener('contextmenu', (e) => this.menu(e)); // トグルアイコンの右クリックイベントを設定
        this.querySelector('.record-content').addEventListener('click', (e) => this.edit(e)); // レコード内容のクリックイベントを設定
        this.querySelector('.record-content').addEventListener('contextmenu', (e) => this.menu(e)); // レコード内容の右クリックイベントを設定
        this.querySelector('.delete-icon').addEventListener('click', (e) => this.delete(e)); // 削除アイコンのクリックイベントを設定
        this.querySelector('.add-icon').addEventListener('click', (e) => this.addChild(e)); // 子要素追加アイコンのクリックイベントを設定
        console.log('[record] HTML initialized successfully:', this.recordContainer); // HTML初期化成功ログ
        return this.recordContainer; // レコードのHTML要素を返す
    }
    /**
     * レコードをレンダリング
     * @returns {HTMLElement} - レコードのHTML要素
     * @async
     */
    render() {
        console.log('[record] Rendering Record module'); // レンダリングログ
        // (if (!this.recordContainer) this.initHtml())  // レコードコンテナが未定義の場合は初期化を実行
        //     .then(() => {
        // this.querySelector('.record-content').innerText = this.record?.content || 'Loading...'; // レコードタイトルを設定
        new Promise((resolve, reject) => {
            if (!this.recordContainer) this.initHtml() // レコードのHTMLを初期化
        })
            .then(() => {
                this.querySelector('.record-content').innerText = this.record?.content || 'Loading...'; // レコード内容を設定
                return this.recordContainer; // レコードコンテナを返す
            })
            .catch(error => {
                console.error('Error rendering Record module:', error); // レンダリングエラーログ
            });
    }
    /**
     * レコードを同期してレンダリング
     * - IndexedDBからレコードを取得
     * - APIと同期してレコードを取得
     * - レコードをレンダリング
     * @returns {Promise<HTMLElement>} - レコードのHTML要素
     * @async
     */
    async getRender() {
        console.log('[record] Syncing and rendering Record module'); // 同期とレンダリングログ
        const renderIndexedDB = new Promise((resolve, reject) => {
            getRecordFromIndexedDB(this.uuid) // IndexedDBからレコードを取得
                .then(record => {
                    this.record = record; // 取得したレコードを設定
                    resolve(this.render()); // レコードをレンダリング
                })
                .catch(error => {
                    console.error('Error fetching Record from IndexedDB:', error); // IndexedDB取得エラーをログ出力
                    reject(error); // エラーを拒否
                });
        });
        const renderAPI = new Promise((resolve, reject) => {
            syncWithAPI(this.uuid) // APIと同期してレコードを取得
                .then(record => {
                    this.record = record; // APIから取得したレコードを設定
                    resolve(this.render()); // レコードをレンダリング
                })
                .catch(error => {
                    console.error('Error syncing Record with API:', error); // API同期エラーをログ出力
                    reject(error); // エラーを拒否
                });
        });
        return Promise.all([this.render(), renderIndexedDB, renderAPI]) // 全てのレンダリングを待つ
    }
    /**
     * レコードを開く
     * - 開閉状態を更新
     * - トグルアイコンを開いた状態に更新
     * - 子要素を表示する
     * - 子要素をレンダリング
     * @returns {void}
     * */
    open() {
        console.log('[record] Opening Record module'); // 開くログ
        this.isOpen = true; // 開閉状態を更新
        this.html.querySelector('.toggle-icon').src = '/icon/open.svg'; // トグルアイコンを開いた状態に更新
        this.html.querySelector('.children-container').style.display = 'flex'; // 子要素を表示する
        this.child.forEach(child => {
            child.render(); // 子要素をレンダリング
        }); // 子要素をレンダリング
        return
    }
    /**
     * レコードを閉じる
     * - 開閉状態を更新
     * - トグルアイコンを閉じた状態に更新
     * - 子要素を非表示にする
     * @returns {void}
     */
    close() {
        console.log('[record] Closing Record module'); // 閉じるログ
        this.isOpen = false; // 開閉状態を更新
        this.html.querySelector('.toggle-icon').src = '/icon/closed.svg'; // トグルアイコンを閉じた状態に更新
        this.html.querySelector('.children-container').style.display = 'none'; // 子要素を非表示にする
        return
    }
    /**
     * レコードの編集
     * - レコード内容をクリックしたときに編集モードにする
     * @param {Event} event - クリックイベント
     * @returns {void}
     */
    toggle(event) {
        console.log('[record] Toggling Record module'); // トグルログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        this.isOpen ? this.close() : this.open(); // 開閉状態に応じて開く/閉じる
        this.rerender(); // レコードを再レンダリング
    }
    /**
     * レコードのコンテキストメニュー
     * - 右クリックでメニューを表示
     * @param {Event} event - 右クリックイベント
     * @returns {void}
     */
    menu(event) {
        console.log('[record] Opening context menu for Record module'); // コンテキストメニューログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        // コンテキストメニューの表示処理を実装する
        // ここでは簡単なアラートを表示する
        alert('Context menu is not implemented yet.'); // コンテキストメニュー未実装のアラート
    }
    /**
     * レコードの編集
     * - レコード内容をクリックしたときに編集モードにする
     * @param {Event} event - クリックイベント
     * @returns {void}
     */
    edit(event) {
        console.log('[record] Editing Record module'); // 編集ログ
        event.preventDefault(); // デフォルトの動作を防ぐ
    }
    /**
     * レコードを削除
     * - HTML要素を親ノードから削除
     * - インスタンス
     * 
     * @param {Event} event - クリックイベント
     * @returns {void}
     */
    delete(event) {
        console.log('[record] Deleting Record module'); // 削除ログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        this.parentNode.removeChild(this.html); // HTML要素を親ノードから削除
    }
    /**
     * レコードモジュールに子要素を追加
     * - 子要素を追加するためのメソッド
     * @returns {void}
     */
    addChild(event) {
        console.log('[record] Adding child to Record module'); // レコードモジュールに子要素を追加するログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        // 子要素のUUIDを生成
        const childUuid = crypto.randomUUID(); // 子要素のUUIDを生成
        this.child.push(
            new Record(
                childUuid,
                this.html.querySelector('.children-container')
            ) // 子要素を追加
        )
        this.open(); // レコードを開く
    }
    /**
     * レコードモジュールから子要素を削除
     * - 指定されたインデックスの子要素を削除するためのメソッド
     * @param {number} index - 削除する子要素のインデックス
     * @returns {void}
     */
    deleteChild(index) {
        console.log('[record] Deleting child from Record module'); // レコードモジュールから子要素を削除するログ
        // 子要素を削除するためのメソッド
        this.child[index].delete(); // 指定されたインデックスの子要素を削除
        this.child.splice(index, 1); // 指定されたインデックスの子要素を削除
        this.rerender(); // レコードを再レンダリング
    }
}