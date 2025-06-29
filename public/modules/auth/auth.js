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
    .then(json => json ? json.payload : null) // JSONがnull/undefinedの場合はnullを返す
    .catch(() => null); // エラー発生時はnullを返す
}
