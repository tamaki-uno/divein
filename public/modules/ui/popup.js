'use strict';

import route from '/modules/router.js'; // ルーティング用モジュール
import { saveRecordToIndexedDB } from '../database.js';

async function initPopup() {
    console.log('[ui] Initializing popup'); // ポップアップ初期化ログ
    // const popup = document.querySelector('.popup'); // すでに存在する.popupを取得
    // if (!document.querySelector('.popup')) { // ポップアップが存在しない場合
    try {
        const response = await fetch('/modules/ui/popup.html') // 存在しない場合はHTMLを取得
            ;
        if (!response.ok) throw new Error('Failed to load popup HTML');
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html.trim());
        const popup = document.querySelector('.popup');
        popup.querySelector('.close-popup-button').addEventListener('click', (e) => closePopup(e)); // 閉じるボタンのイベントリスナーを設定
        return popup;
    } catch (error) {
        console.error('Error loading popup HTML:', error);
        const existingPopup = document.querySelector('.popup');
        if (existingPopup) existingPopup.remove();
    }
    // return;
    // }
}

function closePopup(event) {
    event?.preventDefault(); // デフォルトの動作を防ぐ
    console.log('[ui] Closing popup'); // ポップアップ閉じるログ
    const popup = document.querySelector('.popup');
    popup.style.display = 'none';
    route('/'); // ルートをホームに変更
}

export async function showPopup() {
    console.log('[ui] Showing popup'); // ポップアップ表示ログ
    // let popup = document.querySelector('.popup');
    // if (!popup) initPopup(); // ポップアップが存在しない場合は初期化
    const popup = document.querySelector('.popup') || await initPopup(); // ポップアップを取得または初期化
    if (!popup) {
        console.error('[ui] Popup element not found'); // ポップアップ要素が見つからない場合のエラーログ
        return;
    }
    popup.style.display = 'flex';
    showFormForCurrentPath(); // 現在のパスに応じてフォームを表示
}

export function showFormForCurrentPath() {
    console.log('Showing form for current path');
    const popup = document.querySelector('.popup');
    popup.querySelectorAll('form').forEach(f => f.style.display = 'none');
    const path = window.location.pathname;
    const form = popup.querySelector(`form.${path.slice(1)}-form`);
    if (!form) return;
    form.style.display = 'flex';
    form.addEventListener('submit', (event) => submitForm(event)); // フォーム送信イベントを設定
    form.querySelector('p:last-of-type a')?.addEventListener('click', (event) => {
        event.preventDefault();
        const href = event.target.getAttribute('href');
        route(href, { reload: false, replace: false }); // リンククリックでルーティング
    });
}

