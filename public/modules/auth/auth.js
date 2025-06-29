const API_BASE_PATH = '/api/v0';

export default async function checkAuth() {
    console.log('checkAuth called'); // デバッグ用ログ
    return fetch('/api/v0/check', {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include' // セッション維持のためにクッキーを送信
    }) // POSTメソッドで認証チェック 
    .then(response => response ? response.json() : null) // レスポンスがnull/undefinedの場合はnullを返す
    .then(json => {
        if (json && json.success) {
            console.log('checkAuth success:', json); // 成功時のログ
            const payload = json.payload;
            console.log('Payload:', payload); // ペイロードの内容をログに出力
            return payload; // 認証成功時はペイロードを返す
        } else {
            console.warn('checkAuth failed:', json); // 失敗時のログ
            return null; // 認証失敗時はnullを返す
        }
    })
    .catch(() => null); // エラー発生時はnullを返す
}
