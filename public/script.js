'use strict';

console.log('script.js loaded');

// import switchForm from './modules/popup.js';
import Popup from './modules/popup.js';
import Line from './modules/line.js';

const API_BASE_PATH = '/api/v0';

document.addEventListener('DOMContentLoaded', () => {
    // const path = window.location.pathname;
    // // ログイン・サインアップ・ログアウトページの場合
    // if (['/login', '/signup', '/logout'].includes(path)) {
    //     window.apiBasePath = API_BASE_PATH;
    //     fetch('/modules/popup.html')
    //         .then(response => {
    //             if (!response.ok) throw new Error('Failed to load popup HTML');
    //             return response.text();
    //         })
    //         .then(popupHtml => {
    //             document.body.insertAdjacentHTML('beforeend', popupHtml);
    //             switchForm();
    //         })
    //         .catch(error => {
    //             console.error('Error loading popup HTML:', error);
    //         });
    // } else if (path === '/settings') {
    //     window.apiBasePath = API_BASE_PATH;
    //     // 設定ページの初期化処理
    //     console.log('Settings page loaded');
    // }

    // ログイン状態チェック
    fetch(`${API_BASE_PATH}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(async response => {
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 401) {
            window.location.href = '/login';
            return;
        } else if (response.status === 404) {
            console.error('User not found');
            window.location.href = '/signup';
            return;
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    })
    .then(data => {
        if (!data) return;
        console.log('Success:', data);
        if (data.success && data.loggedIn) {
            window.user = data.user;
            console.log('User record:', data.record);
            // main要素が存在する場合のみ描画
            const main = document.querySelector('main');
            if (main) {
                const line = new Line(data.record);
                main.appendChild(line.render());
            }
        } else {
            console.error('Login failed or user not logged in');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = '/login';
    });

    if (['/login', '/signup', '/logout'].includes(window.location.pathname)) {
        const popup = new Popup();
    }



    // --- UIのトグル機能例（コメントアウト） ---
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

