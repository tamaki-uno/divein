/**
 * UI初期化モジュール
 * - ヘッダー、ポップアップ、メイン領域の初期化関数を提供
 */

import Header from './ui/header.js';
import Popup from './ui/popup.js';
import Line from './ui/line.js';

/**
 * ヘッダーの初期化
 * @returns {Header} Headerインスタンス
 */
export function initHeader() {
    return new Header();
}

let popupInstance = null;
/**
 * ポップアップの初期化
 * @returns {Popup} Popupインスタンス
 */
export function initPopup() {
    if (!popupInstance) {
        popupInstance = new Popup();
    } else {
        popupInstance.showFormForCurrentPath();
    }
    return popupInstance;
}

/**
 * メイン領域の初期化
 * - ユーザーデータを元にLineインスタンスを生成し、main要素に描画
 * - Lineの非同期初期化に対応
 * @param {Object} userData - 認証済みユーザーデータ
 */
export function initMain(userData) {
    const main = document.querySelector('main');
    if (main && userData && userData.user && userData.user.uuid) {
        main.innerHTML = ''; // 追加: 既存の内容をクリア
        const line = new Line(userData.user.uuid);
        // Lineインスタンスがreadyプロパティを持つ場合は非同期描画
        if (line.ready && typeof line.ready.then === 'function') {
            line.ready.then(() => {
                main.appendChild(line.render());
            });
        } else {
            main.appendChild(line.render());
        }
    } else {
        console.error('ユーザーデータまたはUUIDが無効です:', userData);
    }
}

// 他モジュール用エクスポート
export { Header, Popup, Line };
