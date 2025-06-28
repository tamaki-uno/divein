/**
 * ルーティング制御モジュール
 * - ページパスに応じてUI初期化や認証チェックを行う
 */

import { checkAuth } from './auth.js';
import { initHeader, initPopup, initMain } from './ui.js';

// 認証不要ページのパス一覧
const PUBLIC_PATHS = ['/login', '/signup'];
// 未認証時のリダイレクト先
const LOGIN_PATH = '/login';

/**
 * 指定パスに応じてUIや認証状態を制御する
 * @param {string} path - 遷移先パス
 */
export function route(path) {
    // ヘッダー初期化
    initHeader();

    // 認証不要ページの場合はポップアップのみ初期化
    if (PUBLIC_PATHS.includes(path)) {
        initPopup();
        return;
    }

    // 認証チェック
    checkAuth()
        .then(userData => {
            if (userData && userData.success && userData.loggedIn) {
                // 認証済みならメインUI初期化
                initMain(userData);
            } else {
                // 未認証ならログインページへリダイレクト
                window.location.href = LOGIN_PATH;
            }
        })
        .catch(() => {
            // エラー時もログインページへリダイレクト
            window.location.href = LOGIN_PATH;
        });
}
