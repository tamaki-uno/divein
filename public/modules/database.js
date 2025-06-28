/**
 * IndexedDBを利用したローカルデータベース管理モジュール
 * - openDBは使わず標準APIで実装
 * - レコードの保存・取得・同期処理を提供
 */

// IndexedDBの初期化
// データベースとオブジェクトストア(records)を作成
export async function initIndexedDB() {
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
        };
        request.onerror = function (event) {
            reject(event.target.error);
        };
    });
}

// IndexedDBにレコードを保存
// @param {Object} record - 保存するレコードオブジェクト
export async function saveRecordToIndexedDB(record) {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('records', 'readwrite');
        const store = tx.objectStore('records');
        const req = store.put(record);
        req.onsuccess = () => resolve(record);
        req.onerror = (e) => reject(e.target.error);
    });
}

// IndexedDBからレコードを取得
// @param {string} uuid - レコードのUUID
export async function getRecordFromIndexedDB(uuid) {
    const db = await initIndexedDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('records', 'readonly');
        const store = tx.objectStore('records');
        const req = store.get(uuid);
        req.onsuccess = () => resolve(req.result);
        req.onerror = (e) => reject(e.target.error);
    });
}

// APIと同期
// @param {Object} record - 同期するレコード
// @returns {Promise<Object>} - 同期後のレコード
export async function syncWithAPI(record) {
    try {
        const response = await fetch('/api/v0/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        if (!response.ok) {
            throw new Error(`API sync failed: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
            return data.record;
        } else {
            throw new Error(data.message || 'Unknown API sync error');
        }
    } catch (error) {
        console.error('API sync error:', error);
        throw error;
    }
}

// IndexedDBと同期
// @param {Object} record - 同期するレコード
export async function syncWithIndexedDB(record) {
    try {
        await saveRecordToIndexedDB(record);
        return record;
    } catch (error) {
        console.error('IndexedDB sync error:', error);
        throw error;
    }
}

// データベースの同期を行う関数
// @param {string} uuid - 同期対象レコードのUUID
export async function syncDB(uuid) {
    try {
        const record = await getRecordFromIndexedDB(uuid);
        if (!record) {
            throw new Error(`Record with UUID ${uuid} not found in IndexedDB`);
        }
        const syncedRecord = await syncWithAPI(record);
        await syncWithIndexedDB(syncedRecord);
        return syncedRecord;
    } catch (error) {
        console.error('Database sync error:', error);
        throw error;
    }
}

// 全てのレコードを同期する関数
// IndexedDB内の全レコードをAPIと同期
export async function syncDBAll() {
    try {
        const db = await initIndexedDB();
        const tx = db.transaction('records', 'readonly');
        const store = tx.objectStore('records');
        const req = store.getAll();
        req.onsuccess = async () => {
            const records = req.result;
            for (const record of records) {
                try {
                    const syncedRecord = await syncWithAPI(record);
                    await syncWithIndexedDB(syncedRecord);
                } catch (error) {
                    console.error('Error syncing record:', error);
                }
            }
            console.log('All records synced successfully');
        };
        req.onerror = (e) => {
            console.error('Error syncing all records:', e.target.error);
        };
    } catch (error) {
        console.error('Error syncing all records:', error);
    }
}