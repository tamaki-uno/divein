'use strict';

console.log('popup.js loaded');

// ポップアップのフォームを切り替える関数
export default function switchForm() {
    const path = window.location.pathname; // 現在のパスを取得
    console.log('Current path:', path); // デバッグ用に現在のパスを表示
    if (path !== '/login' && path !== '/signup' && path !== '/logout') console.error('Invalid path for popup:', path); // パスが無効な場合はエラーメッセージを表示
    // ポップアップ要素を取得
    const popup = document.querySelector('.popup'); // ポップアップ要素を取得
    popup.querySelectorAll('form').forEach(form => form.style.display = 'none'); // すべてのフォームを非表示にする
    // 現在のパスに対応するフォームを表示
    const form = popup.querySelector(`form.${path.slice(1)}-form`); // 現在のパスに対応するフォームを取得
    form.style.display = 'flex'; // 対応するフォームを表示
    // フォームの送信イベントリスナーを追加
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        // フォームの送信処理をここに追加
        console.log('Form submitted');
    });
    // 最後の<p>要素のリンクにクリックイベントリスナーを追加　再読み込み無しでlogin/signupを切り替える
    const pList = form.querySelectorAll('p'); // フォーム内のすべての<p>要素を取得
    if (pList.length > 0) {
        // 最後の<p>要素のリンクにクリックイベントリスナーを追加
        pList[pList.length - 1].querySelector('a').addEventListener('click', (event) => {
            event.preventDefault(); // デフォルトのリンク動作を防ぐ
            const href = event.target.getAttribute('href'); // リンクのhref属性を取得 
            window.history.pushState({}, '', href); // URLを更新
            switchForm(); // ポップアップのフォームを再描画
        });
    }
}