<!-- Note.svelte -->
<script lang="ts">
    import type { NoteData } from './types';
    import { onMount, onDestroy } from 'svelte';
    import { NoteStore } from './noteStore';
    
    import Menu from './menu.svelte';
    import StatusIndicator from './components/StatusIndicator.svelte';
    import NoteContent from './components/NoteContent.svelte';
    
    export let uuid: string;
    
    // ストアの初期化
    const noteStore = new NoteStore(uuid);
    const { note, loadingState, syncResult } = noteStore;
    
    let currentNote: NoteData | null = null;
    let currentLoadingState = { isLoading: true, error: null };
    
    // ストアの購読
    const unsubscribeNote = note.subscribe(value => currentNote = value);
    const unsubscribeLoading = loadingState.subscribe(value => currentLoadingState = value);
    
    onMount(() => {
        noteStore.loadNote();
    });
    
    onDestroy(() => {
        unsubscribeNote();
        unsubscribeLoading();
    });

    function handleMenuChange(event: CustomEvent) {
        console.log('Menu changed:', event.detail);
    }

    function handleNoteToggle(event: CustomEvent<{ uuid: string }>) {
        console.log('Note toggle:', event.detail.uuid);
        // トグル機能の実装
    }

    function handleNoteDelete(event: CustomEvent<{ uuid: string }>) {
        console.log('Note delete:', event.detail.uuid);
        // 削除機能の実装
    }

    async function handleContentChange(event: CustomEvent<{ uuid: string; content: string }>) {
        try {
            await noteStore.saveNote(event.detail.content);
        } catch (err) {
            console.error('Content save error:', err);
        }
    }

    function handleRetry() {
        noteStore.loadNote();
    }
</script>

<div class="note-container">
    <StatusIndicator 
        isLoading={currentLoadingState.isLoading}
        error={currentLoadingState.error}
        onRetry={handleRetry}
    />
    
    {#if !currentLoadingState.isLoading && !currentLoadingState.error}
        {#if currentNote}
            <NoteContent 
                note={currentNote}
                on:toggle={handleNoteToggle}
                on:delete={handleNoteDelete}
                on:contentChange={handleContentChange}
            />
            <Menu on:change={handleMenuChange} />
            
            <div class="note-children">
                {#each currentNote.children as child}
                    <svelte:self uuid={child} />
                {/each}
            </div>
        {:else}
            <div class="no-content">
                <img src="/icons/no-content.svg" alt="No content" class="no-content-icon" />
                <p>コンテンツがありません</p>
            </div>
        {/if}
    {/if}
</div>

<style>
    .note-container {
        padding: 1rem;
    }
    
    .note-children {
        margin-left: 1rem;
        border-left: 2px solid #e0e0e0;
        padding-left: 1rem;
    }

    .no-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 2rem;
        color: #666;
    }
    
    .no-content-icon {
        width: 2em;
        height: 2em;
        opacity: 0.5;
    }
</style>