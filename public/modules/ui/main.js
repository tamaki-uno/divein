import { hideLoading } from './loading.js';
import Line from './line.js';
import Html from './html.js';
import { getRecordFromAPI } from '../database.js';

/**
 * メインUIの初期化処理
 */
export default async function initMain(uuid) {
    console.log('[ui] Initializing main UI');
    const main = document.querySelector('main');
    if (!main) {
        console.error('[ui] <main> element not found');
        return;
    }

    const lineHtml = new Html('/modules/ui/html/line.html');

    try {
        const record = await getRecordFromAPI(uuid);
        if (!record) {
            console.error('[ui] No record found for UUID:', uuid);
            return;
        }
        const html = await lineHtml.getNode();
        const line = new Line(record, { html, parentNode: main, delete: null, level: 0 });
        hideLoading();
    } catch (error) {
        console.error('[ui] Error initializing Line:', error);
    }
}
