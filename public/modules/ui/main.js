import { hideLoading } from './loading.js';
import Line from './line.js';
import Html from './html.js';

/**
 * メインUIの初期化処理
 */
export default async function initMain() {
    console.log('[ui] Initializing main UI');
    const main = document.querySelector('main');
    if (!main) {
        console.error('[ui] <main> element not found');
        return;
    }

    const user = getUserFromSession();

    try {
        const html = await loadLineHtml();
        const line = new Line(user, { html, parentNode: main, delete: null, level: 0 });
        hideLoading();
    } catch (error) {
        console.error('[ui] Error initializing Line:', error);
    }
}

/**
 * セッションストレージからユーザーデータを取得
 * @returns {Object|null}
 */
function getUserFromSession() {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('[ui] Failed to parse user data:', e);
        return null;
    }
}

/**
 * Line HTMLを非同期で取得
 * @returns {Promise<string>}
 */
function loadLineHtml() {
    const lineHtml = new Html('/modules/ui/html/line.html');
    return lineHtml.getHtml();
}