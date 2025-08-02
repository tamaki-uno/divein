<!-- Note.svelte -->
<script lang="ts">
    import type { NoteData } from './types';
    import { onMount, onDestroy } from 'svelte';
    import { NoteStore } from './noteStore';
    import NoteContent from './components/NoteContent.svelte';
    import NoteChildren from './components/NoteChildren.svelte';
    
    export let uuid: string;
    
    // ストアの初期化
    const noteStore = new NoteStore(uuid);
    const { note, loadingState, syncResult } = noteStore;
    
    let currentNote: NoteData | null = null;
    let currentLoadingState = { isLoading: true, error: null as string | null };
    
    // ストアの購読
    const unsubscribeNote = note.subscribe(value => currentNote = value); // 現在のノートデータ
    const unsubscribeLoading = loadingState.subscribe(value => currentLoadingState = value);
    
    onMount(() => {
        noteStore.loadNote();
    });
    
    onDestroy(() => {
        unsubscribeNote();
        unsubscribeLoading();
    });

    function handleToggle() {
        console.log('Note toggle:', currentNote?.uuid);
        // トグル機能の実装
    }

    function handleDelete() {
        console.log('Note delete:', currentNote?.uuid);
        // 削除機能の実装
    }

    async function handleChange() {
        try {
            await noteStore.saveNote(currentNote);
        } catch (err) {
            console.error('Content save error:', err);
        }
    }

    function handleRetry() {
        noteStore.loadNote();
    }
</script>

<div class="note-container">
    {#if !currentLoadingState.error}
        {#if currentLoadingState.isLoading}
            <img src="/icons/loading.svg" alt="Loading..." class="loading-icon" />

        {:else if currentNote}
            <NoteContent 
                content={currentNote.content}
                ontoggle={handleToggle}
                ondelete={handleDelete}
                onchange={handleChange}
            />
            <NoteChildren
                children={currentNote.children}
                onchange={handleChange}
            />
        {/if}
    {:else}
        <div class="error-container">
            <img src="/icons/error.svg" alt="Error" class="error-icon" />
            <button on:click={handleRetry} class="retry-button">
                <img src="/icons/retry.svg" alt="Retry" />
            </button>
        </div>
    {/if}
</div>

<style>
    .note-container {
        padding: 1rem;
    }
    
    .loading-icon,
    .error-icon {
        width: 24px;
        height: 24px;
        display: block;
        margin: 0 auto;
    }
    .loading-icon {
        animation: spin 1s linear infinite;
    }
    .error-container {
        text-align: center;
        padding: 2rem;
    }
    .retry-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }
    .retry-button:hover {
        background-color: #f5f5f5;
    }
</style>