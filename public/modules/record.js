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
        this.uuid = uuid; // ユーザーのUUIDを設定
        this.HTML_URL = '/modules/ui/html/record.html'; // レコードHTMLのURL
        this.isOpen = false; // レコードの開閉状態を管理)
        this.child = []; // 子要素を管理する配列
        this.init(parentNode).then(() => this.render()); // 初期化とレンダリングを実行
        syncWithAPI(uuid).then(() => this.rerender()); // レコードの同期後に再レンダリング
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
            this.initHtml(); // HTMLを初期化
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
                const doc = new DOMParser().parseFromString(html, 'text/html'); // HTMLをパース
                this.html = doc.querySelector('.record-container'); // レコードコンテナを取得
                // console.log(this.html); // HTMLの内容をログ出力
                console.log('[record] HTML fetched successfully:', this.html); // HTML取得成功ログ
                return this.html; // レコードのHTML要素を返す
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
    initHtml() {
        console.log('[record] Initializing HTML for Record module'); // HTML初期化ログ
        if (!this.html) this.fetchHtml(); // HTMLが未取得の場合は取得を試みる
        this.html.id = this.uuid; // HTMLにUUIDを設定
        // イベントリスナーを設定
        this.html.querySelector('.toggle-icon').addEventListener('click', (e) => this.toggle(e)); // トグルアイコンのクリックイベントを設定
        this.html.querySelector('.toggle-icon').addEventListener('contextmenu', (e) => this.menu(e)); // トグルアイコンの右クリックイベントを設定
        this.html.querySelector('.record-content').addEventListener('click', (e) => this.edit(e)); // レコード内容のクリックイベントを設定
        this.html.querySelector('.record-content').addEventListener('contextmenu', (e) => this.menu(e)); // レコード内容の右クリックイベントを設定
        this.html.querySelector('.delete-icon').addEventListener('click', (e) => this.delete(e)); // 削除アイコンのクリックイベントを設定
        this.html.querySelector('.add-icon').addEventListener('click', (e) => this.addChild(e)); // 子要素追加アイコンのクリックイベントを設定
        console.log('[record] HTML initialized:', this.html); // 初期化されたHTMLの内容をログ出力
        return this.html; // HTMLを返す
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
        // return this.parentNode.insertAdjacentHTML('beforeend', this.html); // HTMLを親ノードに挿入
        return this.parentNode.appendChild(this.html); // HTMLを親ノードに追加
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
        // return document.getElementById(this.uuid).innerHTML = this.html.innerHTML; // HTMLの内容を更新
        // return document.getElementById(this.uuid).
        const targetDiv = document.getElementById(this.uuid); // レコードのHTML要素を取得
        const target = targetDiv.querySelector('.record-content'); // レコード内容の要素を取得
        return target.innerHTML = this.html.querySelector('.record-content').innerHTML; // レコード内容を更新
    }
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
        // if (this.isOpen) {
        //     this.isOpen = false; // 開閉状態を更新
        //     this.html.querySelector('.toggle-icon').src = '/icon/closed.svg'; // トグルアイコンを閉じた状態に更新
        //     this.html.querySelector('.children-container').style.display = 'none'; // 子要素を非表示にする
        // } else {
        //     this.isOpen = true; // 開閉状態を更新
        //     this.html.querySelector('.toggle-icon').src = '/icon/open.svg'; // トグルアイコンを開いた状態に更新
        //     this.html.querySelector('.children-container').style.display = 'flex'; // 子要素を表示する
        // }
        this.isOpen ? this.close() : this.open(); // 開閉状態に応じて開く/閉じる
        this.rerender(); // レコードを再レンダリング
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
        // this.child.push(new Record(this.uuid, this.html.querySelector('.children-container'))); // 子要素を追加
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