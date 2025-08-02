import type { NoteData } from "./types";
import { openDB, type IDBPDatabase } from 'idb';


// --- DBの初期化 ---
let db: IDBPDatabase | null = null;
const DB_NAME = 'DIVEIN_DB';

async function getDb(storeName: string): Promise<IDBPDatabase> {
	if (db) return db;
	db = await openDB(DB_NAME, 1, {
		upgrade(db) {
			db.createObjectStore(storeName, { keyPath: 'id' });
		}
	});
	return db;
}

// --- DB操作関数 ---
export const idb_getNote = async (uuid: string): Promise<NoteData | undefined> => {
	const db = await getDb('Notes');
	return db.get('Notes', uuid);
};

export const idb_saveNote = async (note: NoteData): Promise<void> => {
	const db = await getDb('Notes');
	await db.put('Notes', {
		...note,
		updated_at: Date.now() // 保存時に更新日時を更新
	});
};

export const idb_deleteNote = async (uuid: string): Promise<void> => {
	const db = await getDb('Notes');
	await db.delete('Notes', uuid);
};