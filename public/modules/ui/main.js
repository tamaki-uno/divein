

import { showLoading, hideLoading } from './loading.js';
// import Record from '../record.js';
// import Line from './line.js';

export default function initMain() {
    console.log('[ui] Initializing main UI'); // メインUI初期化ログ
    const main = document.querySelector('main'); // メイン要素を取得

    // ユーザーデータを取得
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {

        const main = document.querySelector('main');
        
        new Line(user.uuid, main, 0);

        hideLoading(); // ローディングUIを非表示
    }
}