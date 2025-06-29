/**
 * ルーティング制御モジュール
 * - ページパスに応じてUI初期化や認証チェックを行う
 */

console.log('[router] module loaded'); // モジュール読み込みログ
;
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
 * @param {Object} options - オプション設定
 * @param {boolean} options.reload - trueの場合はページをリロード
 * @param {boolean} options.overwrite - trueの場合は履歴を上書き
 * @returns {Promise<void>} - 非同期処理の完了を示すPromise
 * * @async
 * @description
 * - ページパスに応じてヘッダーやメインUIを初期化
 * - 認証状態に応じて適切なUIを表示
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
        switch (path) {
            case '/':
                initMain(); // ホームページを初期化
                break; // ホームページは特に何もしない
            case '/settings':
                showSettings(); // 設定ページを表示
                break;
            case '/login':
            case '/signup':
            case '/logout':
                showPopup(); // ログアウトポップアップを表示
                break;
            default:
                initMain(); // その他のページはメインUIを初期化
                break;
        }
        return;
    } else if (PUBLIC_PATHS.includes(path)) {
        // 認証不要ページの場合はポップアップのみ初期化
        console.log(`[router] Public path detected: ${path}`); // 認証不要ページログ
        showPopup(); // ポップアップを表示
        return;
    } else {
        // 認証が必要なページでユーザーが未認証の場合はログインページへリダイレクト
        console.warn(`[router] User not authenticated, redirecting to login for path: ${path}`);
        route('/login', {reload: false, overwrite: true}); // ログインページへリダイレクト
        return;
    }
}
