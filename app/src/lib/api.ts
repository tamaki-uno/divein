import type { NoteData } from "./types";

export async function api_getNote(uuid: string): Promise<NoteData> {
    const response = await fetch(`/api/notes/${uuid}`);
    if (!response.ok) {
        throw new Error('ノートの取得に失敗しました。');
    }
    return await response.json();
}

export async function api_saveNote(note: NoteData): Promise<void> {
    const response = await fetch(`/api/notes/${note.uuid}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(note)
    });
    if (!response.ok) {
        throw new Error('ノートの保存に失敗しました。');
    }
}
