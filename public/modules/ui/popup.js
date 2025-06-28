'use strict';

console.log('popup.js loaded');

export default class Popup {
    constructor() {
        this.popup = null;
        this.form = null;
        this.init();
    }

    // 初期化処理
    init() {
        // すでに.popupが存在する場合は再生成しない
        if (document.querySelector('.popup')) {
            this.popup = document.querySelector('.popup');
            this.showFormForCurrentPath();
            return;
        }
        fetch('/modules/popup.html')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load popup HTML');
                return response.text();
            })
            .then(html => {
                document.body.insertAdjacentHTML('beforeend', html);
                this.popup = document.querySelector('.popup');
                if (!this.popup) return;
                this.setupCloseButton();
                this.showFormForCurrentPath();
            })
            .catch(error => {
                console.error('Error loading popup HTML:', error);
                const popup = document.querySelector('.popup');
                if (popup) popup.remove();
            });
    }

    // 閉じるボタンのイベント設定
    setupCloseButton() {
        const closeBtn = this.popup.querySelector('.close-popup-button');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.popup.style.display = 'none';
                window.history.pushState({}, '', '/');
            };
        }
    }

    // 現在のパスに応じてフォームを表示
    showFormForCurrentPath() {
        const path = window.location.pathname;
        if (!['/login', '/signup', '/logout'].includes(path)) {
            if (this.popup) this.popup.style.display = 'none';
            return;
        }
        this.popup.style.display = 'flex';
        this.popup.querySelectorAll('form').forEach(f => f.style.display = 'none');
        this.form = this.popup.querySelector(`form.${path.slice(1)}-form`);
        if (!this.form) return;
        this.form.style.display = 'flex';
        this.setupFormEvents();
    }

    // フォームのイベント設定
    setupFormEvents() {
        // submitイベント
        this.form.onsubmit = (event) => {
            event.preventDefault();
            if (!this.validateForm()) return;
            this.submitForm();
        };
        // 最後の<p>要素のリンクイベント
        const pList = this.form.querySelectorAll('p');
        if (pList.length > 0) {
            const link = pList[pList.length - 1].querySelector('a');
            if (link) {
                link.onclick = (event) => {
                    event.preventDefault();
                    const href = link.getAttribute('href');
                    window.history.pushState({}, '', href);
                    this.showFormForCurrentPath();
                };
            }
        }
    }

    // バリデーション
    validateForm() {
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
    submitForm() {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        const dataObj = Object.fromEntries(new FormData(this.form).entries());
        delete dataObj['confirm-password'];
        const jsonData = JSON.stringify(dataObj);
        const action = this.form.getAttribute('action');
        console.log('Submitting form to:', action, 'with data:', dataObj);
        fetch(action, {
            method: 'POST',
            body: jsonData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            credentials: 'include' // 追加: セッション維持のため
        })
        .then(async response => {
            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error('サーバーから不正なレスポンスが返されました');
            }
            console.log('Form submit response:', response.status, data);
            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'エラーが発生しました');
            }
            return data;
        })
        .then(data => {
            console.log('Form submit success, checking login state...');
            // ログイン直後に認証チェック
            fetch('/api/v0/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            })
            .then(async response => {
                if (response.status === 200) {
                    console.log('Login state confirmed, redirecting to /');
                    window.location.href = '/';
                } else {
                    console.warn('Login state not confirmed, redirecting to /login');
                    window.location.href = '/login';
                }
            });
        })
        .catch((error) => {
            console.error('Error:', error);
            if (submitBtn) submitBtn.disabled = false;
            const errorMessage = document.createElement('p');
            errorMessage.textContent = error.message || 'エラーが発生しました。';
            errorMessage.classList.add('error-message');
            this.form.appendChild(errorMessage);
        });
    }
}