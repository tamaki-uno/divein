import { openDB, type IDBPDatabase } from 'idb';

// --- Noteの型定義 ---
export interface Note {
	id: string;
	title: string;
	content: string;
	updated_at: number; // UNIXタイムスタンプ
}

// --- DBの初期化 ---
let db: IDBPDatabase | null = null;
const DB_NAME = 'NoteAppDB';
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
export const db_getAllNotes = async (): Promise<Note[]> => {
	const db = await getDb();
	const notes = await db.getAll(STORE_NAME);
	// 更新日時の降順でソート
	return notes.sort((a, b) => b.updated_at - a.updated_at);
};

export const db_getNote = async (id: string): Promise<Note | undefined> => {
	const db = await getDb();
	return db.get(STORE_NAME, id);
};

export const db_saveNote = async (note: Note): Promise<void> => {
	const db = await getDb();
	await db.put(STORE_NAME, {
		...note,
		updated_at: Date.now() // 保存時に更新日時を更新
	});
};

export const db_deleteNote = async (id: string): Promise<void> => {
	const db = await getDb();
	await db.delete(STORE_NAME, id);
};