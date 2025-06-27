'use strict';

console.log('popup.js loaded');

export default function switchForm() {
    const path = window.location.pathname; // 現在のパスを取得
    console.log('Current path:', path);
    const popup = document.querySelector('.popup');
    // ログイン、サインアップ、ログアウト以外のパスではエラー
    if (path !== '/login' && path !== '/signup' && path !== '/logout') {
        console.error('Invalid path for popup:', path);
        return;
    }
    popup.querySelectorAll('form').forEach(form => form.style.display = 'none');
    let form;
    switch (path) {
        case '/login':
            form = popup.querySelector('form.login-form');
            popup.querySelector('h2.popup-title').textContent = 'Dive back in!';
            break;
        case '/signup':
            form = popup.querySelector('form.signup-form');
            popup.querySelector('h2.popup-title').textContent = 'Dive in!';
            break;
        case '/logout':
            form = popup.querySelector('form.logout-form');
            popup.querySelector('h1').textContent = 'Logout';
            break;
        default:
            console.error('Unknown path:', path);
            return;
    }
    form.style.display = 'flex';
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        // フォームの送信処理をここに追加
        console.log('Form submitted');
    });
    // form.querySelector('p a').addEventListener('click', (event) => {
    // 最後のp要素の中のリンクをクリックしたときの処理
    popup.querySelector('p:last-of-type a').addEventListener('click', (event) => {
        event.preventDefault();
        // 再読込せず、ポップアップのフォームを切り替える
        // switchForm(event.target.getAttribute('href'));
        window.history.pushState({}, '', event.target.getAttribute('href')); // URLを更新
        switchForm(); // ポップアップのフォームを再描画

    });
}