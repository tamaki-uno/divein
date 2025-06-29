/**
 * メインクライアントサイドスクリプト
 * - ページロード時の初期化
 * - 認証状態の確認とUI更新
 * - 必要に応じてリダイレクト処理
 */

'use strict';

import { route } from './modules/router/router.js';

document.addEventListener('DOMContentLoaded', () => {
    route(window.location.pathname); // 初期ルーティング trueだとおそらく無限リロード編突入不可避
});

