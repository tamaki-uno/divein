/**
 * ルーティング制御モジュール
 * - ページパスに応じてUI初期化や認証チェックを行う
 */

import checkAuth from '../auth/auth.js';
import { initHeader, initPopup, initMain } from '../ui.js';

// 認証不要ページのパス一覧
const PUBLIC_PATHS = ['/login', '/signup', '/logout'];
// 未認証時のリダイレクト先
const LOGIN_PATH = '/login';

/**
 * 指定パスに応じてUIや認証状態を制御する
 * @param {string} path - 遷移先パス
 */
export function route(path) {
    console.log(`[router] route called. path: ${path}`); // ルーティング開始ログ
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
                window.location.href = LOGIN_PATH;
                return;
            }
            window.user = { uuid }; // ユーザーデータをグローバルに設定
            if (window.location.pathname !== '/') {
                // 認証済みでメインページ以外にいる場合はホームへリダイレクト
                console.info('User authenticated, redirecting to home');
                // window.location.href = '/';
                window.history.pushState({}, '', '/');
                // window.location.reload(); // ページリロードしてメインUIを更新
            }
            initMain(uuid); // メインUIを初期化
        })
        .catch((err) => {
            // エラー時もログインページへリダイレクト
            console.error('[router] Authentication check failed, redirecting to login', err);
            window.location.href = LOGIN_PATH;
        });
}
