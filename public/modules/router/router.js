/**
 * ルーティング制御モジュール
 * - ページパスに応じてUI初期化や認証チェックを行う
 */

import checkAuth from '../auth/auth.js';
import { initHeader, initPopup, initMain } from '../ui.js';

// 認証不要ページのパス一覧
const PUBLIC_PATHS = ['/login', '/signup', '/logout'];

/**
 * 指定パスに応じてUIや認証状態を制御する
 * @param {string} path - 遷移先パス
 */
export function route(path, reload = false, overwrite = false) {
    console.log(`[router] route called. path: ${path}`); // ルーティング開始ログ

    if (reload) {
        console.log('[router] Reloading page due to reload flag'); // リロードフラグログ
        window.location.pathname = path; // パスを更新してリロード
        return;
    } else {
        if (overwrite) {
            // overwriteがtrueの場合は履歴を上書き
            window.history.replaceState({}, '', path);
        } else {
            // 通常の履歴追加
            window.history.pushState({}, '', path);
        }
    }

    // ヘッダー初期化
    initHeader();

    // 認証不要ページの場合はポップアップのみ初期化
    if (PUBLIC_PATHS.includes(path)) {
        console.log(`[router] Public path detected: ${path}`); // 認証不要ページログ
        initPopup();
        return;
    }

    // 認証チェック
    checkAuth()
        .then(uuid => {
            if (!uuid) {
                // 認証失敗時はログインページへリダイレクト
                console.warn('[router] User not authenticated, redirecting to login');
                route('/login', false, true); // ログインページへリダイレクト
                return;
            }
            window.user = { uuid }; // ユーザーデータをグローバルに設定
            if (path !== '/') {
                // 認証済みでメインページ以外にいる場合はホームへリダイレクト
                console.info('User authenticated, redirecting to home');
                route('/'); // ホームへリダイレクト
                return;
            }
            initMain(uuid); // メインUIを初期化
        })
        .catch((err) => {
            // エラー時もログインページへリダイレクト
            console.error('[router] Authentication check failed, redirecting to login', err);
            route('/login', false, true); // ログインページへリダイレクト
        });
}
