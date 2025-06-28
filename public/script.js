/**
 * メインクライアントサイドスクリプト
 * - ページロード時の初期化
 * - 認証状態の確認とUI更新
 * - 必要に応じてリダイレクト処理
 */

'use strict';

import { route } from './modules/router/router.js';

document.addEventListener('DOMContentLoaded', () => {
    route(window.location.pathname);
});

