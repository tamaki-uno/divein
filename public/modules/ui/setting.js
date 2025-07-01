import Html from './html.js'; // HTMLモジュールのインポート
import route from '../router.js'; // ルーティング関数をインポート
import { hideLoading } from './loading.js';

const settingsHtml = new Html('/modules/ui/html/setting.html'); // 設定UIのHTMLファイルパスを指定

/**
 * 設定UIの表示をする関数
 * - 設定コンテナが存在しない場合は初期化関数を呼び出す
 * - 設定コンテナを表示する
 * @returns {void}
 * @async
 */
export async function showSettings() {
    console.log('[ui] Initializing settings UI'); // 設定UI初期化ログ
    const settingsContainer = document.querySelector('.settings-container') || await initSettings(); // 設定コンテナを取得、存在しない場合は初期化関数を呼び出す
    settingsContainer.style.width = '300px'; // 設定コンテナの幅を300pxに設定
    settingsContainer.style.right = '0'; // 設定コンテナの表示位置を右に設定
    settingsContainer.style.boxShadow = '-10px 0px 10px rgba(0, 0, 0, 0.1)'; // ボックスシャドウを設定
    hideLoading(); // ローディングUIを非表示にする
}

/**
 * 設定UIを非表示にする関数
 * - 設定コンテナの表示を非表示にする
 * @returns {void}
 */
export function hideSettings() {
    console.log('[ui] Hiding settings UI'); // 設定UI非表示ログ
    const settingsContainer = document.querySelector('.settings-container'); // 設定コンテナを取得
    settingsContainer.style.right = '-300px'; // 設定コンテナの表示位置を非表示に設定
    // settingsContainer.style.width = '0'; // 設定コンテナの幅を0に設定
    settingsContainer.style.boxShadow = 'none'; // ボックスシャドウを削除
    route('/'); // ホームページへルーティング
}

/**
 * 設定UIを初期化する関数
 * - 設定UIのHTMLを非同期で取得し、bodyに挿入する
 * - エラーハンドリングを行い、ログ出力を行う
 * @returns {Promise<void>}
 * @async
 */
async function initSettings() {
    console.log('[ui] Initializing settings UI'); // 設定UI初期化
    return settingsHtml.getNode().then(node => {
        console.log('[ui] Settings UI loaded successfully'); // 成功ログ
        const settingsContainer = node.querySelector('.settings-container'); // 設定コンテナ要素を取得
        settingsContainer.querySelector('.close-icon').addEventListener('click', () => hideSettings()); // 閉じるアイコンのクリックイベントを設定
        // document.body.insertAdjacentElement
        return document.body.appendChild(settingsContainer); // bodyに設定コンテナを挿入
    }).catch(error => {
        console.error('[ui] Error loading settings UI:', error); // エラーログ
        return null; // エラー時はnullを返す
    });
    // return fetch('/modules/ui/html/setting.html')
    //     .then(response => {
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`);
    //         }
    //         return response.text();
    //     })
    //     .then(html => {
    //         document.body.insertAdjacentHTML('beforeend', html); // HTMLを挿入
    //         console.log('[ui] Settings UI loaded successfully'); // 成功ログ
    //         return document.querySelector('.settings-container'); // 設定コンテナ要素を返す
    //     })
    //     .catch(error => {
    //         console.error('[ui] Error loading settings UI:', error); // エラーログ
    //         return null; // エラー時はnullを返す
    //     });
}