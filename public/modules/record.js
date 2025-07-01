import { getRecordFromIndexedDB, getRecordFromAPI, syncRecord, saveRecordToIndexedDB } from "./database.js";

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
     * @param {string} html - レコードのHTML
     * @param {HTMLElement} parentNode - レコードを挿入する親ノード
     * @constructor
     */
    constructor(record, { html = '', parentNode, delete: deleteCallback }) {
        console.log('[record] Record module initialized'); // レコードモジュール初期化ログ
        this.setRecord(record); // レコードデータを設定
        this.html = html; // レコードのHTMLを設定
        this.parentNode = parentNode; // レコードを挿入する親ノードを設定
        this.childInstances = []; // 子要素のインスタンスを格納する配列
        this.isOpen = false; // レコードの開閉状態を管理
        this.getRender(); // レコードを同期してレンダリング
    }
    setRecord(record) {
        this.record = {
            ...record,
            children: parseJsonArray(record.children),
            permissionRead: parseJsonArray(record.permissionRead),
            permissionWrite: parseJsonArray(record.permissionWrite)
        };
    }
    /**
     * レコードのHTMLを初期化
     * - HTMLが未取得の場合はfetchHtmlを呼び出す
     * - HTMLにUUIDを設定
     * @returns {HTMLElement} - レコードのHTML要素
     */
    initHtml() {
        console.log('[record] Initializing HTML for Record module'); // HTML初期化ログ
        if (this.recordContainer) return this.recordContainer; // レコードコンテナが既に存在する場合はそのまま返す
        const parser = new DOMParser(); // DOMParserを使用してHTMLをパース
        this.node = parser.parseFromString(this.html, 'text/html'); // HTMLをパースしてノードを取得
        this.recordContainer = document.getElementById(this.record.uuid) || this.node.querySelector('.record-container'); // レコードコンテナを取得または新規作成
        this.parentNode.appendChild(this.recordContainer); // 親ノードにレコードコンテナを追加
        //
        this.recordContainer.id = this.record.uuid; // レコードコンテナのIDをUUIDに設定
        this.querySelector = (selector) => this.recordContainer.querySelector(selector); // HTML要素のクエリセレクタを設定
        this.querySelectorAll = (selector) => this.recordContainer.querySelectorAll(selector); // HTML要素のクエリセレクタを設定
        // イベントリスナーを設定
        this.querySelector('.toggle-icon').addEventListener('click', (e) => this.toggle(e)); // トグルアイコンのクリックイベントを設定
        this.querySelector('.toggle-icon').addEventListener('contextmenu', (e) => this.menu(e)); // トグルアイコンの右クリックイベントを設定
        this.querySelector('.record-content').addEventListener('click', (e) => this.edit(e)); // レコード内容のクリックイベントを設定
        this.querySelector('.record-content').addEventListener('contextmenu', (e) => this.menu(e)); // レコード内容の右クリックイベントを設定
        // this.querySelector('.delete-icon').addEventListener('click', (e) => this.delete(e)); // 削除アイコンのクリックイベントを設定
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
        this.initHtml(); // HTMLを初期化
        this.querySelector('.record-content').innerText = this.record?.content || 'Loading...'; // レコード内容を設定
        try{
        this.record.children.forEach(childUuid => {
            if (this.childInstances.some(child => child.record.uuid === childUuid)) return; // 既に子要素が存在する場合はスキップ
            const childRecord = { uuid: childUuid, type: 'text', content: 'Loading...' }; // 子要素のレコードを作成
            const childParams = this.createChildParams(); // 子要素のパラメータを作成
            const childInstance = new Record(childRecord, childParams); // 子要素のインスタンスを作成
            this.childInstances.push(childInstance); // 子要素のインスタンスを配列に追加
            this.querySelector('.children-container').appendChild(childInstance); // 子要素をレンダリングして追加
        });
        } catch (error) {
            console.error('[record] Error rendering children:', error); // 子要素レンダリングエラーをログ出力
        }
        return this.recordContainer; // レコードのHTML要素を返す
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
            // getRecordFromIndexedDB(this.record.uuid) // IndexedDBからレコードを取得
            saveRecordToIndexedDB(this.record) // IndexedDBにレコードを保存
                .then(record => {
                    this.setRecord(record); // 取得したレコードを設定
                    console.log('[record] Record fetched from IndexedDB:', this.record); // IndexedDB取得成功ログ
                    resolve(this.render()); // レコードをレンダリング
                })
                .catch(error => {
                    console.error('Error fetching Record from IndexedDB:', error); // IndexedDB取得エラーをログ出力
                    reject(error); // エラーを拒否
                });
        });
        const renderAPI = new Promise((resolve, reject) => {
            // getRecordFromAPI(this.record.uuid)
            syncRecord(this.record) // APIと同期してレコードを取得
                .then(record => {
                    this.setRecord(record); // 取得したレコードを設定
                    console.log('[record] Record synced with API:', this.record); // API同期成功ログ
                    resolve(this.render()); // レコードをレンダリング
                })
                .catch(error => {
                    console.error('Error syncing Record with API:', error); // API同期エラーをログ出力
                    reject(error); // エラーを拒否
                });
        });
        return Promise.all([this.render(), renderIndexedDB, renderAPI]) // レコードのレンダリングとIndexedDB、API同期を同時に実行
            .then(() => {
                console.log('[record] Record module rendered successfully'); // レコードモジュールレンダリング成功ログ
                return this.recordContainer; // レコードのHTML要素を返す
            })
            .catch(error => {
                console.error('[record] Error rendering Record module:', error); // レコードモジュールレンダリングエラーをログ出力
                throw error; // エラーをスロー
            });
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
        this.querySelector('.toggle-icon').src = '/icon/open.svg'; // トグルアイコンを開いた状態に更新
        this.querySelector('.children-container').style.display = 'flex'; // 子要素を表示する
        this.childInstances.forEach(child => child.render()); // 子要素をレンダリング
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
        this.querySelector('.toggle-icon').src = '/icon/closed.svg'; // トグルアイコンを閉じた状態に更新
        this.querySelector('.children-container').style.display = 'none'; // 子要素を非表示にする
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
     * 子要素のレコードを作成
     * - 子要素のレコードを作成するためのメソッド
     * @returns {Object} - 作成された子要素のレコード
     * @async
     */
    createChildRecord() {
        console.log('[record] Creating child record'); // 子要素のレコード作成
        const childUuid = crypto.randomUUID(); // 子要素のUUIDを生成
        const user = JSON.parse(sessionStorage.getItem('user')); // セッションストレージからユーザーデータを取得
        return {
            uuid: childUuid, // 子要素のUUID
            type: 'text', // 子要素のタイプ（初期はテキスト）
            content: 'Type something...', // 子要素の内容（初期は空）
            children: [], // 子要素の配列を初期化
            permissionRead: [user.uuid], // 読み取り権限にユーザーのUUIDを追加
            permissionWrite: [user.uuid], // 書き込み権限にユーザーのUUIDを追加
            createdBy: user.uuid, // 作成者のUUIDを設定
            updatedBy: user.uuid, // 更新者のUUIDを設定
            createdAt: new Date().toISOString(), // 作成日時をISO形式で設定
            updatedAt: new Date().toISOString(), // 更新日時をISO形式で設定
        };
    }
    /**
     * 子要素のインスタンスを追加
     * - 子要素のレコードを受け取り、子要素のインスタンスを作成する
     * @param {Object} record - 子要素のレコード
     * @returns {Record} - 作成された子要素のインスタンス
     */
    addChildInstance(record) {
        console.log('[record] Adding child instance to this.childInstances'); // 子要素のインスタンス追加ログ
        const params = {
            html: this.html, // 親レコードのHTMLを継承
            parentNode: this.querySelector('.children-container'), // 子要素を挿入する親ノード
            delete: this.deleteChild.bind(this) // 子要素削除メソッドをバインド
        }
        const childInstance = new Record(record, params); // 子要素のインスタンスを作成
        this.childInstances.push(childInstance); // 子要素のインスタンスを配列に追加
        return childInstance; // 作成された子要素のインスタンスを返す
    }
    /**
     * レコードモジュールに子要素を追加
     * - 子要素を追加するためのメソッド
     * @param {Event} event - クリックイベント
     * @returns {void}
     */
    async addChild(event) {
        console.log('[record] Adding child to Record module'); // レコードモジュールに子要素を追加するログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        this.open(); // レコードを開く
        const childRecord = this.createChildRecord(); // 子要素のレコードを作成
        console.log('[record] Child record created:', childRecord); // 子要素のレコード作成ログ
        this.addChildInstance(childRecord); // 子要素のインスタンスを追加
        this.record.children.push(childRecord.uuid); // 親レコードの子要素配列に子要素のUUIDを追加
        return await syncRecord(this.record) // 親レコードをAPIと同期
            .then((syncedRecord) => {
                console.log('[record] Child added successfully:', syncedRecord); // 子要素追加成功ログ
                return this.getRender(); // レコードを再レンダリング
            })
            .catch(error => {
                console.error('[record] Error adding child:', error); // 子要素追加エラーをログ出力
                throw error; // エラーをスロー
            });
    }
    /**
     * レコードモジュールから子要素を削除
     * - 指定されたインデックスの子要素を削除するためのメソッド
     * @param {number} index - 削除する子要素のインデックス
     * @returns {void}
     */
    deleteChild(event) {
        console.log('[record] Deleting child from Record module'); // レコードモジュールから子要素を削除するログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        const targetContainer = event.target.closest('.record-container'); // イベントターゲットの最も近いレコードコンテナを取得
        const targetUuid = targetContainer.id; // ターゲットのUUIDを取得
        console.log(`[record] Deleting child with UUID: ${targetUuid}`); // 削除する子要素のUUIDをログに出力
        targetContainer.remove(); // ターゲットのHTML要素を親ノードから削除
        this.childInstances = this.childInstances.filter(child => child.record.uuid !== targetUuid); // 子要素のインスタンスをフィルタリングして削除
        this.record.children = this.record.children.filter(uuid => uuid !== targetUuid); // 親レコードの子要素配列から削除
        const syncedRecord = syncRecord(this.record) // 親レコードをAPIと同期
            .then(() => {
                console.log('[record] Child deleted successfully:', targetUuid); // 子要素削除成功ログ
                return this.getRender(); // レコードを再レンダリング
            })
            .catch(error => {
                console.error('[record] Error deleting child:', error); // 子要素削除エラーをログ出力
                throw error; // エラーをスロー
            });
        // ゴミ箱に入れるを将来的に実装
        return syncedRecord; // 同期した親レコードを返す
    }
}

/**
 * 空文字列やnullでも安全に配列を返すユーティリティ
 * - 文字列がJSON形式の配列であればパースして返す
 * - それ以外は空の配列を返す
 * @param {any} val - 入力値
 * @returns {Array} - パースされた配列または空の配列
 */
function parseJsonArray(val) {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') {
        try {
            return JSON.parse(val);
        } catch {
            return [];
        }
    }
    return [];
}