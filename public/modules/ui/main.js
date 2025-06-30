

import { showLoading, hideLoading } from './loading.js';
// import Record from '../record.js';
import Line from './line.js';

export default function initMain() {
    console.log('[ui] Initializing main UI'); // メインUI初期化ログ
    const main = document.querySelector('main'); // メイン要素を取得
    // main.innerHTML = ''; // メイン要素の内容をクリア

    // ローディングUIを表示
    showLoading();

    // ユーザーデータを取得
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user) {
        main.innerHTML = ''; // ユーザーデータが存在する場合はメイン要素をクリア
        main.innerText = `loading... \n uuid: ${user.uuid}\n`; // ユーザーデータのUUIDを表示
        hideLoading(); // ローディングUIを非表示
        const div = document.createElement('div'); // 新しいdiv要素を作成
        main.appendChild(div); // メイン要素に追加
        div.classList.add('space'); // divにクラスを追加
        // const line = new Line(user.uuid, div, 0); // Lineインスタンスを生成
        new Line(user.uuid, div, 0) // Lineインスタンスを生成
    }
}