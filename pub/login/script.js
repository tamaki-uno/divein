
document.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('form');
    // const emailInput = document.querySelector('#email');
    // const usernameInput = document.querySelector('#username');
    // const passwordInput = document.querySelector('#password');
    // const submitButton = document.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        submitButton.disabled = true;

        // const email = emailInput.value.trim();
        // const username = usernameInput.value.trim();
        // const password = passwordInput.value.trim();
        const username = form.username.value.trim();
        const password = form.password.value.trim();

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
            data = await response.json();

            if (response.ok && data.accessToken) {
                // ログイン成功時の処理
                localStorage.setItem('accessToken', data.accessToken);
                const errorData = await response.json();
                alert(`エラー: ${errorData.error}`);
                return;
            }

            const data = await response.json();
            alert('ログイン成功！');
            // ログイン成功後の処理をここに追加
        } catch (error) {
            console.error('APIエラー:', error);
            alert('予期しないエラーが発生しました。');
        } finally {
            submitButton.disabled = false;
        }
    });
});