/**
 * IndexedDBを利用したローカルデータベース管理モジュール
 * - openDBは使わず標準APIで実装
 * - レコードの保存・取得・同期処理を提供
 */

const API_URL = '/api/v0/sync';

/**
 * IndexedDBの初期化
 * データベースとオブジェクトストア(records)を作成
 * @returns {Promise<IDBDatabase>}
 */
export function initIndexedDB() {
    console.log('[database] Initializing IndexedDB');
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('diveinDB', 1);
        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('records')) {
                db.createObjectStore('records', { keyPath: 'uuid' });
            }
        };
        request.onsuccess = function (event) {
            resolve(event.target.result);
            console.log('[database] IndexedDB initialized successfully');
        };
        request.onerror = function (event) {
            reject(event.target.error);
            console.error('[database] IndexedDB initialization failed:', event.target.error);
        };
    });
}

/**
 * IndexedDBにレコードを保存
 * @param {Object} record - 保存するレコードオブジェクト
 * @returns {Promise<void>}
 */
export async function saveRecordToIndexedDB(record) {
    console.log('[database] Saving record to IndexedDB:', record);
    if (!record || !record.uuid) {
        throw new Error('saveRecordToIndexedDB: recordまたはuuidが未指定です');
    }
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('records', 'readwrite');
        const store = tx.objectStore('records');
        const req = store.put(record);
        req.onsuccess = () => {
            console.log('[database] Record saved successfully:', record.uuid);
            resolve();
        };
        req.onerror = (e) => {
            console.error('[database] Error saving record:', e.target.error);
            reject(e.target.error);
        };
    });
}

/**
 * IndexedDBからレコードを取得し、なければ新規作成
 * @param {string} uuid - レコードのUUID
 * @returns {Promise<Object>} - 取得または新規作成したレコード
 */
export async function getRecordFromIndexedDB(uuid) {
    console.log('[database] Getting record from IndexedDB:', uuid);
    if (!uuid) {
        throw new Error('getRecordFromIndexedDB: uuidが未指定です');
    }
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('records', 'readonly');
        const store = tx.objectStore('records');
        const req = store.get(uuid);
        req.onsuccess = async () => {
            if (req.result) {
                console.log('[database] Record found:', req.result);
                resolve(req.result);
            } else {
                console.log('[database] Record not found, creating new record:', uuid);
                const newRecord = { uuid, createdAt: new Date().toISOString() };
                try {
                    await saveRecordToIndexedDB(newRecord);
                    resolve(newRecord);
                } catch (e) {
                    console.error('[database] Error creating new record:', e);
                    reject(e);
                }
            }
        };
        req.onerror = (e) => {
            console.error('[database] Error getting record:', e.target.error);
            reject(e.target.error);
        };
    });
}

/**
 * IndexedDBからレコードを削除
 * @param {string} uuid - 削除するレコードのUUID
 * @returns {Promise<void>}
 */
export async function deleteRecordFromIndexedDB(uuid) {
    console.log('[database] Deleting record from IndexedDB:', uuid);
    if (!uuid) {
        throw new Error('deleteRecordFromIndexedDB: uuidが未指定です');
    }
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('records', 'readwrite');
        const store = tx.objectStore('records');
        const req = store.delete(uuid);
        req.onsuccess = () => {
            console.log('[database] Record deleted successfully:', uuid);
            resolve();
        };
        req.onerror = (e) => {
            console.error('[database] Error deleting record:', e.target.error);
            reject(e.target.error);
        };
    });
}

/**
 * APIと同期してレコードを更新
 * この関数は、IndexedDBからレコードを取得し、APIに送信して同期します。
 * APIからのレスポンスをIndexedDBに保存します。
 * @param {string} uuid - 同期するレコードのUUID
 * @returns {Promise<Object>} - 同期後のレコードオブジェクト
 */
export async function syncWithAPI(uuid) {
    console.log('[database] Syncing record with API:', uuid);
    try {
        const record = await getRecordFromIndexedDB(uuid);
        console.log('[database] Fetching record for sync:', record);
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        if (!response.ok) {
            throw new Error(`API sync failed: ${response.status}`);
        }
        console.log('[database] API sync successful:', response);
        const syncedRecord = await response.json();
        if (!syncedRecord || !syncedRecord.uuid) {
            throw new Error('APIから不正なレコードデータが返されました');
        }
        await saveRecordToIndexedDB(syncedRecord);
        console.log('[database] Record synced successfully:', syncedRecord);
        return syncedRecord;
    } catch (error) {
        console.error('API sync error:', error);
        throw error;
    }
}