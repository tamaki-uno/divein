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
    console.log('[ui] Initializing header'); // ヘッダー初期化ログ
    const user = sessionStorage.getItem('user'); // セッションストレージからユーザーデータを取得
    const header = document.querySelector('header'); // ヘッダー要素を取得
    // clickイベントリスナーを設定
    header.querySelector('.user-icon-container').addEventListener('click', (e) => {
        e.preventDefault(); // デフォルトのリンク動作を防ぐ
        console.log('[ui] User icon clicked'); // ユーザーアイコンクリックログ
        if (user) {
            route('/settings'); // 設定ページへ遷移
        } else {
            route('/login'); // ログインページへ遷移
        }
    });
    header.querySelector('.user-icon').src = user ? '/icon/open.svg' : '/icon/closed.svg'; // アイコンの切り替え
}

// ポップアップインスタンス（シングルトン）
let popupInstance = null;
/**
 * ポップアップの初期化（シングルトン）
 * @returns {Popup} Popupインスタンス
 */
export function initPopup() {
    console.log('[ui] Initializing popup'); // ポップアップ初期化ログ
    if (!popupInstance) {
        popupInstance = new Popup();
    } else {
        popupInstance.showFormForCurrentPath();
    }
    return popupInstance;
}

export function initSettings() {
    console.log('[ui] Initializing settings UI'); // 設定UI初期化
    const main = document.querySelector('main'); // メイン要素を取得
    main.innerHTML = ''; // メイン要素の内容をクリア

/**
 * メイン領域の初期化
 * - ユーザーデータを元にLineインスタンスを生成し、main要素に描画
 * - Lineの非同期初期化に対応
 * @param {Object} userData - 認証済みユーザーデータ
 */
export function initMain() {
    const user = JSON.parse(sessionStorage.getItem('user')); // セッションストレージからユーザーデータを取得
    console.log('[ui] Initializing main UI'); // メインUI初期化ログ
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
