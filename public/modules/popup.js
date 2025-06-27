'use strict';

console.log('popup.js loaded');

// ポップアップのフォームを切り替える関数
export default function switchForm() {
    // 現在のパスを取得
    const path = window.location.pathname;
    console.log('Current path:', path);
    if (!['/login', '/signup', '/logout'].includes(path)) {
        console.error('Invalid path for popup:', path);
        return;
    }
    // ポップアップのHTMLを読み込む
    const popup = document.querySelector('.popup');
    if (!popup) return;
    popup.style.display = 'flex';
    popup.querySelector('.close-popup-button').onclick = () => {
        popup.style.display = 'none';
        window.history.pushState({}, '', '/'); // ポップアップを閉じたらホームに戻る
    };
    // フォームの切り替え
    popup.querySelectorAll('form').forEach(form => form.style.display = 'none');
    const form = popup.querySelector(`form.${path.slice(1)}-form`);
    if (!form) return;
    form.style.display = 'flex';

    // 既存のsubmitイベントリスナーを解除してから追加
    form.onsubmit = (event) => {
        event.preventDefault();
        // if (!checkFormValidity(form)) return;
        console.log('Form is valid, submitting...');
        submitForm(form, path);
    };

    // 最後の<p>要素のリンクにクリックイベントリスナーを追加
    const pList = form.querySelectorAll('p');
    if (pList.length > 0) {
        const link = pList[pList.length - 1].querySelector('a');
        if (link) {
            link.onclick = (event) => {
                event.preventDefault();
                const href = link.getAttribute('href');
                window.history.pushState({}, '', href);
                switchForm();
            };
        }
    }
}

// フォームのバリデーションチェック
function checkFormValidity(form, path) {
    form.querySelectorAll('.error-message').forEach(el => el.remove()); // 既存のエラーメッセージをクリア
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid')); // 既存の無効スタイルをクリア
    form.querySelector('button[type="submit"]').disabled = false; // ボタンを有効化
    const inputs = form.querySelectorAll('input');
    let isValid = true;
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
    // パスワード確認チェック（サインアップ時のみ）
    // if (path === '/signup') {
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
    // }
    form.querySelector('button[type="submit"]').disabled = !isValid; // ボタンの有効/無効を設定
    return isValid;
}

// フォームの送信処理
function submitForm(form, path) {
    if (!form.checkValidity(form, path)) {
        console.error('Form is invalid, cannot submit.');
        return;
    }
    console.log('Submitting form:', form);
    form.querySelector('button[type="submit"]').disabled = true;
    const formData = new FormData(form);
    const dataObj = Object.fromEntries(formData.entries());
    // パスワード確認欄は送信データから除外
    delete dataObj['confirm-password'];
    const jsonData = JSON.stringify(dataObj);
    const action = form.getAttribute('action');
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
        if (path === '/login') {
            window.location.href = '/';
        } else if (path === '/signup') {
            window.location.href = '/login';
        } else if (path === '/logout') {
            window.location.href = '/';
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        form.querySelector('button[type="submit"]').disabled = false;
        const errorMessage = document.createElement('p');
        errorMessage.textContent = error.message || 'エラーが発生しました。';
        errorMessage.classList.add('error-message');
        form.appendChild(errorMessage);
    });
}