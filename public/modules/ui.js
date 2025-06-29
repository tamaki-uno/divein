/**
 * UI初期化モジュール
 * - ヘッダー、ポップアップ、メイン領域の初期化関数を提供
 */

console.log('[ui] module loaded'); // モジュール読み込みログ

// import { route } from '../router/router.js';
import route from '/modules/router.js';

// import Header from './ui/header.js';
import Popup from './ui/popup.js';
import Line from './ui/line.js';


/** * ヘッダーの初期化
 * - ユーザーのログイン状態に応じてアイコンを切り替え
 * - アイコンクリックでログイン/設定ページへ遷移
 * * @returns {void}
 */
export function initHeader() {
    const header = document.querySelector('header');
    const userIcon = header.querySelector('.user-icon');
    if (window.user) {
        // ユーザーがログインしている場合
        userIcon.src = `/icon/open.svg`;
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            route('/settings');
        });
    } else {
        // ユーザーが未ログインの場合
        userIcon.src = '/icon/closed.svg';
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            route('/login');
        });
    }
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
export function initMain(uuid) {
    const main = document.querySelector('main');
    main.innerHTML = '';
    main.innerText = `loading... \n uuid: ${uuid}\n`; 
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
