<script lang="ts">
    export let isLoading: boolean = false;
    export let error: string | null = null;
    export let onRetry: (() => void) | null = null;
</script>

<div class="status-container">
    {#if isLoading}
        <img src="/icons/loading.svg" alt="Loading..." class="loading" />
    {:else if error}
        <div class="error-container">
            <img src="/icons/error.svg" alt="Error" class="error" />
            {#if onRetry}
                <button on:click={onRetry} type="button" class="retry">
                    <img src="/icons/retry.svg" alt="Retry" />
                </button>
            {/if}
        </div>
    {/if}
</div>

<style>
    .status-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .loading, .error {
        width: 1em;
        height: 1em;
    }

    .error-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    button.retry {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
    }

    button.retry:hover {
        background-color: #f5f5f5;
        border-radius: 4px;
    }
</style>
