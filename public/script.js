'use strict';


const API_BASE_PATH = '/api/v0';

document.addEventListener('DOMContentLoaded', () => {
    // const API_BASE_URL = 'localhost:3000/api/v0';

    const path = window.location.pathname;
    if (path === '/login' || path === '/signup' || path === '/logout') {
        // ログイン、サインアップ、ログアウトのページではAPIベースパスを設定
        window.apiBasePath = API_BASE_PATH;
        // html/popup.htmlを読み込む
        fetch('/html/popup.html')
            .then(response => response.text())
            .then(popupHtml => {
                // ポップアップのHTMLをbodyに挿入
                document.body.insertAdjacentHTML('beforeend', popupHtml);
                // ポップアップの初期化
                const popup = document.querySelector('.popup');
                // ポップアップの閉じるボタンにイベントリスナーを追加
                popup.querySelector('.close-popup-button').addEventListener('click', () => {
                    popup.remove(); // ポップアップをDOMから削除
                    window.location.href = '/'; // ホームページにリダイレクト
                });
                const displayForm = (querySelector) => {
                    popup.querySelectorAll('form').forEach(form => form.style.display = formDisplay);
                    // popup.querySelector(querySelector).style.display = 'flex';
                    popup.querySelector(querySelector).style.display = 'block';
                };
                
                switch (path) {
                    case '/login':
                        popup.querySelector('h2.popup-title').textContent = 'Dive back in!';
                        // popup.querySelector('form.login-form').style.display = 'block';
                        displayForm('form.login-form');
                        break;
                    case '/signup':
                        // popup.querySelector('form').action = '/signup';
                        popup.querySelector('h2.popup-title').textContent = 'Dive in!';
                        // popup.querySelector('form.signup-form').style.display = 'block';
                        displayForm('form.signup-form');
                        break;
                    case '/logout':
                        popup.querySelector('h1').textContent = 'Logout';
                        // popup.querySelector('form.logout-form').style.display = 'block';
                        displayForm('form.logout-form');
                        break;
                    default:
                        console.error('Unknown path:', path);
                        return;
                }
                // フォームの送信イベントを処理
                popup.querySelector('form').addEventListener('submit', (event) => {
                    event.preventDefault();
                    // フォームの送信処理をここに追加
                    console.log('Form submitted');
                });
            }).catch(error => {
                console.error('Error loading popup HTML:', error);
            });
    }


});