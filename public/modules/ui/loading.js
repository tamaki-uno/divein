
import route from '/modules/router.js'; // ルーティング用モジュール


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
        loadingElement.style.display = 'flex'; // ローディング要素を表示
        // document.querySelector('header').style.filter = 'blur(5px)'; // ヘッダーにぼかし効果を適用
        // document.querySelector('main').style.filter = 'blur(5px)'; // メインにぼかし効果を適用
        // if ((!document.querySelector('.popup')) || (document.querySelector('.popup').style.display === 'none')) {
            setTimeout(() => {
                if (loadingElement.style.display === 'flex') {
                    console.warn('[ui] Reloading page due to loading UI'); // ローディングUI表示中にリロード
                    route(window.location.pathname, { reload: true, overwrite: true }); // ページをリロード
                }
                }, 5000); // 5秒後にリロード
            // }

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
        // document.querySelector('header').style.filter = 'none'; // ヘッダーのぼかし効果を解除
        // document.querySelector('main').style.filter = 'none'; // メインのぼかし効果を解除
    } else {
        console.warn('[ui] Loading element not found'); // ローディング要素が見つからない場合の警告
    }
}