'use strict';

console.log('script.js loaded');

import Popup from './modules/popup.js';
import Line from './modules/line.js';

const API_BASE_PATH = '/api/v0';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: path=', window.location.pathname);

    // 認証チェックが不要なパスではスキップ
    if (['/login', '/signup', '/logout'].includes(window.location.pathname)) {
        new Popup();
        return;
    }

    // ログイン状態チェック
    fetch(`${API_BASE_PATH}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
    .then(async response => {
        console.log('Login check response:', response.status);
        if (response.status === 200) {
            return response.json();
        } else if (response.status === 401) {
            console.warn('401 Unauthorized, redirecting to /login');
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
        console.log('Login check data:', data);
        if (data.success && data.loggedIn) {
            window.user = data.user;
            console.log('User record:', data.record);
            const main = document.querySelector('main');
            if (main) {
                const line = new Line(data.user.uuid);
                main.appendChild(line.render());
            }
        } else {
            console.error('Login failed or user not logged in');
        }
    })
    .catch(error => {
        console.error('Error in login check:', error);
        window.location.href = '/login';
    });
});