/**
 * ルーティング制御モジュール
 * - ページパスに応じてUI初期化や認証チェックを行う
 */

import { showLoading } from './ui/loading.js';
import setUserIcon from './ui/userIcon.js';
import initMain from './ui/main.js';
import { showPopup } from './ui/popup.js';
import { showSettings } from './ui/setting.js';

// 認証不要ページのパス一覧
const PUBLIC_PATHS = ['/login', '/signup', '/logout'];

/**
 * 指定パスに応じてUIや認証状態を制御する
 * @param {string} path - 遷移先パス
 * @param {Object} [options={overwrite: false, reload: false}] - オプション設定
 * @param {boolean} [options.overwrite=false] - trueなら履歴を上書き、falseなら新規履歴を追加
 * @param {boolean} [options.reload=false] - trueならページをリロード、falseならリロードしない
 * @returns {Promise<void>} - 非同期処理の完了を示すPromise
 * @async
 * @description
 * - ページパスに応じてヘッダーやメインUIを初期化
 * - 認証状態に応じて適切なUIを表示
 */
export default async function route(path, options = {overwrite: false, reload: false}) {
    console.log(`[router] route called. path: ${path}`);

    if (options.overwrite) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    if (options.reload)  window.location.reload();

    showLoading(); // ローディングUIを表示
    setUserIcon(); // ヘッダーを初期化

    if (sessionStorage.getItem('user')) {
        // ユーザーが認証済みの場合はメインUIを初期化
        console.log(`[router] User authenticated, initializing main UI for path: ${path}`); // 認証済みユーザーログ
        switch (path) {
            case '/':
                initMain();
                break;
            case '/login':
            case '/signup':
            case '/logout':
                showPopup();
                break;
            case '/settings':
                showSettings();
                break;
            default:
                console.warn(`[router] Unhandled path for authenticated user: ${path}`); // 未処理のパスログ
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
