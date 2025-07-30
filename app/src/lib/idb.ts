import type { NoteData } from "./types";
import { openDB, type IDBPDatabase } from 'idb';

// // --- NoteDataの型定義 ---
// export interface NoteData {
// 	uuid: string;
// 	content: string;
//     children: NoteData[]; // 子ノートの配列
//     created_at: number; // UNIXタイムスタンプ
// 	updated_at: number; // UNIXタイムスタンプ
// }



// --- DBの初期化 ---
let db: IDBPDatabase | null = null;
const DB_NAME = 'DIVEIN_DB';
const STORE_NAME = 'Notes';

async function getDb(): Promise<IDBPDatabase> {
	if (db) return db;
	db = await openDB(DB_NAME, 1, {
		upgrade(db) {
			db.createObjectStore(STORE_NAME, { keyPath: 'id' });
		}
	});
	return db;
}

// --- DB操作関数 ---
export const idb_getAllNotes = async (): Promise<NoteData[]> => {
	const db = await getDb();
	const notes = await db.getAll(STORE_NAME);
	// 更新日時の降順でソート
	return notes.sort((a, b) => b.updated_at - a.updated_at);
};

export const idb_getNote = async (uuid: string): Promise<NoteData | undefined> => {
	const db = await getDb();
	return db.get(STORE_NAME, uuid);
};

export const idb_saveNote = async (note: NoteData): Promise<void> => {
	const db = await getDb();
	await db.put(STORE_NAME, {
		...note,
		updated_at: Date.now() // 保存時に更新日時を更新
	});
};

export const idb_deleteNote = async (uuid: string): Promise<void> => {
	const db = await getDb();
	await db.delete(STORE_NAME, uuid);
};