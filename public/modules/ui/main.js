

import { showLoading, hideLoading } from './loading.js';
// import Record from '../record.js';
// import Line from './line.js';

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
        let testText = 'helo world\nthis is first text';
        main.innerText = `
        loading... \n
        uuid: ${user.uuid}
        now: ${new Date().toLocaleString()}
        testText: ${testText}
        `; // メイン要素にテキストを設定
        // `; // ユーザーデータのUUIDを表示
        // main.appendChild(testText);
        const p = document.createElement('p'); // 新しいp要素を作成
        p.innerText = testText; // p要素にテキストを設定
        main.appendChild(p); // メイン要素に追加

        const div = document.createElement('div'); // 新しいdiv要素を作成
        main.appendChild(div); // メイン要素に追加
        div.classList.add('space'); // divにクラスを追加
        // const line = new Line(user.uuid, div, 0); // Lineインスタンスを生成
        
        // new Line(user.uuid, div, 0) // Lineインスタンスを生成

        setTimeout(() => {
            console.log('[ui] Updating testText after 1 second'); // 1秒後の更新ログ
            testText = 'this is second text';
            p.innerText = testText; // p要素のテキストを更新
        }, 1000); // 1秒後にテキストを更新

        hideLoading(); // ローディングUIを非表示
    }
}