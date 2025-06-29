/**
 * ルーティング制御モジュール
 * - ページパスに応じてUI初期化や認証チェックを行う
 */

console.log('[router] module loaded'); // モジュール読み込みログ

// import { initHeader, initPopup, initSettings, initMain } from './ui.js';
// import initPopup from './ui/popup.js';
import initHeader from './ui/header.js';
import { showLoading } from './ui/loading.js';
import { showPopup } from './ui/popup.js';
import { showSettings } from './ui/setting.js';
import initMain from './ui/main.js';

// 認証不要ページのパス一覧
const PUBLIC_PATHS = ['/login', '/signup', '/logout'];

/**
 * 指定パスに応じてUIや認証状態を制御する
 * @param {string} path - 遷移先パス
 */
export default async function route(path, options = {reload: false, overwrite: false}) {
    console.log(`[router] route called. path: ${path}`); // ルーティング開始ログ

    // リロードフラグが立っている場合はページをリロード
    if (options.reload) {
        console.log('[router] Reloading page due to reload flag'); // リロードフラグログ
        window.location.pathname = path; // パスを更新してリロード
        return;
    } else {
        if (options.overwrite) {
            // overwriteがtrueの場合は履歴を上書き
            window.history.replaceState({}, '', path);
        } else {
            // 通常の履歴追加
            window.history.pushState({}, '', path);
        }
    }

    initHeader(); // ヘッダーを初期化
    showLoading(); // ローディングUIを表示

    if (sessionStorage.getItem('user')) {
        // ユーザーが認証済みの場合はメインUIを初期化
        console.log(`[router] User authenticated, initializing main UI for path: ${path}`); // 認証済みユーザーログ
        // initMain(); // メインUIを初期化
        switch (path) {
            case '/':
                initMain(); // ホームページを初期化
                break; // ホームページは特に何もしない
            case '/settings':
                showSettings(); // 設定ページを表示
                break;
            case '/login':
            case '/signup':
                break; // ログイン/サインアップページは特に何もしない
            case '/logout':
                // initPopup(); // ログアウトポップアップを初期化
                showPopup(); // ログアウトポップアップを表示
                break;
            default:
                // console.warn(`[router] Unhandled path for authenticated user: ${path}`); // 未処理パスログ
                // route('/'); // ホームページへリダイレクト
                showLoading(); // ローディングUIを表示
                break;
        }
        return;
    } else if (PUBLIC_PATHS.includes(path)) {
        // 認証不要ページの場合はポップアップのみ初期化
        console.log(`[router] Public path detected: ${path}`); // 認証不要ページログ
        // initPopup();
        showPopup(); // ポップアップを表示
        return;
    } else {
        // 認証が必要なページでユーザーが未認証の場合はログインページへリダイレクト
        console.warn(`[router] User not authenticated, redirecting to login for path: ${path}`);
        route('/login', {reload: false, overwrite: true}); // ログインページへリダイレクト
        return;
    }
}
