import route from '../router.js'; // ルーティング関数をインポート

/** * ヘッダーの初期化
 * - ユーザーのログイン状態に応じてアイコンを切り替え
 * - アイコンクリックでログイン/設定ページへ遷移
 * * @returns {void}
 */
export default function initHeader() {
    console.log('[ui] Initializing header'); // ヘッダー初期化ログ
    const user = sessionStorage.getItem('user'); // セッションストレージからユーザーデータを取得
    const header = document.querySelector('header'); // ヘッダー要素を取得
    // clickイベントリスナーを設定
    header.querySelector('.user-icon').addEventListener('click', (e) => {
    // header.querySelector('.user-icon').addEventListener('hover', (e) => {
        e.preventDefault(); // デフォルトのリンク動作を防ぐ
        console.log('[ui] User icon clicked'); // ユーザーアイコンクリックログ
        if (user) {
            route('/settings'); // 設定ページへ遷移
        } else {
            route('/login'); // ログインページへ遷移
        }
    });
    header.querySelector('.user-icon').addEventListener('mouseover', (e) => {
        e.preventDefault(); // デフォルトのリンク動作を防ぐ
        console.log('[ui] User icon hovered'); // ユーザーアイコンホバー時のログ
        if (user) {
            header.querySelector('.user-icon').title = 'Open settings'; // ツールチップを設定
            // route('/settings'); // 設定ページへ遷移
        } else {
            header.querySelector('.user-icon').title = 'Login'; // ツールチップを設定
        }
    });

    header.querySelector('.user-icon').alt = user ? 'Open settings' : 'Login'; // アイコンのalt属性を設定
    header.querySelector('.user-icon').src = user ? '/icon/open.svg' : '/icon/closed.svg'; // アイコンの切り替え
}