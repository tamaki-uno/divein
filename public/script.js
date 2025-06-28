/**
 * メインクライアントサイドスクリプト
 * - ページロード時の初期化
 * - 認証状態の確認とUI更新
 * - 必要に応じてリダイレクト処理
 */

'use strict';

console.log('script.js loaded');

// モジュールのインポート
import Popup from './modules/popup.js';
import Line from './modules/line.js';
import Header from './modules/header.js';

// 認証APIのベースパス
const API_BASE_PATH = '/api/v0';

document.addEventListener('DOMContentLoaded', () => {
    /**
     * DOMContentLoadedイベント時の初期化処理
     * - Headerインスタンス生成
     * - 認証不要ページの判定
     * - 認証チェック実行
     */
    console.log('DOMContentLoaded: current path=', window.location.pathname);
    const header = new Header();

    // 認証チェックが不要なパスではスキップ
    if (['/login', '/signup', '/logout'].includes(window.location.pathname)) {
        new Popup();
        return;
    }

    // ログイン状態チェック
    checkLoginState(header);
});

/**
 * 現在のユーザーのログイン状態をAPI経由で確認し、結果に応じてUIやリダイレクトを制御する
 * @param {Header} header - Headerインスタンス
 */
async function checkLoginState(header) {
    try {
        const response = await fetch(`${API_BASE_PATH}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        console.log('Login check response:', response.status);
        if (response.status === 200) {
            const data = await response.json();
            handleLoginSuccess(data, header);
        } else {
            handleLoginError(response.status);
        }
    } catch (error) {
        console.error('Error in login check:', error);
        window.location.href = '/login';
    }
}

/**
 * ログイン成功時の処理
 * - ユーザー情報をwindowにセット
 * - Headerを更新
 * - main要素にLineインスタンスを描画
 * @param {Object} data - APIからのレスポンスデータ
 * @param {Header} header - Headerインスタンス
 */
function handleLoginSuccess(data, header) {
    if (data.success && data.loggedIn) {
        // ログイン済みなら常にログイン後ページへ遷移
        if (window.location.pathname !== '/') {
            window.location.href = '/';
            return;
        }
        window.user = data.user;
        header.updateHeader(data.user);
        console.log('User record:', data.record);
        const main = document.querySelector('main');
        if (main) {
            const line = new Line(data.user.uuid);
            if (line.ready && typeof line.ready.then === 'function') {
                line.ready.then(() => {
                    main.appendChild(line.render());
                });
            } else {
                // fallback: 旧実装
                main.appendChild(line.render());
            }
        }
    } else {
        header.updateHeader(null);
        console.error('Login failed or user not logged in');
    }
}

/**
 * ログインエラー時の処理
 * - ステータスに応じてリダイレクトやエラー表示
 * @param {number} status - HTTPステータスコード
 */
function handleLoginError(status) {
    if (status === 401) {
        console.warn('401 Unauthorized, redirecting to /login');
        window.location.href = '/login';
    } else if (status === 404) {
        console.error('User not found');
        window.location.href = '/signup';
    } else {
        console.error(`Unexpected response status: ${status}`);
    }
}

