import route from '../router.js'; // ルーティング関数をインポート

/** * ユーザーアイコンを設定する関数
 * - ユーザーアイコンのクリックイベントを設定
 * - ユーザーがログインしているかどうかでアイコンを切り替え
 * - ユーザーがログインしている場合は設定ページへ、そうでない場合はログインページへ遷移
 * - ホバー時にツールチップを表示
 * @returns {void}
 */
export default function setUserIcon() {
    console.log('[ui] Initializing header'); // ヘッダー初期化ログ
    const user = sessionStorage.getItem('user'); // セッションストレージからユーザーデータを取得
    // clickイベントリスナーを設定
    const userIcon = document.getElementById('user-icon'); // ユーザーアイコン要素を取得
    userIcon.addEventListener('click', (e) => {
        e.preventDefault(); // デフォルトのリンク動作を防ぐ
        console.log('[ui] User icon clicked'); // ユーザーアイコンクリックログ
        if (user) {
            route('/settings'); // 設定ページへ遷移
        } else {
            route('/login'); // ログインページへ遷移
        }
    });
    userIcon.addEventListener('mouseover', (e) => {
        e.preventDefault(); // デフォルトのリンク動作を防ぐ
        console.log('[ui] User icon hovered'); // ユーザーアイコンホバー時のログ
        if (user) {
            header.querySelector('.user-icon').title = 'Open settings'; // ツールチップを設定
            // route('/settings'); // 設定ページへ遷移
        } else {
            header.querySelector('.user-icon').title = 'Login'; // ツールチップを設定
        }
    });
    userIcon.alt = user ? 'Open settings' : 'Login'; // アイコンのalt属性を設定
    userIcon.src = user ? '/icon/open.svg' : '/icon/closed.svg'; // アイコンの切り替え
}