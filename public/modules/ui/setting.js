
/**
 * 設定UIの表示をする関数
 * - 設定コンテナが存在しない場合は初期化関数を呼び出す
 * - 設定コンテナを表示する
 * @returns {void}
 * @async
 */
export async function showSettings() {
    console.log('[ui] Initializing settings UI'); // 設定UI初期化ログ
    const settingsContainer = document.querySelector('.settings-container') || await initSettings(); // 設定コンテナ要素を取得、存在しない場合は初期化関数を呼び出す
    settingsContainer.style.display = 'block'; // 設定コンテナを表示
}

/**
 * 設定UIを非表示にする関数
 * - 設定コンテナの表示を非表示にする
 * @returns {void}
 */
export function hideSettings() {}

/**
 * 設定UIを初期化する関数
 * - 設定UIのHTMLを非同期で取得し、bodyに挿入する
 * - エラーハンドリングを行い、ログ出力を行う
 * @returns {Promise<void>}
 * @async
 */
async function initSettings() {
    console.log('[ui] Initializing settings UI'); // 設定UI初期化
    try {
        const response = await fetch('/modules/ui/html/setting.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html); // HTMLを挿入
    } catch (error) {
        console.error('[ui] Error loading settings UI:', error); // エラーログ
    }
}