/**
 * ルーティング制御モジュール
 * - ページパスに応じてUI初期化や認証チェックを行う
 */

console.log('[router] module loaded'); // モジュール読み込みログ

import { initHeader, initPopup, initMain } from './ui.js';

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

    // ヘッダー初期化
    initHeader();

    if (sessionStorage.getItem('user')) {
        const user = JSON.parse(sessionStorage.getItem('user')); // セッションストレージからユーザーデータを取得
        // ユーザーが認証済みの場合はメインUIを初期化
        console.log(`[router] User authenticated, initializing main UI for path: ${path}`); // 認証済みユーザーログ
        initMain(user.uuid); // ユーザーUUIDを使ってメインUIを初期化
        return;
    } else if (PUBLIC_PATHS.includes(path)) {
        // 認証不要ページの場合はポップアップのみ初期化
        console.log(`[router] Public path detected: ${path}`); // 認証不要ページログ
        initPopup();
        return;
    } else {
        // 認証が必要なページでユーザーが未認証の場合はログインページへリダイレクト
        console.warn(`[router] User not authenticated, redirecting to login for path: ${path}`);
        route('/login', {reload: false, overwrite: true}); // ログインページへリダイレクト
        return;
    }
}
