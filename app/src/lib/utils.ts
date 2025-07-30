import type { NoteData } from './types';

/**
 * ノートの内容をバリデーションする
 */
export function validateNote(note: Partial<NoteData>): note is NoteData {
    return !!(
        note.uuid &&
        typeof note.uuid === 'string' &&
        typeof note.content === 'string' &&
        Array.isArray(note.children) &&
        typeof note.created_at === 'number' &&
        typeof note.updated_at === 'number'
    );
}

/**
 * 新しいノートを作成する
 */
export function createNote(uuid: string, content: string = ''): NoteData {
    const now = Date.now();
    return {
        uuid,
        content,
        children: [],
        created_at: now,
        updated_at: now,
    };
}

/**
 * ノートの内容を更新する
 */
export function updateNoteContent(note: NoteData, content: string): NoteData {
    return {
        ...note,
        content,
        updated_at: Date.now(),
    };
}

/**
 * 子ノートを追加する
 */
export function addChildNote(parentNote: NoteData, childUuid: string): NoteData {
    return {
        ...parentNote,
        children: [...parentNote.children, childUuid],
        updated_at: Date.now(),
    };
}

/**
 * 子ノートを削除する
 */
export function removeChildNote(parentNote: NoteData, childUuid: string): NoteData {
    return {
        ...parentNote,
        children: parentNote.children.filter(uuid => uuid !== childUuid),
        updated_at: Date.now(),
    };
}

/**
 * より新しいノートを選択する
 */
export function selectNewerNote(note1: NoteData | null, note2: NoteData | null): NoteData | null {
    if (!note1 && !note2) return null;
    if (!note1) return note2;
    if (!note2) return note1;
    
    return note1.updated_at > note2.updated_at ? note1 : note2;
}

/**
 * UUIDを生成する（簡易版）
 */
export function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * 時間のフォーマット
 */
export function formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString('ja-JP');
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return function(...args: Parameters<T>) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
