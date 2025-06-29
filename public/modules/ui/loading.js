


/**
 * ローディングUIを表示する関数
 * - ローディング要素が存在する場合は表示
 * - ローディング要素が見つからない場合は警告を出力
 * @returns {void}
 */
export function showLoading() {
    console.log('[ui] Showing loading UI'); // ローディングUI表示ログ
    const loadingElement = document.querySelector('.loading'); // ローディング要素を取得
    if (loadingElement) {
        loadingElement.style.display = 'block'; // ローディング要素を表示
    } else {
        console.warn('[ui] Loading element not found'); // ローディング要素が見つからない場合の警告
    }
}

/** * ローディングUIを非表示にする関数
 * - ローディング要素が存在する場合は非表示
 * - ローディング要素が見つからない場合は警告を出力
 * @returns {void}
 */
export function hideLoading() {
    console.log('[ui] Hiding loading UI'); // ローディングUI非表示ログ
    const loadingElement = document.querySelector('.loading'); // ローディング要素を取得
    if (loadingElement) {
        loadingElement.style.display = 'none'; // ローディング要素を非表示
    } else {
        console.warn('[ui] Loading element not found'); // ローディング要素が見つからない場合の警告
    }
}