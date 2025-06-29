

export function showSettings() {
    console.log('[ui] Initializing settings UI'); // 設定UI初期化ログ
    // const settingsContainer = document.querySelector('.settings-container'); // 設定コンテナ要素を取得
    // settingsContainer?.style.display = 'block'; // 設定コンテナを表示
    // if (!settingsContainer) {
    //     fetch('/modules/ui/setting.html')
    //         .then(response => response.text())
    //         .then(html => {
    //             document.body.insertAdjacentHTML('beforeend', html);
    //         })
    //         .catch(error => {
    //             console.error('[ui] Error loading settings UI:', error); // エラーログ
    //         });
    // }
    const settingsContainer = document.querySelector('.settings-container') || initSettings(); // 設定コンテナ要素を取得、存在しない場合は初期化関数を呼び出す
    settingsContainer.style.display = 'block'; // 設定コンテナを表示
}


async function initSettings() {
    console.log('[ui] Initializing settings UI'); // 設定UI初期化
    try {
        const response = await fetch('/modules/ui/setting.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html); // HTMLを挿入
    } catch (error) {
        console.error('[ui] Error loading settings UI:', error); // エラーログ
    }
}