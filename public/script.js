'use strict';

console.log('script.js loaded');

// import switchForm from './components/popup.js';
import switchForm from './modules/popup.js';

const API_BASE_PATH = '/api/v0';

document.addEventListener('DOMContentLoaded', () => {
    // const API_BASE_URL = 'localhost:3000/api/v0';


    const path = window.location.pathname;
    if (path === '/login' || path === '/signup' || path === '/logout') {
        // ログイン、サインアップ、ログアウトのページではAPIベースパスを設定
        window.apiBasePath = API_BASE_PATH;
        // html/popup.htmlを読み込む
        // fetch('/html/popup.html')
        // fetch('/components/popup.html')
        fetch('/modules/popup.html')
            .then(response => response.text())
            .then(popupHtml => {
                // ポップアップのHTMLをbodyに挿入
                document.body.insertAdjacentHTML('beforeend', popupHtml);
                switchForm(); // ポップアップの初期化
            }).catch(error => {
                console.error('Error loading popup HTML:', error);
            });
    }
    //     // ポップアップの初期化
    //     const popup = document.querySelector('.popup');
    //     // popup.style.display = 'flex'; // ポップアップを表示
    //     popup.style.display = 'block'; // ポップアップを表示
    //     // ポップアップの閉じるボタンにイベントリスナーを追加
    //     popup.querySelector('.close-popup-button').addEventListener('click', () => {
    //         // popup.remove(); // ポップアップをDOMから削除
    //         popup.style.display = 'none'; // ポップアップを非表示
    //         window.location.href = '/'; // ホームページにリダイレクト
    //     });
    //     // ポップアップのフォームを表示
    //     let form;
    //     const displayForm = (querySelector) => {
    //         popup.querySelectorAll('form').forEach(form => form.style.display = 'none');
    //         form = popup.querySelector(querySelector);
    //         form.style.display = 'flex';
    //     };
    //     switch (path) {
    //         case '/login':
    //             popup.querySelector('h2.popup-title').textContent = 'Dive back in!';
    //             displayForm('form.login-form');
    //             break;
    //         case '/signup':
    //             popup.querySelector('h2.popup-title').textContent = 'Dive in!';
    //             displayForm('form.signup-form');
    //             break;
    //         case '/logout':
    //             popup.querySelector('h1').textContent = 'Logout';
    //             displayForm('form.logout-form');
    //             break;
    //         default:
    //             console.error('Unknown path:', path);
    //             return;
    //     }
    //     // フォームの送信イベントを処理
    //     form.addEventListener('submit', (event) => {
    //         event.preventDefault();
    //         // フォームの送信処理をここに追加
    //         console.log('Form submitted');
    //     });
    //     // 
    //     form.querySelector('p a').addEventListener('click', (event) => {
    //         event.preventDefault();
    //         // 再読込せず、ポップアップのフォームを切り替える
    //     });
    // }
});