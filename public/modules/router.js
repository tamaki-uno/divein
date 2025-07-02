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
 * ページ遷移時の履歴操作を行う
 * @param {string} path - 遷移先パス
 * @param {Object} options - オプション設定
 */
function updateHistory(path, options) {
    if (options.overwrite) {
        window.history.replaceState({}, '', path);
    } else {
        window.history.pushState({}, '', path);
    }
    if (options.reload) {
        window.location.reload();
    }
}

/**
 * ユーザー認証済み時のルーティング処理
 * @param {string} path
 */
function handleAuthenticatedRoute(path) {
    console.log(`[router] User authenticated, initializing main UI for path: ${path}`);
    switch (path) {
        case '/':
            initMain();
            break;
        case '/settings':
            showSettings();
            break;
        default:
            console.warn(`[router] Unhandled path for authenticated user: ${path}`);
            break;
    }
}

/**
 * 認証不要ページのルーティング処理
 * @param {string} path
 */
function handlePublicRoute(path) {
    console.log(`[router] Public path detected: ${path}`);
    showPopup();
}

/**
 * 未認証ユーザーのリダイレクト処理
 * @param {string} path
 */
function redirectToLogin(path) {
    console.warn(`[router] User not authenticated, redirecting to login for path: ${path}`);
    route('/login', { reload: false, overwrite: true });
}

/**
 * 指定パスに応じてUIや認証状態を制御する
 * @param {string} path - 遷移先パス
 * @param {Object} [options={overwrite: false, reload: false}] - オプション設定
 * @returns {Promise<void>}
 */
export default async function route(path, options = { overwrite: false, reload: false }) {
    console.log(`[router] route called. path: ${path}`);
    updateHistory(path, options);
    showLoading();
    setUserIcon();

    if (PUBLIC_PATHS.includes(path)) {
        handlePublicRoute(path);
        return;
    }
    const user = sessionStorage.getItem('user');
    if (user) {
        handleAuthenticatedRoute(path);
        return;
    }
    redirectToLogin(path);
}
