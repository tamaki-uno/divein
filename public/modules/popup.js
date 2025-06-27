'use strict';

console.log('popup.js loaded');

// ポップアップのフォームを切り替える関数
export default function switchForm() {
    const path = window.location.pathname; // 現在のパスを取得
    console.log('Current path:', path); // デバッグ用に現在のパスを表示
    if (path !== '/login' && path !== '/signup' && path !== '/logout') console.error('Invalid path for popup:', path); // パスが無効な場合はエラーメッセージを表示
    // ポップアップ要素を取得
    const popup = document.querySelector('.popup'); // ポップアップ要素を取得
    popup.querySelectorAll('form').forEach(form => form.style.display = 'none'); // すべてのフォームを非表示にする
    // 現在のパスに対応するフォームを表示
    const form = popup.querySelector(`form.${path.slice(1)}-form`); // 現在のパスに対応するフォームを取得
    form.style.display = 'flex'; // 対応するフォームを表示
    // フォームの送信イベントリスナーを追加
    // form.addEventListener('submit', (event) => {
    //     event.preventDefault();
    //     form.querySelector('button[type="submit"]').disabled = true; // 送信ボタンを無効化
    //     const formData = new FormData(form); // フォームデータを取得
    //     if 
    //     // フォームの送信処理をここに追加
    //     console.log('Form submitted');
    // });
    form.addEventListener('submit', (event) => {
        event.preventDefault(); // デフォルトのフォーム送信を防ぐ
        if (!checkFormValidity(form)) return; // フォームの有効性をチェック
        // フォームの有効性が確認できたら送信処理を呼び出す
        console.log('Form is valid, submitting...');
        submitForm(form); // フォームの送信処理を呼び出す
    });
    // 最後の<p>要素のリンクにクリックイベントリスナーを追加　再読み込み無しでlogin/signupを切り替える
    const pList = form.querySelectorAll('p'); // フォーム内のすべての<p>要素を取得
    if (pList.length > 0) {
        // 最後の<p>要素のリンクにクリックイベントリスナーを追加
        pList[pList.length - 1].querySelector('a').addEventListener('click', (event) => {
            event.preventDefault(); // デフォルトのリンク動作を防ぐ
            const href = event.target.getAttribute('href'); // リンクのhref属性を取得 
            window.history.pushState({}, '', href); // URLを更新
            switchForm(); // ポップアップのフォームを再描画
        });
    }
}

function checkFormValidity(form) {
    const inputs = form.querySelectorAll('input'); // フォーム内のすべてのinput要素を取得
    let isValid = true; // フォームが有効かどうかのフラグ
    inputs.forEach(input => {
        if (!input.checkValidity()) { // 入力が無効な場合
            isValid = false; // フォームは無効
            input.classList.add('invalid'); // 無効な入力にクラスを追加
            const p = document.createElement('p'); // エラーメッセージ用の<p>要素を作成
            p.textContent = input.validationMessage; // 入力の検証メッセージ
            p.classList.add('error-message'); // エラーメッセージにクラスを追加
            input.parentNode.insertBefore(p, input.nextSibling); // 入力の後にエラーメッセージを挿入
        } else if (input.classList.contains('invalid')) { // 入力が有効
            input.parentNode.querySelector('.error-message').remove(); // エラーメッセージを削除
            input.classList.remove('invalid'); // 無効な入力からクラスを削除
        }
    });
    return isValid; // フォームの有効性を返す
}

function submitForm(form) {
    console.log('Submitting form:', form); // デバッグ用にフォームを表示
    form.querySelector('button[type="submit"]').disabled = true; // 送信ボタンを無効化
    const formData = new FormData(form); // フォームデータを取得
    console.log('Form data:', Array.from(formData.entries())); // デバッグ用にフォームデータを表示
    const jsonData = JSON.stringify(Object.fromEntries(formData)); // フォームデータをJSONに変換
    console.log('JSON data:', jsonData); // デバッグ用にJSONデータを表示
    const action = form.getAttribute('action'); // フォームのアクションURLを取得
    console.log('Form action:', action); // デバッグ用にアクションURLを表示
    fetch(action, {
        method: 'POST',
        body: jsonData, // フォームデータをJSONに変換
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json' // JSON形式で送信
        }
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            // エラー時の処理
            console.error('Error:', data.message);
            form.querySelector('button[type="submit"]').disabled = false; // 送信ボタンを再度有効化
            const errorMessage = document.createElement('p'); // エラーメッセージ用の<p>要素を作成
            errorMessage.textContent = data.message; // エラーメッセージを設定
            errorMessage.classList.add('error-message'); // エラーメッセージにクラスを追加
            form.appendChild(errorMessage); // フォームの最後にエラーメッセージを追加
            return; // エラーが発生した場合は処理を終了
        }
        console.log('Success:', data);
        // 成功時の処理
        if (path === '/login') {
            // ログイン成功時の処理
            console.log('Login successful:', data);
            window.location.href = '/'; // ホームページにリダイレクト
        } else if (path === '/signup') {
            // サインアップ成功時の処理
            console.log('Signup successful:', data);
            window.location.href = '/login'; // ログインページにリダイレクト
        } else if (path === '/logout') {
            // ログアウト成功時の処理
            console.log('Logout successful:', data);
            window.location.href = '/'; // ホームページにリダイレクト
        }
        form.querySelector('button[type="submit"]').disabled = false; // 送信ボタンを再度有効化
    })
    .catch((error) => {
        console.error('Error:', error);
        // エラー時の処理をここに追加
    });
}