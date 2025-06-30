

import { showLoading, hideLoading } from './loading.js';
import Line from './line.js';
import Html from './html.js';

export default async function initMain() {
    console.log('[ui] Initializing main UI'); // メインUI初期化ログ
    const main = document.querySelector('main'); // メイン要素を取得

    const lineHtml = new Html('/modules/ui/html/line.html'); // Line HTMLのインスタンスを作成

    // ユーザーデータを取得
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        console.log('[ui] User data found:', user); // ユーザーデータが見つかった場合のログ

        // const userRecord = await syncWithAPI(user.uuid); // ユーザーのレコードをAPIから同期
        // console.log('[ui] User record synced with API:', userRecord); // ユーザーレコード同期成功ログ

        lineHtml.getHtml().then(html => {
            console.log('[ui] Line HTML loaded successfully', html); // Line HTMLの読み込み成功ログ
            const line = new Line(user, { html, parentNode: main, delete: null }); // Lineのインスタンスを作成
            hideLoading(); // ローディングUIを非表示
        }).catch(error => {
            console.error('[ui] Error initializing Line:', error); // エラーが発生した場合のログ
        });
        
        // hideLoading(); // ローディングUIを非表示
    }
}