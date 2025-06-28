import { openDB } from 'idb';

// IndexedDBの初期化
export async function initIndexedDB() {
    return openDB('diveinDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('records')) {
                db.createObjectStore('records', { keyPath: 'uuid' });
            }
        }
    });
}

// IndexedDBにレコードを保存
export async function saveRecordToIndexedDB(record) {
    const db = await initIndexedDB();
    await db.put('records', record);
    return record;
}

// IndexedDBからレコードを取得
export async function getRecordFromIndexedDB(uuid) {
    const db = await initIndexedDB();
    return db.get('records', uuid);
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

// APIとIndexedDB両方と同期
export default async function syncDB(record) {
    // まずAPIと同期し、成功したらIndexedDBにも保存
    const apiRecord = await syncWithAPI(record);
    await syncWithIndexedDB(apiRecord);
    return apiRecord;
}