function validateForm(form) {
    console.log('Validating form', form);
    if (!form) return false; // フォームが存在しない場合は無効
    // エラーメッセージと無効クラスをリセット
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    let isValid = true; // フォームの有効性フラグ
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

function submitForm(event) {
    console.log('Submitting form', event.target);
    event?.preventDefault(); // デフォルトの送信を防ぐ
    const form = event.target; // 送信されたフォームを取得
    form.querySelector('button[type="submit"]').disabled = true; // 送信ボタンを無効化
    if (validateForm(form)) { // バリデーションを実行
        const action = form.getAttribute('action'); // フォームのアクションURL
        const dataObj = Object.fromEntries(new FormData(form).entries()); // フォームデータをオブジェクトに変換
        delete dataObj['confirm-password']; // confirm-passwordは送信しない
        const jsonData = JSON.stringify(dataObj); // オブジェクトをJSON文字列に変換
        fetch(action, {
            method: 'POST',
            body: jsonData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include' // セッション維持
        })
        .then(async response => {
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
            console.log('Form submitted successfully:', response);
            return response.json();
        })
        .then((json) => {
            console.log('User data received:', json.user);
            sessionStorage.setItem('user', JSON.stringify(json.user)); // ユーザーデータをセッションストレージに保存
            saveRecordToIndexedDB(json.user); // IndexedDBにユーザーデータを保存
            route('/', { reload: true, replace: false }); // ホームページへリダイレクト
        })
        .catch((error) => {
            console.error('Error submitting form:', error);
            form.querySelector('button[type="submit"]').disabled = false; // 送信ボタンを再度有効化
            const errorMessage = document.createElement('p');
            errorMessage.textContent = error.message || 'エラーが発生しました。';
            errorMessage.classList.add('error-message');
            form.appendChild(errorMessage);
        });
    }
}




export default class Popup {
    constructor() {
        this.popup = null;
        this.form = null;
        this.init();
    }

    // 初期化処理
    init() {
        this.popup = document.querySelector('.popup'); // すでに存在する.popupを取得
        if (!this.popup) {
            fetch('/modules/ui/popup.html') // 存在しない場合はHTMLを取得
                .then(response => {
                    if (!response.ok) throw new Error('Failed to load popup HTML');
                    return response.text();
                })
                .then(html => {
                    document.body.insertAdjacentHTML('beforeend', html.trim());
                    this.popup = document.querySelector('.popup');
                    this.popup.querySelector('.close-popup-button').addEventListener('click', (e) => this.closePopup(e));
                    this.showPopup(); // ポップアップを表示
                })
                .catch(error => {
                    console.error('Error loading popup HTML:', error);
                    const existingPopup = document.querySelector('.popup');
                    if (existingPopup) existingPopup.remove();
                });
            return;
        }
    }

    closePopup(event) {
        event?.preventDefault(); // デフォルトの動作を防ぐ
        this.popup.style.display = 'none';
        route('/', { reload: false, replace: true }); // ルートをホームに変更
    }

    showPopup() {
        if (!this.popup) this.init(); // 再初期化
        this.popup.style.display = 'flex';
        this.showFormForCurrentPath(); // 現在のパスに応じてフォームを表示
    }

    // 現在のパスに応じてフォームを表示
    showFormForCurrentPath() {
        console.log('Showing form for current path');
        const path = window.location.pathname;
        this.popup.querySelectorAll('form').forEach(f => f.style.display = 'none');
        this.form = this.popup.querySelector(`form.${path.slice(1)}-form`);
        if (!this.form) return;
        this.form.style.display = 'flex';
        this.form.addEventListener('submit', (event) => this.submitForm(event)); // フォーム送信イベントを設定
        this.form.querySelector('p:last-of-type a')?.addEventListener('click', (event) => {
            event.preventDefault();
            const href = event.target.getAttribute('href');
            route(href, { reload: false, replace: false }); // リンククリックでルーティング
        });
    }

    // バリデーション
    validateForm() {
        console.log('Validating form:', this.form);
        if (!this.form) return false;
        this.form.querySelectorAll('.error-message').forEach(el => el.remove());
        this.form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = false;
        let isValid = true;
        this.form.querySelectorAll('input').forEach(input => {
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
        const password = this.form.querySelector('input[name="password"]');
        const confirm = this.form.querySelector('input[name="confirm-password"]');
        if (password && confirm && password.value !== confirm.value) {
            isValid = false;
            confirm.classList.add('invalid');
            const p = document.createElement('p');
            p.textContent = 'パスワードが一致しません。';
            p.classList.add('error-message');
            confirm.parentNode.insertBefore(p, confirm.nextSibling);
        }
        if (submitBtn) submitBtn.disabled = !isValid;
        return isValid;
    }

    // フォーム送信
    submitForm(event) {
        console.log('Submitting form:', this.form);
        event?.preventDefault(); // デフォルトの送信を防ぐ
        this.form.querySelector('button[type="submit"]').disabled = true; // 送信ボタンを無効化
        this.validateForm(); // バリデーションを実行
        const action = this.form.getAttribute('action'); // フォームのアクションURLを取得
        const dataObj = Object.fromEntries(new FormData(this.form).entries()); // フォームデータをオブジェクトに変換
        delete dataObj['confirm-password']; // confirm-passwordは送信しない
        const jsonData = JSON.stringify(dataObj); // オブジェクトをJSON文字列に変換
        fetch(action, {
            method: 'POST',
            body: jsonData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include' // セッション維持
        })
        .then(async response => {
            if (!response.status === 200) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }
            console.log('Form submitted successfully:', response);
            return response.json();
        })
        .then((json) => {
            console.log('User data received:', json.user);
            sessionStorage.setItem('user', JSON.stringify(json.user)); // ユーザーデータをセッションストレージに保存
            saveRecordToIndexedDB(json.user);
            route('/', { reload: true, replace: false });
        })
        .catch((error) => {
            if (submitBtn) submitBtn.disabled = false;
            const errorMessage = document.createElement('p');
            errorMessage.textContent = error.message || 'エラーが発生しました。';
            errorMessage.classList.add('error-message');
            this.form.appendChild(errorMessage);
        });
    }
}