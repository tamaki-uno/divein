import { syncRecord, saveRecordToIndexedDB } from "./database.js";

/**
 * レコード親クラス
 * - ユーザーのレコードを管理
 * - IndexedDBからレコードを取得・保存
 * - レコードの同期とレンダリングを行う
 * @class
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
        this.setRecord(record);
        this.html = html;
        this.parentNode = parentNode;
        this.childInstances = [];
        this.isOpen = false;
        this.getRender();
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
        if (this.recordContainer) return this.recordContainer;
        const parser = new DOMParser();
        this.node = parser.parseFromString(this.html, 'text/html');
        this.recordContainer = document.getElementById(this.record.uuid) || this.node.querySelector('.record-container');
        this.parentNode.appendChild(this.recordContainer);
        this.recordContainer.id = this.record.uuid;
        this.querySelector = (selector) => this.recordContainer.querySelector(selector);
        this.querySelectorAll = (selector) => this.recordContainer.querySelectorAll(selector);
        this.querySelector('.toggle-icon').addEventListener('click', (e) => this.toggle(e));
        this.querySelector('.toggle-icon').addEventListener('contextmenu', (e) => this.menu(e));
        this.querySelector('.record-content').addEventListener('click', (e) => this.edit(e));
        this.querySelector('.record-content').addEventListener('contextmenu', (e) => this.menu(e));
        // this.querySelector('.delete-icon').addEventListener('click', (e) => this.delete(e));
        this.querySelector('.add-icon').addEventListener('click', (e) => this.addChild(e));
        return this.recordContainer;
    }
    /**
     * レコードをレンダリング
     * @returns {HTMLElement} - レコードのHTML要素
     * @async
     */
    render() {
        this.initHtml();
        this.querySelector('.record-content').innerText = this.record?.content || 'Loading...';
        try {
            this.record.children.forEach(childUuid => {
                if (this.childInstances.some(child => child.record.uuid === childUuid)) return;
                const childRecord = { uuid: childUuid, type: 'text', content: 'Loading...' };
                const childParams = this.createChildParams();
                const childInstance = new Record(childRecord, childParams);
                this.childInstances.push(childInstance);
                this.querySelector('.children-container').appendChild(childInstance);
            });
        } catch (error) {
            console.error('[record] Error rendering children:', error);
        }
        return this.recordContainer;
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
        const renderIndexedDB = saveRecordToIndexedDB(this.record)
            .then(record => {
                this.setRecord(record);
                return this.render();
            })
            .catch(error => {
                console.error('Error fetching Record from IndexedDB:', error);
                throw error;
            });
        const renderAPI = syncRecord(this.record)
            .then(record => {
                this.setRecord(record);
                return this.render();
            })
            .catch(error => {
                console.error('Error syncing Record with API:', error);
                throw error;
            });
        return Promise.all([this.render(), renderIndexedDB, renderAPI])
            .then(() => this.recordContainer)
            .catch(error => {
                console.error('[record] Error rendering Record module:', error);
                throw error;
            });
    }
    /**
     * レコードを開く
     * - 開閉状態を更新
     * - トグルアイコンを開いた状態に更新
     * - 子要素を表示する
     * - 子要素をレンダリング
     * @returns {void}
     */
    open() {
        this.isOpen = true;
        this.querySelector('.toggle-icon').src = '/icon/open.svg';
        this.querySelector('.children-container').style.display = 'flex';
        this.childInstances.forEach(child => child.render());
    }
    /**
     * レコードを閉じる
     * - 開閉状態を更新
     * - トグルアイコンを閉じた状態に更新
     * - 子要素を非表示にする
     * @returns {void}
     */
    close() {
        this.isOpen = false;
        this.querySelector('.toggle-icon').src = '/icon/closed.svg';
        this.querySelector('.children-container').style.display = 'none';
    }
    /**
     * レコードの編集
     * - レコード内容をクリックしたときに編集モードにする
     * @param {Event} event - クリックイベント
     * @returns {void}
     */
    toggle(event) {
        event.preventDefault();
        this.isOpen ? this.close() : this.open();
    }
    /**
     * レコードのコンテキストメニュー
     * - 右クリックでメニューを表示
     * @param {Event} event - 右クリックイベント
     * @returns {void}
     */
    menu(event) {
        event.preventDefault();
        alert('Context menu is not implemented yet.');
    }
    /**
     * レコードの編集
     * - レコード内容をクリックしたときに編集モードにする
     * @param {Event} event - クリックイベント
     * @returns {void}
     */
    edit(event) {
        event.preventDefault();
    }
    /**
     * 子要素のレコードを作成
     * - 子要素のレコードを作成するためのメソッド
     * @returns {Object} - 作成された子要素のレコード
     * @async
     */
    createChildRecord() {
        const childUuid = crypto.randomUUID();
        const user = JSON.parse(sessionStorage.getItem('user'));
        return {
            uuid: childUuid,
            type: 'text',
            content: 'Type something...',
            children: [],
            permissionRead: [user.uuid],
            permissionWrite: [user.uuid],
            createdBy: user.uuid,
            updatedBy: user.uuid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    /**
     * 子要素のインスタンスを追加
     * - 子要素のレコードを受け取り、子要素のインスタンスを作成する
     * @param {Object} record - 子要素のレコード
     * @returns {Record} - 作成された子要素のインスタンス
     */
    addChildInstance(record) {
        const params = {
            html: this.html,
            parentNode: this.querySelector('.children-container'),
            delete: this.deleteChild.bind(this)
        }
        const childInstance = new Record(record, params);
        this.childInstances.push(childInstance);
        return childInstance;
    }
    /**
     * レコードモジュールに子要素を追加
     * - 子要素を追加するためのメソッド
     * @param {Event} event - クリックイベント
     * @returns {void}
     */
    async addChild(event) {
        event.preventDefault();
        this.open();
        const childRecord = this.createChildRecord();
        this.addChildInstance(childRecord);
        this.record.children.push(childRecord.uuid);
        return await syncRecord(this.record)
            .then(() => this.getRender())
            .catch(error => {
                console.error('[record] Error adding child:', error);
                throw error;
            });
    }
    /**
     * レコードモジュールから子要素を削除
     * - 指定されたインデックスの子要素を削除するためのメソッド
     * @param {number} index - 削除する子要素のインデックス
     * @returns {void}
     */
    deleteChild(event) {
        event.preventDefault();
        const targetContainer = event.target.closest('.record-container');
        const targetUuid = targetContainer.id;
        targetContainer.remove();
        this.childInstances = this.childInstances.filter(child => child.record.uuid !== targetUuid);
        this.record.children = this.record.children.filter(uuid => uuid !== targetUuid);
        const syncedRecord = syncRecord(this.record)
            .then(() => this.getRender())
            .catch(error => {
                console.error('[record] Error deleting child:', error);
                throw error;
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