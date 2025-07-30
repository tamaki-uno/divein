export class NoteError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'NoteError';
    }
}

export class NetworkError extends NoteError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'NETWORK_ERROR', context);
        this.name = 'NetworkError';
    }
}

export class StorageError extends NoteError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'STORAGE_ERROR', context);
        this.name = 'StorageError';
    }
}

export class ValidationError extends NoteError {
    constructor(message: string, context?: Record<string, unknown>) {
        super(message, 'VALIDATION_ERROR', context);
        this.name = 'ValidationError';
    }
}

export function handleError(error: unknown, context?: Record<string, unknown>): NoteError {
    if (error instanceof NoteError) {
        return error;
    }
    
    if (error instanceof Error) {
        return new NoteError(error.message, 'UNKNOWN_ERROR', { 
            originalError: error.name,
            ...context 
        });
    }
    
    return new NoteError(
        '予期しないエラーが発生しました',
        'UNKNOWN_ERROR',
        { originalError: String(error), ...context }
    );
}
