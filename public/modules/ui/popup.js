'use strict';

import route from '/modules/router.js'; // ルーティング用モジュール
import Html from './html.js'; // HTML操作用モジュール
import { hideLoading } from './loading.js';

const popupHtml = new Html('/modules/ui/html/popup.html'); // ポップアップHTMLを管理するインスタンス

const API_BASE_PATH = '/api/v0'; // APIのベースパス


/**
 * ポップアップを初期化する
 * @returns {Promise<HTMLElement>} - 初期化されたポップアップ要素
 * @async
 */
async function initPopup() {
    console.log('[ui] Initializing popup');
    const node = await popupHtml.getNode();
    const popup = node.querySelector('.popup');
    if (!popup) return console.error('[ui] Popup element not found in HTML');

    popup.addEventListener('keydown', (e) => e.key === 'Escape' && closePopup(e));
    popup.querySelector('.close-popup-icon').addEventListener('click', (e) => closePopup(e));

    popup.querySelector('form.signup-form').addEventListener('submit', signupHandler);
    popup.querySelector('form.login-form').addEventListener('submit', loginHandler);
    popup.querySelector('form.logout-form').addEventListener('submit', logoutHandler);

    popup.querySelectorAll('form p:last-of-type a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const href = event.target.getAttribute('href');
            console.log(`[ui] Navigating to ${href} from popup link`);
            route(href, { reload: false, replace: false });
        });
    });

    document.body.appendChild(popup); // ポップアップ要素をドキュメントに追加
    return popup; // 初期化されたポップアップを返す
}

/** * ポップアップを閉じる
 * * @param {Event} event - イベントオブジェクト
 * * @returns {void}
 */
function closePopup(event) {
    event?.preventDefault(); // デフォルトの動作を防ぐ
    const popup = document.querySelector('.popup');
    popup.style.display = 'none';
    const queryParams = new URLSearchParams(window.location.search);
    const redirectPath = queryParams.get('redirect') || '/'
    route(redirectPath, { reload: false, replace:false });
}

/** * ポップアップを表示する
 * @async
 */
export async function showPopup() {
    const popup = document.querySelector('.popup') || await initPopup();
    popup.style.display = 'flex';

    popup.querySelectorAll('form').forEach(form => form.style.display = 'none');
    const pathName = window.location.pathname.replace(/^\//, '');
    const form = popup.querySelector(`form.${pathName}-form`);
    if (!form) return console.error(`[ui] Form for path ${pathName} not found`);
    form.style.display = 'flex';

    hideLoading();
}

/**
 * 入力フィールドの無効状態をアラートする
 * @param {HTMLInputElement} input - 無効な入力フィールド
 * @param {string} message - エラーメッセージ
 */
function alertInvalidInput(input, message) {
    input.classList.add('invalid');
    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;
    errorMessage.classList.add('error-message');
    input.parentNode.insertBefore(errorMessage, input.nextSibling);
}

/**
 * フォームのバリデーションを行う
 * @param {HTMLFormElement} form
 * @returns {boolean}
 */
function validateForm(form) {
    console.log('Validating form', form);
    if (!form) return false; // フォームが存在しない場合は無効
    // エラーメッセージと無効クラスをリセット
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));

    let isValid = true;
    // 基本的なそれぞれの入力フィールドのバリデーション
    form.querySelectorAll('input').forEach(input => {
        if (!input.checkValidity()) {
            isValid = false;
            alertInvalidInput(input, input.validationMessage);
        }
    });
    // パスワード確認
    if (form.classList.contains('signup-form')) {
        const password = form.querySelector('input[name="password"]');
        const confirm = form.querySelector('input[name="confirm-password"]');
        if (password.value !== confirm.value) {
            isValid = false;
            alertInvalidInput(confirm, 'パスワードが一致しません。');
        }
    }
    return isValid;
}

/**
 * APIのPOSTリクエストを送信
 * @param {Object} jsonData - 送信するJSONデータ
 * @param {string} endpointType - エンドポイント名（例: 'signup', 'login'）
 * @param {string} [API_BASE_PATH='/api/v0']
 * @param {string} [method='POST']
 * @returns {Promise<Object>}
 */
async function postAPIHandler(jsonData, endpointType, API_BASE_PATH = '/api/v0', method = 'POST') {
    return fetch(`${API_BASE_PATH}/${endpointType}`, {
        method,
        body: JSON.stringify(jsonData),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTPエラー: ${response.status}`);
        return response.json();
    });
}

/**
 * フォーム送信共通処理
 * @param {HTMLFormElement} form
 * @param {string} endpointType
 * @returns {Promise<Object>}
 */
async function submitForm(form, endpointType) {
    const dataObj = Object.fromEntries(new FormData(form).entries());
    delete dataObj['confirm-password'];
    const jsonData = JSON.stringify(dataObj);
    return postAPIHandler(jsonData, endpointType, API_BASE_PATH)
        .then((json) => {
            sessionStorage.setItem('user', JSON.stringify(json.user));
            closePopup();
            return json;
        });
}

/**
 * サインアップフォーム送信ハンドラ
 * @param {Event} event
 */
async function signupHandler(event) {
    event.preventDefault();
    const form = event.target;
    form.querySelector('button[type="submit"]').disabled = true;
    if (validateForm(form)) {
        await submitForm(form, 'signup');
    } else {
        form.querySelector('button[type="submit"]').disabled = false;
    }
}

/**
 * ログインフォーム送信ハンドラ
 * @param {Event} event
 */
async function loginHandler(event) {
    event.preventDefault();
    const form = event.target;
    form.querySelector('button[type="submit"]').disabled = true;
    if (validateForm(form)) {
        await submitForm(form, 'login');
    } else {
        form.querySelector('button[type="submit"]').disabled = false;
    }
}

/**
 * ログアウトハンドラ
 * @param {Event} event
 */
async function logoutHandler(event) {
    event.preventDefault();
    const form = event.target;
    form.querySelector('button[type="submit"]').disabled = true;
    await postAPIHandler({}, 'logout', API_BASE_PATH)
        .then(() => {
            sessionStorage.removeItem('user');
            closePopup();
        })
        .catch(error => {
            console.error('Logout error:', error);
            form.querySelector('button[type="submit"]').disabled = false;
        });
}