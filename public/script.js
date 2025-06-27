'use strict';

console.log('script.js loaded');

// import switchForm from './components/popup.js';
import switchForm from './modules/popup.js';

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

    const toggleButtons = document.querySelectorAll('.toggle-button');
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = document.querySelector(button.dataset.target);
            if (target) {
                target.classList.toggle('hidden');
            }
        });
    });
    toggleButtons.forEach(button => {
        button.addEventListener('rightclick', (event) => {
            event.preventDefault(); // 右クリックメニューを無効化
            const target = document.querySelector(button.dataset.target);
            if (target) {
                target.classList.toggle('hidden');
            }
        });
    });
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => {
        content.addEventListener('click', () => {
            const conotent = content.querySelector('.content-text');
            if (conotent) {
                conotent.classList.toggle('hidden');
            }
        });
    }

});

