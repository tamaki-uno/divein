'use strict';

console.log('script.js loaded');

// import switchForm from './components/popup.js';
import switchForm from './modules/popup.js';
import Line from './modules/line.js';

const API_BASE_PATH = '/api/v0';

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname; // 現在のパスを取得
    if (path === '/login' || path === '/signup' || path === '/logout') {
        // ログイン、サインアップ、ログアウトのページではAPIベースパスを設定
        window.apiBasePath = API_BASE_PATH;
        fetch('/modules/popup.html')
            .then(response => response.text())
            .then(popupHtml => {
                // ポップアップのHTMLをbodyに挿入
                document.body.insertAdjacentHTML('beforeend', popupHtml);
                switchForm(); // ポップアップの初期化
            }).catch(error => {
                console.error('Error loading popup HTML:', error);
            });
    } else if (path === '/settings') {
        // 設定ページではAPIベースパスを設定
        window.apiBasePath = API_BASE_PATH;
        // 設定ページの初期化処理をここに追加
        console.log('Settings page loaded');
    }

    fetch('/api/v0/check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // Cookieを送信するために必要
    })
    .then(response => {
        switch (response.status) {
            case 200:
                return response.json();
            case 401:
                window.location.href = '/login';
                break
            case 404:
                console.error('User not found');
                window.location.href = '/signup';
                break;
            default:
                throw new Error(`Unexpected response status: ${response.status}`);
                }
    })
    .then(data => {
        console.log('Success:', data);
        if (data.success && data.loggedIn) {
            // ユーザー情報をグローバルに保存
            window.user = data.user;
            // レコードの内容を表示する処理をここに追加
            console.log('User record:', data.record);
            // 例: レコードを表示するためのLineインスタンスを作成
            const line = new Line(data.record);
            document.querySelector('main').appendChild(line.render());
        } else {
            console.error('Login failed or user not logged in');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        // エラーが発生した場合の処理をここに追加
        // 例: ログインページにリダイレクトするなど
        window.location.href = '/login';
    });

    // const toggleButtons = document.querySelectorAll('.toggle-button');
    // toggleButtons.forEach(button => {
    //     button.addEventListener('click', () => {
    //         const target = document.querySelector(button.dataset.target);
    //         if (target) {
    //             target.classList.toggle('hidden');
    //         }
    //     });
    // });
    // toggleButtons.forEach(button => {
    //     button.addEventListener('rightclick', (event) => {
    //         event.preventDefault(); // 右クリックメニューを無効化
    //         const target = document.querySelector(button.dataset.target);
    //         if (target) {
    //             target.classList.toggle('hidden');
    //         }
    //     });
    // });
    // const contents = document.querySelectorAll('.content');
    // contents.forEach(content => {
    //     content.addEventListener('click', () => {
    //         const conotent = content.querySelector('.content-text');
    //         if (conotent) {
    //             conotent.classList.toggle('hidden');
    //         }
    //     });
    // }

});

