'use strict';

import route from '/modules/router.js'; // ルーティング用モジュール
import { syncRecord } from '../database.js';
import Html from './html.js'; // HTML操作用モジュール
import { hideLoading, showLoading } from './loading.js';

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


/** * フォームのバリデーションを行う
 * @param {HTMLFormElement} form - バリデーション対象のフォーム
 * @returns {boolean} - フォームが有効な場合はtrue、無効な場合はfalse
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
            input.classList.add('invalid');
            const p = document.createElement('p');
            p.textContent = input.validationMessage;
            p.classList.add('error-message');
            input.parentNode.insertBefore(p, input.nextSibling);
        }
    });
    // パスワード確認
    const password = form.querySelector('input[name="password"]');
    const confirm = form.querySelector('input[name="confirm-password"]');
    if (password && confirm && password.value !== confirm.value) {
        isValid = false;
        confirm.classList.add('invalid');
        const p = document.createElement('p');
        p.textContent = 'パスワードが一致しません。';
        p.classList.add('error-message');
        confirm.parentNode.insertBefore(p, confirm.nextSibling);
    }
    form.querySelector('button[type="submit"]').disabled = !isValid; // 送信ボタンの有効/無効を設定
    return isValid;
}

/**
 * APIのPOSTリクエストを処理する関数
 * - 指定されたエンドポイントに対してJSONデータをPOSTリクエスト
 * - レスポンスをJSONとして処理
 * * @param {Object} jsonData - 送信するJSONデータ
 * @param {string} endpointType - エンドポイントのタイプ（例: 'signup', 'login'）
 * @param {string} [API_BASE_PATH='/api/v0'] - APIのベースパス
 * @param {string} [method='POST'] - HTTPメソッド（デフォルトは'POST'）
 * @returns {Promise<Object>} - レスポンスのJSONデータ
 * @async
 */
async function postAPIHandler(jsonData, endpointType, API_BASE_PATH = '/api/v0', method = 'POST') {
    console.log('Handling API POST request');
    return fetch(`${API_BASE_PATH}/${endpointType}`, {
        method: method,
        body: JSON.stringify(jsonData),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include' // セッション維持
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
            return response.json();
        });
}

async function submitForm(form, endpointType) {
    console.log(`Submitting form for ${endpointType}`);
    const dataObj = Object.fromEntries(new FormData(form).entries()); // フォームデータをオブジェクトに変換
    delete dataObj['confirm-password']; // confirm-passwordは送信しない
    const jsonData = JSON.stringify(dataObj); // オブジェクトをJSON文字列に変換
    return postAPIHandler(jsonData, endpointType, API_BASE_PATH) // APIのPOSTリクエストを送信
        .then((json) => {
            console.log(`${endpointType} successful:`, json);
            sessionStorage.setItem('user', JSON.stringify(json.user)); // ユーザーデータをセッションストレージに保存
            closePopup(); // ポップアップを閉じる
            return json; // レスポンスのJSONデータを返す
        });
}

/** * サインアップフォームの送信を処理する関数
 * * @param {Event} event - フォーム送信イベント
 * @returns {void}
 * @async
 * @throws {Error} - APIリクエストの失敗時にエラーをスロー
 */
async function signupHandler(event) {
    console.log('Handling signup form submission');
    event.preventDefault(); // デフォルトの送信を防ぐ
    const form = event.target;
    form.querySelector('button[type="submit"]').disabled = true; // 送信ボタンを無効化
    if (validateForm(form)) await submitForm(form, 'signup') // バリデーションを実行し、サインアップを処理
}

/** * ログインフォームの送信を処理する関数
 * - デフォルトの送信を防ぐ
 * - バリデーションを実行
 * - フォームデータをオブジェクトに変換
 * - オブジェクトをJSON文字列に変換
 * - APIのPOSTリクエストを送信
 * - レスポンスをJSONとして処理
 * * @param {Event} event - フォーム送信イベント
 * @returns {void}
 * @async
 */
async function loginHandler(event) {
    console.log('Handling login form submission');
    event.preventDefault();
    const form = event.target;
    form.querySelector('button[type="submit"]').disabled = true;
    if (validateForm(form)) await submitForm(form, 'login'); // バリデーションを実行し、ログインを処理
}

/** * ログアウトフォームの送信を処理する関数
 * - デフォルトの送信を防ぐ
 * - セッションストレージからユーザーデータを削除
 * - クッキーからトークンを削除
 * - ホームページへリダイレクト
 * * @param {Event} event - フォーム送信イベント
 * @returns {void}
 */
function logoutHandler(event) {
    console.log('Handling logout form submission');
    event.preventDefault(); // デフォルトの送信を防ぐ
    sessionStorage.removeItem('user'); // セッションストレージからユーザーデータを削除
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'; // クッキーからトークンを削除
    closePopup(event); // ポップアップを閉じる
}