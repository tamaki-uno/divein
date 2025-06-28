'use strict';

console.log('script.js loaded');

import Popup from './modules/popup.js';
import Line from './modules/line.js';
import Header from './modules/header.js';

const API_BASE_PATH = '/api/v0';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded: path=', window.location.pathname);
    const header = new Header();
    header.init();

    // 認証チェックが不要なパスではスキップ
    if (['/login', '/signup', '/logout'].includes(window.location.pathname)) {
        new Popup();
        return;
    }

    // ログイン状態チェック
    checkLoginState(header);
});

async function checkLoginState(header) {
    try {
        const response = await fetch(`${API_BASE_PATH}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

        console.log('Login check response:', response.status);
        if (response.status === 200) {
            const data = await response.json();
            handleLoginSuccess(data, header);
        } else {
            handleLoginError(response.status);
        }
    } catch (error) {
        console.error('Error in login check:', error);
        window.location.href = '/login';
    }
}

function handleLoginSuccess(data, header) {
    if (data.success && data.loggedIn) {
        window.user = data.user;
        header.updateHeader(data.user);
        console.log('User record:', data.record);
        const main = document.querySelector('main');
        if (main) {
            const line = new Line(data.user.uuid);
            main.appendChild(line.render());
        }
    } else {
        header.updateHeader(null);
        console.error('Login failed or user not logged in');
    }
}

function handleLoginError(status) {
    if (status === 401) {
        console.warn('401 Unauthorized, redirecting to /login');
        window.location.href = '/login';
    } else if (status === 404) {
        console.error('User not found');
        window.location.href = '/signup';
    } else {
        console.error(`Unexpected response status: ${status}`);
    }
}

