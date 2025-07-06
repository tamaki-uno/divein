/**
 * メインクライアントサイドスクリプト
 * - ページロード時の初期化
 * - 認証状態の確認とUI更新
 * - 必要に応じてリダイレクト処理
 */

'use strict';

console.log('[script] main script loaded'); // スクリプト読み込みログ

import { initIndexedDB } from './modules/database.js';
// import initUI from './modules/ui.js';
import route from './modules/router.js';
import { showSettings, setSettingIcon } from './modules/ui/setting/setting.js';
import Line from './modules/ui/line.js'; // Lineクラスのインポート

// document.addEventListener('DOMContentLoaded', () => route());
// const url = new URL(window.location.href);
// if (url.searchParams.get('page'))
document.addEventListener('DOMContentLoaded', () => {
    const url = new URL(location.href);
    url.pathname = url.searchParams.get('page') || url.pathname;
    // if (url.hash == '#settings') showSettings();
    // setSettingIcon();
    // const line = new Line(url.pathname.replace(/^\//, ''));
    // initUI(); // UIの初期化
    // route();
    const settingIcon = document.getElementById('setting-icon');
    const settingContainer = document.getElementById('settings-container');
    const closeIcon = document.getElementById('close-icon');
    settingIcon.addEventListener('click', (e) => {
        e.preventDefault();
        settingContainer.classList.remove('hidden'); // 設定コンテナを表示
    });
    closeIcon.addEventListener('click', (e) => {
        e.preventDefault();
        settingContainer.classList.add('hidden'); // 設定コンテナを非表示
    });

});

initIndexedDB(); // IndexedDBの初期化