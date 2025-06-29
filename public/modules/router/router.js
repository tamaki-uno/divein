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
        // .then(userData => {
        .then(userRecord => {
            window.user = userRecord;
            // window.location.href = '/'; // 認証チェック後はホームへリダイレクト
            if (window.location.pathname !== '/') {
                // 認証済みでメインページ以外にいる場合はホームへリダイレクト
                console.info('User authenticated, redirecting to home');
                // window.location.href = '/';
                window.history.pushState({}, '', '/');
                // window.location.reload(); // ページリロードしてメインUIを更新
                // return;
            }
            initMain(userRecord);
            // console.log('[router] Auth check result:', userData); // 認証チェック結果ログ
            // if (userData && userData.success && userData.loggedIn) {
            // if (payload && payload.success && payload.loggedIn) {
            //     if (window.location.pathname !== '/') {
            //         // 認証済みでメインページ以外にいる場合はホームへリダイレクト
            //         console.info('User authenticated, redirecting to home');
            //         window.location.href = '/';
            //         return;
            //     }
            //     window.user = userData.user;
            //     // 認証済みならメインUI初期化
            //     console.log('[router] User authenticated. Initializing main UI.');
            //     initMain(userData);
            // } else {
            //     // 未認証ならログインページへリダイレクト
            //     console.warn('[router] User not authenticated, redirecting to login');
            //     window.location.href = LOGIN_PATH;
            // }
        })
        .catch((err) => {
            // エラー時もログインページへリダイレクト
            console.error('[router] Authentication check failed, redirecting to login', err);
            window.location.href = LOGIN_PATH;
        });
}
