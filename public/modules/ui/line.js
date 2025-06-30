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
    constructor(uuid, html, parentNode, level) {
        console.log('[line] Initializing Line module'); // Lineモジュール初期化ログ
        super(uuid, html, parentNode); // 親クラスのコンストラクタを呼び出す
        this.level = level; // レベルを設定
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
    /**
     * 子要素を追加する
     * - 子要素のUUIDを生成し、Recordインスタンスを作成
     * - レベルを親のレベル+1に設定
     * @param {Event} event - イベントオブジェクト
     */
    addChild(event) {
        console.log('[line] Adding child to Line module'); // 子要素追加ログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        // 子要素のUUIDを生成
        const childUuid = crypto.randomUUID(); // 子要素のUUIDを生成
        console.log(`[line] Creating new Line child with UUID: ${childUuid} html: ${this.html} parentNode: ${this.parentNode} level: ${this.level + 1}`); // 子要素のUUIDをログに出力

        this.child.push(
            new Record(
                childUuid,
                this.html, // LineのHTMLを使用
                this.querySelector('.children-container'),
                this.level + 1 // 子要素のレベルを親のレベル+1に設定
            ) // 子要素を追加
        )
        this.open(); // レコードを開く
    }
}