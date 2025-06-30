

import { showLoading, hideLoading } from './loading.js';
import Line from './line.js';
import Html from './html.js';

export default function initMain() {
    console.log('[ui] Initializing main UI'); // メインUI初期化ログ
    const main = document.querySelector('main'); // メイン要素を取得

    const lineHtml = new Html('/modules/ui/html/line.html'); // Line HTMLのインスタンスを作成

    // ユーザーデータを取得
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {

        
        new Line(user.uuid, main, 0);

        hideLoading(); // ローディングUIを非表示
    }
}