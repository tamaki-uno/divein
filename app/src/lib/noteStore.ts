import type { NoteData, LoadingState, SyncResult } from './types';
import { idb_getNote, idb_saveNote } from './idb';
import { api_getNote, api_saveNote } from './api';
import { writable, type Writable } from 'svelte/store';

export class NoteStore {
    public note: Writable<NoteData | null> = writable(null);
    public loadingState: Writable<LoadingState> = writable({
        isLoading: true,
        error: null,
    });
    public syncResult: Writable<SyncResult | null> = writable(null);

    private uuid: string;

    constructor(uuid: string) {
        this.uuid = uuid;
    }

    private get defaultNote(): NoteData {
        return {
            uuid: this.uuid,
            content: '',
            children: [],
            created_at: Date.now(),
            updated_at: Date.now(),
        };
    }

    async loadNote(): Promise<void> {
        this.loadingState.set({ isLoading: true, error: null });
        this.syncResult.set(null);

        try {
            // レース実装：早い方を先に表示
            const results = await Promise.allSettled([
                idb_getNote(this.uuid),
                api_getNote(this.uuid)
            ]);
            
            const idbResult = results[0];
            const apiResult = results[1];
            
            const idbNote = idbResult.status === 'fulfilled' ? (idbResult.value ?? null) : null;
            const apiNote = apiResult.status === 'fulfilled' ? (apiResult.value ?? null) : null;
            
            // 早い方を表示
            const firstAvailable = idbNote || apiNote;
            if (firstAvailable) {
                this.note.set(firstAvailable);
                this.loadingState.update(state => ({ ...state, isLoading: false }));
            }
            
            // 同期処理
            await this.synchronizeNotes(idbNote, apiNote);
            
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'ノートの読み込みに失敗しました';
            this.loadingState.set({ isLoading: false, error: errorMessage });
            console.error('Note loading error:', err);
        }
    }
    
    private async synchronizeNotes(idbNote: NoteData | null, apiNote: NoteData | null): Promise<void> {
        try {
            let finalNote: NoteData;

            if (idbNote && apiNote) {
                // 両方存在：最新を選択し、古い方を上書き
                finalNote = idbNote.updated_at > apiNote.updated_at ? idbNote : apiNote;
                
                if (finalNote === idbNote) {
                    await api_saveNote(finalNote);
                } else {
                    await idb_saveNote(finalNote);
                }
            } else if (idbNote) {
                // IDBのみ存在：APIに同期
                finalNote = idbNote;
                await api_saveNote(idbNote);
            } else if (apiNote) {
                // APIのみ存在：IDBに同期
                finalNote = apiNote;
                await idb_saveNote(apiNote);
            } else {
                // 両方とも存在しない：デフォルトノートを作成
                finalNote = { ...this.defaultNote };
                await Promise.all([
                    idb_saveNote(finalNote),
                    api_saveNote(finalNote)
                ]);
            }

            this.note.set(finalNote);
            this.syncResult.set({ success: true, updatedNote: finalNote });
            
        } catch (err) {
            console.error('Synchronization error:', err);
            this.syncResult.set({ 
                success: false, 
                error: err instanceof Error ? err.message : '同期に失敗しました' 
            });
        }
    }

    async saveNote(content: string): Promise<void> {
        const currentNote = await new Promise<NoteData | null>(resolve => {
            this.note.subscribe(note => resolve(note))();
        });

        if (!currentNote) return;

        const updatedNote: NoteData = {
            ...currentNote,
            content,
            updated_at: Date.now()
        };

        try {
            await Promise.all([
                idb_saveNote(updatedNote),
                api_saveNote(updatedNote)
            ]);
            this.note.set(updatedNote);
        } catch (err) {
            console.error('Save error:', err);
            throw err;
        }
    }

    async deleteNote(): Promise<void> {
        // 削除機能の実装
        // TODO: API とIDBから削除
    }
}
