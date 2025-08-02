<script lang="ts">
    export let content: string = '';
    
    export let ontoggle: () => void = () => {};
    export let ondelete: () => void = () => {};
    export let onchange: () => void = () => {};
    export let createSibling: () => void = () => {};
    export let becomeChild: () => void = () => {};

    let isEditing = false;
    let editContent = content;

    function startEditing() {
        isEditing = true;
    }

    function saveContent() {
        if (content !== note.content) {
            onchange();
        }
        isEditing = false;
    }

    function cancelEditing() {
        isEditing = false;
        editContent = content;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveContent();
            createSibling();
        } else if (event.key === 'Tab') {
            event.preventDefault();
            saveContent();
            becomeChild();
        } else if (event.key === 'Escape') {
            cancelEditing();
        }
    }

</script>

<div class="note-content">
    <button 
        class="toggle-button" 
        on:click={ontoggle}
        aria-label="Toggle"
    >
        <img src="/icons/toggle.svg" alt="" class="toggle-icon" />
    </button>
    
    <div class="content-area" on:click={startEditing} on:keydown={(e) => e.key === 'Enter' && startEditing()} role="button" tabindex="0">
        {#if isEditing}
            <textarea 
                bind:value={editContent}
                on:keydown={handleKeydown}
                on:blur={saveContent}
                class="content-editor"
                placeholder={content}
            ></textarea>
        {:else}
            <p class="content-text">
                {content}
            </p>
        {/if}
    </div>
    
    <button 
        class="delete-button" 
        on:click={ondelete}
        aria-label="Delete"
    >
        <img src="/icons/delete.svg" alt="" class="delete-icon" />
    </button>
</div>

<style>
    .note-content {
        border: 1px solid #ccc;
        padding: 1rem;
        margin-bottom: 1rem;
        position: relative;
        border-radius: 8px;
        transition: box-shadow 0.2s ease;
    }

    .note-content:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .toggle-button, .delete-button {
        position: absolute;
        top: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 4px;
        transition: background-color 0.2s ease;
    }

    .toggle-button {
        left: 0.5rem;
    }

    .delete-button {
        right: 0.5rem;
    }

    .toggle-button:hover, .delete-button:hover {
        background-color: #f5f5f5;
    }
    
    .toggle-icon, .delete-icon {
        width: 1.5em;
        height: 1.5em;
        display: block;
    }

    .content-area {
        margin: 0 3rem;
        min-height: 2rem;
    }

    .content-text {
        margin: 0;
        line-height: 1.5;
        word-wrap: break-word;
        cursor: pointer;
    }

    .content-text:hover {
        background-color: #f9f9f9;
        padding: 0.25rem;
        border-radius: 4px;
    }

    .content-editor {
        width: 100%;
        min-height: 4rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 0.5rem;
        font-family: inherit;
        font-size: inherit;
        line-height: 1.5;
        resize: vertical;
    }

    .content-editor:focus {
        outline: none;
        border-color: #007acc;
        box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
    }
</style>
