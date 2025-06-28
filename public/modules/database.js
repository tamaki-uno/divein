// openDBを使わず、標準IndexedDB APIで実装

// IndexedDBの初期化
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
export async function syncWithAPI(record) {
    try {
        const response = await fetch('/api/v0/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
        const data = await response.json();
        if (data.success) {
            return data.record;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('API sync error:', error);
        throw error;
    }
}

// IndexedDBと同期
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
export async function syncDBAll() {
    try {
        const db = await initIndexedDB();
        const tx = db.transaction('records', 'readonly');
        const store = tx.objectStore('records');
        const req = store.getAll();
        req.onsuccess = () => {
            const records = req.result;
            records.forEach(record => {
                syncWithAPI(record)
                    .then(syncedRecord => syncWithIndexedDB(syncedRecord))
                    .catch(error => console.error('Error syncing record:', error));
            });
            console.log('All records synced successfully');
        };
        req.onerror = (e) => {
            console.error('Error syncing all records:', e.target.error);
        };
    } catch (error) {
        console.error('Error syncing all records:', error);
    }
}