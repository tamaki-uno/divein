



export function showLoading() {
    console.log('[ui] Showing loading UI'); // ローディングUI表示ログ
    const loadingElement = document.querySelector('.loading'); // ローディング要素を取得
    if (loadingElement) {
        loadingElement.style.display = 'block'; // ローディング要素を表示
    } else {
        console.warn('[ui] Loading element not found'); // ローディング要素が見つからない場合の警告
    }
}

export function hideLoading() {
    console.log('[ui] Hiding loading UI'); // ローディングUI非表示ログ
    const loadingElement = document.querySelector('.loading'); // ローディング要素を取得
    if (loadingElement) {
        loadingElement.style.display = 'none'; // ローディング要素を非表示
    } else {
        console.warn('[ui] Loading element not found'); // ローディング要素が見つからない場合の警告
    }
}