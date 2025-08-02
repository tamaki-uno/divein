export interface NoteData {
    uuid: string;
    content: string;
    children: string[];
    created_at: number;
    updated_at: number;
}

export interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

export interface SyncResult {
    success: boolean;
    updatedNote?: NoteData;
    error?: string;
}

export interface API {
    url: string;
}