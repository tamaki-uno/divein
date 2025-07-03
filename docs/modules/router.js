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

const AUTHENTICATION_PATHS = ['/signup', '/login', '/logout'];


/**
 * 指定パスに応じてUIや認証状態を制御する
 * @param {string} path - 遷移先パス
 * @param {Object} [options={ redirect: '', uuid: '', overwrite: false, reload: false }] - オプション設定
 */
export default async function route(url = new URL(window.location.href)) {
    const url
    
    // if (url.search.includes('page=')) route(new URL(url.searchParams.get('page'), url.origin));
    // if (url.searchParams.get('overwrite') ==
    // if (url.search.includes('reload=true')) {
    // }
    // switch (url.pathname) {
        
    }
    // console.log(`[router] route called. path: ${path}`);
    // updateHistory(path, options);
    // showLoading();
    // setUserIcon();

    // if (PUBLIC_PATHS.includes(path)) {
    //     handlePublicRoute(path);
    //     return;
    // }
    // const user = getUserFromSession();
    // if (user && user.uuid) {
    //     console.log(`[router] User is authenticated:`, user);
    //     handleAuthenticatedRoute(path, user, options);
    //     return;
    // }
    // redirectToLogin(path);
}

// export function urlGenerate(path = '/', redirect = '',)

/**
 * クエリパラメータ文字列を生成
 * @param {Object} options
 * @returns {string}
 */
function buildQueryParams(options) {
    const params = [];
    if (options.redirect) params.push(`redirect=${encodeURIComponent(options.redirect)}`);
    if (options.uuid) params.push(`uuid=${encodeURIComponent(options.uuid)}`);
    return params.length ? `?${params.join('&')}` : '';
}

/**
 * ページ遷移時の履歴操作を行う
 * @param {string} path - 遷移先パス
 * @param {Object} options - オプション設定
 * * /
//  * * /404: 
//  * * /settings
//  * * /signup
//  * * /login
//  * * /logout
 * * ?page=path: すぐにPathに遷移
//  * * ?redirect=path: 
 * * ?uuid=uuid: UUIDでInitMain
 */
function updateHistory(path, options) {
    const query = buildQueryParams(options);
    const fullPath = path + query;
    if (options.overwrite) {
        window.history.replaceState({}, '', fullPath);
    } else {
        window.history.pushState({}, '', fullPath);
    }
    if (options.reload) {
        window.location.reload();
    }
}

/**
 * ユーザー認証済み時のルーティング処理
 * @param {string} path
 * @param {Object} user
 * @param {Object} options
 */
function handleAuthenticatedRoute(path, user, options) {
    console.log(`[router] User authenticated, initializing main UI for path: ${path}`);
    switch (path) {
        case '/':
            initMain(options.uuid || user.uuid);
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
    route('/login', { reload: false, overwrite: true, redirect: path });
}

/**
 * セッションストレージからユーザーデータを取得
 * @returns {Object|null}
 */
function getUserFromSession() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('[router] Failed to parse user data:', e);
        return null;
    }
}
