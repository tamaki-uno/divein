const API_BASE_PATH = '/api/v0';

export async function checkAuth() {
    const response = await fetch(`${API_BASE_PATH}/check`, {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    }).catch(error => {
        console.error('checkAuth fetch error:', error);
        return null;
    });
    // レスポンスの詳細をログ出力
    console.log('checkAuth response:', response);
    console.log('status:', response.status);
    console.log('statusText:', response.statusText);
    console.log('ok:', response.ok);
    console.log('type:', response.type);
    console.log('url:', response.url);
    console.log('redirected:', response.redirected);
    console.log('headers:', Array.from(response.headers.entries()));
    // if (!response.ok) return null;

    const json = await response.json();
    console.log('checkAuth response json:', json);
    return json;
}
