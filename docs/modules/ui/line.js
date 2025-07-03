import Record from '../record.js';
import { syncRecord } from '../database.js';

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
        console.log('[line] Initializing Line module with record:', record, 'and params:', params); // Lineモジュールの初期化ログ
        super(record, {html: params.html, parentNode: params.parentNode, delete: params.delete}); // 親クラスRecordのコンストラクタを呼び出す
        this.level = params.level;
        this.recordContainer.classList.add('level-' + this.level); // レコードコンテナにレベルクラスを追加
    }
    /**
     * レコードモジュールに子要素を追加
     * - 子要素を追加するためのメソッド
     * @param {Object} record - 子要素のレコードデータ
     * @returns {Line} - 作成された子要素のインスタンス
     */
    addChildInstance(record) {
        const params = {
            html: this.html, // 親レコードのHTMLを継承
            parentNode: this.querySelector('.children-container'), // 子要素を挿入する親ノード
            delete: this.deleteChild.bind(this), // 子要素削除メソッドをバインド
            level: this.level + 1 // レベルを1つ上げる
        };
        console.log('[line] Creating child instance with params:', params); // 子要素のインスタンス作成パラメータログ
        const childInstance = new Line(record, params); // 子要素のインスタンス
        this.childInstances.push(childInstance); // 子要素のインスタンスを配列に追加
        return childInstance; // 作成された子要素のインスタンスを返す
    }
    edit(event) {
        console.log('[line] Editing Line module'); // Lineモジュールの編集ログ
        event.stopPropagation(); // イベントの伝播を停止
        event.preventDefault(); // デフォルトの動作を防ぐ
        const prevContent = this.querySelector('.record-content').textContent.trim(); // 現在のレコード内容を取得
        this.querySelector('.record-content').contentEditable = true; // レコード内容を編集可能にする
        this.querySelector('.record-content').focus(); // レコード内容にフォーカスを当てる
        this.querySelector('.record-content').addEventListener('blur', () => {
            console.log('[line] Line content edited'); // レコード内容が編集されたログ
            this.querySelector('.record-content').contentEditable = false; // 編集可能を解除
            const content = this.querySelector('.record-content').textContent.trim(); // 編集された内容を取得
            if (content === prevContent) {
                console.log('[line] No changes made to Line content'); // 内容に変更がない場合のログ
                return; // 変更がない場合は何もしない
            }
            this.setRecord({
                ...this.record, // 現在のレコードを取得
                content: this.querySelector('.record-content').textContent // 編集された内容を保存
            })
            syncRecord(this.record)
                .then((record) => {
                    this.setRecord(record); // レコードを更新
                    console.log('[line] Line content updated successfully'); // レコード内容更新成功ログ
                })
                .catch((error) => {
                    console.error('[line] Error updating Line content:', error); // レコード内容更新失敗ログ
                    this.querySelector('.record-content').textContent = prevContent; // 変更を元に戻す
                });
        });
    }
}