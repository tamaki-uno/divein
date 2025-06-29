/**
 * UI初期化モジュール
 * - ヘッダー、ポップアップ、メイン領域の初期化関数を提供
 */

import Header from './ui/header.js';
import Popup from './ui/popup.js';
import Line from './ui/line.js';

// ヘッダーインスタンス（シングルトン）
let headerInstance = null;
/**
 * ヘッダーの初期化（シングルトン）
 * @returns {Header} Headerインスタンス
 */
export function initHeader() {
    if (!headerInstance) {
        headerInstance = new Header();
    }
    return headerInstance;
}

// ポップアップインスタンス（シングルトン）
let popupInstance = null;
/**
 * ポップアップの初期化（シングルトン）
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
export function initMain(userRecord) {
    const main = document.querySelector('main');
    // ユーザーデータが不正ならログイン画面へ遷移
    if (!(main && userRecord && userRecord.uuid && userRecord.content)) {
        console.warn('Invalid user data, redirecting to login');
        window.location.href = '/login';
        return;
    }
    main.innerHTML = '';
    // const line = new Line(userData.user.uuid);
    // // Lineインスタンスがreadyプロパティを持つ場合は非同期描画
    // if (line.ready && typeof line.ready.then === 'function') {
    //     line.ready.then(() => {
    //         main.appendChild(line.render());
    //     });
    // } else {
    //     main.appendChild(line.render());
    // }
}
