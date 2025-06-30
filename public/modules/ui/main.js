

import { showLoading, hideLoading } from './loading.js';
import Record from '../record.js';

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
        const record = new Record(user.uuid, div); // Recordインスタンスを生成


    //     // ユーザーデータが存在する場合はLineインスタンスを生成し、メイン要素に描画
    //     const line = new Line(user.uuid);
    //     line.render(main).then(() => {
    //         hideLoading(); // 描画完了後にローディングUIを非表示
    //     });
    // } else {
    //     main.innerText = 'Please log in to view your data.'; // ユーザーデータがない場合のメッセージ
    //     hideLoading(); // ローディングUIを非表示
    // }
    }
        // const line = new Line(userData.user.uuid);
        // // Lineインスタンスがreadyプロパティを持つ場合は非同期描画
        // if (line.ready && typeof line.ready.then === 'function') {
        //     line.ready.then(() => {
        //         main.appendChild(line.render());
        //     });
        // } else {
        //     main.appendChild(line.render());
        // }
}