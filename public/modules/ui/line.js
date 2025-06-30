import Record from '../record.js';

/* * Lineモジュール
 * - レコードのレベルを管理し、子要素を追加する機能を提供
 * - 親クラスRecordを継承
 * - HTMLの初期化と子要素の追加を行う
 */
export default class Line extends Record {
    /**
     * コンストラクタ
     * @param {string} uuid - ユーザーのUUID
     * @param {string} html - レコードのHTML
     * @param {HTMLElement} parentNode - レコードを挿入する親ノード
     * @param {number} level - レコードのレベル
     */
    constructor(record, params) {
        console.log('[line] Initializing Line module'); // Lineモジュール初期化ログ
        super(record, {html: params.html, parentNode: params.parentNode, delete: params.delete}); // 親クラスRecordのコンストラクタを呼び出す
        this.level = params.level; // レベルを設定、デフォルトは0
    }
    /**
     * HTMLを初期化して返す
     * - レコードコンテナにレベルクラスを追加
     * @returns {HTMLElement} - レコードのHTML要素
     */
    initHtml() {
        console.log('[line] Initializing HTML for Line module'); // LineモジュールのHTML初期化ログ
        super.initHtml();
        this.recordContainer.classList.add('level-' + this.level); // レコードコンテナにレベルクラスを追加
        return this.recordContainer; // レコードコンテナを返す
    }
    createChildParams() {
        console.log('[line] Creating child parameters for Line module'); // 子要素のパラメータ作成ログ
        return {
            html: this.html, // HTMLを継承
            parentNode: this.recordContainer, // 親ノードはレコードコンテナ
            delete: this.delete, // 削除機能を継承
            level: this.level + 1 // レベルを1つ上げて子要素のレベルを設定
        };
    }
}