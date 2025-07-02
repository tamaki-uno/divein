/**
 * ローディングUIを表示する関数
 * - ローディング要素が存在する場合は表示
 * - ローディング要素が見つからない場合は警告を出力
 * @returns {void}
 */
export function showLoading() {
    const loadingDiv = document.querySelector('div.loading');
    loadingDiv.style.display = 'flex'; // ローディング要素を表示
    const loadingIcon = document.querySelector('img.loading-icon');
    loadingIcon.style.display = 'block'; // ローディングアイコンを表示

}

/** * ローディングUIを非表示にする関数
 * - ローディング要素が存在する場合は非表示
 * - ローディング要素が見つからない場合は警告を出力
 * @returns {void}
 */
export function hideLoading() {
    const loadingDiv = document.querySelector('div.loading'); // ローディング要素を取得
    loadingDiv.style.display = 'none'; // ローディング要素を非表示
    const loadingIcon = document.querySelector('img.loading-icon');
    loadingIcon.style.display = 'none'; // ローディングアイコンを非表示
}