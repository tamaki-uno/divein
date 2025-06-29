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
    console.log('checkAuth response type:', response?.type);
    console.log('checkAuth response status:', response?.status);
    console.log('checkAuth response ok:', response?.ok);

    // const payload = response.payload;
    // console.log('checkAuth response payload:', response?.payload);

    const json = await response.json();
    console.log('checkAuth response json:', json);
    const payload = json.payload;
    console.log('checkAuth response payload:', payload);
    console.log('checkAuth response payload type:', typeof payload);
    console.log('checkAuth response payload keys:', Object.keys(payload));
    console.log('checkAuth response payload uuid:', payload?.uuid);
    // return json;
    return payload;
}
