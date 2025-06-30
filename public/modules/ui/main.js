

import { showLoading, hideLoading } from './loading.js';
import Line from './line.js';
import Html from './html.js';

export default async function initMain() {
    console.log('[ui] Initializing main UI'); // メインUI初期化ログ
    const main = document.querySelector('main'); // メイン要素を取得

    const lineHtml = new Html('/modules/ui/html/line.html'); // Line HTMLのインスタンスを作成
    const lineDoc = await lineHtml.getHtml(); // HTMLを取得
    const lineNode = await lineHtml.getNode(); // HTMLノードを取得

    // ユーザーデータを取得
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {

        console.log('[ui] User data found, initializing Line with user UUID'); // ユーザーデータが見つかった場合のログ
        console.log('[ui] User UUID:', user.uuid); // ユーザーのUUIDをログに出力
        console.log('[ui] Line HTML:', lineHtml); // Line HTMLの内容をログに出力
        console.log('[ui] Line Document:', lineDoc); // Lineドキュメントをログに出力
        console.log('[ui] Line Node:', lineNode); // Lineノードをログに出力
        console.log('[ui] Main element:', main); // メイン要素をログに出力

        new Line(user.uuid, lineDoc, main, 0) // ユーザーのUUIDを使用してLineを初期化

        hideLoading(); // ローディングUIを非表示
    }
}