import cookie from 'cookie';


document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = form.username.value.trim();
        const password = form.password.value.trim();
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        // if (!email || !username || !password) {
        if (!username || !password) {
            // alert('すべてのフィールドを入力してください。');
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger';
            alertDiv.textContent = 'すべてのフィールドを入力してください。';
            form.prepend(alertDiv);
            submitButton.disabled = false;
            return;
        }

        try {
            const response = await fetch('/api/v0/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // body: JSON.stringify({ email, username, password })
                body: JSON.stringify({ username, password })
            });
            const data = await response.json(); // レスポンスのJSONを取得
            if (response.ok && data.accessToken) {
                // ログイン成功時の処理
                // localStorage.setItem('accessToken', data.accessToken); // アクセストークンをローカルストレージに保存

                const errorData = await response.json();
                alert(`エラー: ${errorData.error}`);
                return;
            }
            // ログイン成功後、/index.htmlにリダイレクト
            window.location.href = '/index.html';
        } catch (error) {
            console.error('APIエラー:', error);
            alert('予期しないエラーが発生しました。');
        } finally {
            submitButton.disabled = false;
        }
    });
});