'use strict';

console.log('popup.js loaded');

export default class Popup {
    constructor() {
        this.init();
    }
    // 初期化処理
    init() {
        fetch('/modules/popup.html')
            .then(response => {
                if (!response.ok) throw new Error('Failed to load popup HTML');
                return response.text();
            })
            .then(popupHtml => {
                // ポップアップのHTMLをbodyに追加
                document.body.insertAdjacentHTML('beforeend', popupHtml);
                this.popup = document.querySelector('.popup');
                if (!this.popup) {
                    console.error('Popup element not found in the document.');
                    return;
                }
                // ポップアップのフォームを切り替える
                this.switchForm();
            })
            .catch(error => {
                console.error('Error loading popup HTML:', error);
            });
    }
    // ポップアップのフォームを切り替える関数
    switchForm() {
        // 現在のパスを取得
        console.log('Current path:', window.location.pathname);
        if (!['/login', '/signup', '/logout'].includes(window.location.pathname)) {
            console.error('Invalid path for popup:', window.location.pathname);
            return;
        }
        // ポップアップのHTML要素を取得
        const popup = document.querySelector('.popup');
        if (!popup) return;
        popup.style.display = 'flex';
        // 閉じるボタンのイベント設定
        popup.querySelector('.close-popup-button').onclick = () => {
            popup.style.display = 'none';
            window.history.pushState({}, '', '/'); // ポップアップを閉じたらホームに戻る
        };
        // すべてのフォームを非表示にし、該当フォームのみ表示
        popup.querySelectorAll('form').forEach(form => form.style.display = 'none');
        this.targetForm = popup.querySelector(`form.${window.location.pathname.slice(1)}-form`);
        if (!this.targetForm) return;
        this.targetForm.style.display = 'flex';

        // 既存のsubmitイベントリスナーを解除してから追加
        this.targetForm.onsubmit = (event) => {
            event.preventDefault();
            // バリデーションチェック
            if (!this.checkFormValidity()) return;
            console.log('Form is valid, submitting...');
            this.submitForm();
        };
        // 最後の<p>要素のリンクにクリックイベントリスナーを追加
        const pList = this.targetForm.querySelectorAll('p');
        if (pList.length > 0) {
            const link = pList[pList.length - 1].querySelector('a');
            if (link) {
                link.onclick = (event) => {
                    event.preventDefault();
                    const href = link.getAttribute('href');
                    window.history.pushState({}, '', href);
                    this.switchForm();
                };
            }
        }
    }
    // フォームのバリデーションチェック
    checkFormValidity() {
        // 既存のエラーメッセージと無効スタイルをクリア
        this.targetForm.querySelectorAll('.error-message').forEach(el => el.remove());
        this.targetForm.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
        this.targetForm.querySelector('button[type="submit"]').disabled = false;
        const inputs = this.targetForm.querySelectorAll('input');
        let isValid = true;
        // 各input要素のバリデーション
        inputs.forEach(input => {
            if (!input.checkValidity()) {
                isValid = false;
                input.classList.add('invalid');
                const p = document.createElement('p');
                p.textContent = input.validationMessage;
                p.classList.add('error-message');
                input.parentNode.insertBefore(p, input.nextSibling);
            }
        });
        // サインアップ時のパスワード確認チェック
        const password = this.targetForm.querySelector('input[name="password"]');
        const confirm = this.targetForm.querySelector('input[name="confirm-password"]');
        if (password && confirm && password.value !== confirm.value) {
            isValid = false;
            confirm.classList.add('invalid');
            const p = document.createElement('p');
            p.textContent = 'パスワードが一致しません。';
            p.classList.add('error-message');
            confirm.parentNode.insertBefore(p, confirm.nextSibling);
        }
        this.targetForm.querySelector('button[type="submit"]').disabled = !isValid;
        return isValid;
    }
    // フォームの送信処理
    submitForm() {
        // バリデーション関数の呼び出し修正
        if (!this.checkFormValidity()) {
            console.error('Form is invalid, cannot submit.');
            return;
        }
        console.log('Submitting form:', this.targetForm);
        this.targetForm.querySelector('button[type="submit"]').disabled = true;
        const dataObj = Object.fromEntries(new FormData(this.targetForm).entries());
        // パスワード確認欄は送信データから除外
        delete dataObj['confirm-password'];
        const jsonData = JSON.stringify(dataObj);
        const action = this.targetForm.getAttribute('action');
        fetch(action, {
            method: 'POST',
            body: jsonData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(async response => {
            let data;
            try {
                data = await response.json();
            } catch {
                throw new Error('サーバーから不正なレスポンスが返されました');
            }
            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'エラーが発生しました');
            }
            return data;
        })
        .then(data => {
            console.log('Success:', data);
            // ページ遷移処理
            if (window.location.pathname === '/login') {
                window.location.href = '/';
            } else if (window.location.pathname === '/signup') {
                window.location.href = '/login';
            } else if (window.location.pathname === '/logout') {
                window.location.href = '/';
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            this.targetForm.querySelector('button[type="submit"]').disabled = false;
            const errorMessage = document.createElement('p');
            errorMessage.textContent = error.message || 'エラーが発生しました。';
            errorMessage.classList.add('error-message');
            this.targetForm.appendChild(errorMessage);
        });
    }

}


// // ポップアップのフォームを切り替える関数
// export default function switchForm() {
//     // 現在のパスを取得
//     const path = window.location.pathname;
//     console.log('Current path:', path);
//     if (!['/login', '/signup', '/logout'].includes(path)) {
//         console.error('Invalid path for popup:', path);
//         return;
//     }
//     // ポップアップのHTML要素を取得
//     const popup = document.querySelector('.popup');
//     if (!popup) return;
//     popup.style.display = 'flex';
//     // 閉じるボタンのイベント設定
//     popup.querySelector('.close-popup-button').onclick = () => {
//         popup.style.display = 'none';
//         window.history.pushState({}, '', '/'); // ポップアップを閉じたらホームに戻る
//     };
//     // すべてのフォームを非表示にし、該当フォームのみ表示
//     popup.querySelectorAll('form').forEach(form => form.style.display = 'none');
//     const form = popup.querySelector(`form.${path.slice(1)}-form`);
//     if (!form) return;
//     form.style.display = 'flex';

//     // 既存のsubmitイベントリスナーを解除してから追加
//     form.onsubmit = (event) => {
//         event.preventDefault();
//         // バリデーションチェック
//         if (!checkFormValidity(form, path)) return;
//         console.log('Form is valid, submitting...');
//         submitForm(form, path);
//     };

//     // 最後の<p>要素のリンクにクリックイベントリスナーを追加
//     const pList = form.querySelectorAll('p');
//     if (pList.length > 0) {
//         const link = pList[pList.length - 1].querySelector('a');
//         if (link) {
//             link.onclick = (event) => {
//                 event.preventDefault();
//                 const href = link.getAttribute('href');
//                 window.history.pushState({}, '', href);
//                 switchForm();
//             };
//         }
//     }
// }

// // フォームのバリデーションチェック
// function checkFormValidity(form, path) {
//     // 既存のエラーメッセージと無効スタイルをクリア
//     form.querySelectorAll('.error-message').forEach(el => el.remove());
//     form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
//     form.querySelector('button[type="submit"]').disabled = false;
//     const inputs = form.querySelectorAll('input');
//     let isValid = true;
//     // 各input要素のバリデーション
//     inputs.forEach(input => {
//         if (!input.checkValidity()) {
//             isValid = false;
//             input.classList.add('invalid');
//             const p = document.createElement('p');
//             p.textContent = input.validationMessage;
//             p.classList.add('error-message');
//             input.parentNode.insertBefore(p, input.nextSibling);
//         }
//     });
//     // サインアップ時のパスワード確認チェック
//     const password = form.querySelector('input[name="password"]');
//     const confirm = form.querySelector('input[name="confirm-password"]');
//     if (password && confirm && password.value !== confirm.value) {
//         isValid = false;
//         confirm.classList.add('invalid');
//         const p = document.createElement('p');
//         p.textContent = 'パスワードが一致しません。';
//         p.classList.add('error-message');
//         confirm.parentNode.insertBefore(p, confirm.nextSibling);
//     }
//     form.querySelector('button[type="submit"]').disabled = !isValid;
//     return isValid;
// }

// // フォームの送信処理
// function submitForm(form, path) {
//     // バリデーション関数の呼び出し修正
//     if (!checkFormValidity(form, path)) {
//         console.error('Form is invalid, cannot submit.');
//         return;
//     }
//     console.log('Submitting form:', form);
//     form.querySelector('button[type="submit"]').disabled = true;
//     const formData = new FormData(form);
//     const dataObj = Object.fromEntries(formData.entries());
//     // パスワード確認欄は送信データから除外
//     delete dataObj['confirm-password'];
//     const jsonData = JSON.stringify(dataObj);
//     const action = form.getAttribute('action');
//     fetch(action, {
//         method: 'POST',
//         body: jsonData,
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json'
//         }
//     })
//     .then(async response => {
//         let data;
//         try {
//             data = await response.json();
//         } catch {
//             throw new Error('サーバーから不正なレスポンスが返されました');
//         }
//         if (!response.ok || data.success === false) {
//             throw new Error(data.message || 'エラーが発生しました');
//         }
//         return data;
//     })
//     .then(data => {
//         console.log('Success:', data);
//         // ページ遷移処理
//         if (path === '/login') {
//             window.location.href = '/';
//         } else if (path === '/signup') {
//             window.location.href = '/login';
//         } else if (path === '/logout') {
//             window.location.href = '/';
//         }
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//         form.querySelector('button[type="submit"]').disabled = false;
//         const errorMessage = document.createElement('p');
//         errorMessage.textContent = error.message || 'エラーが発生しました。';
//         errorMessage.classList.add('error-message');
//         form.appendChild(errorMessage);
//     });
// }