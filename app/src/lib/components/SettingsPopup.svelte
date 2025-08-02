<script lang="ts">
	import { onMount } from "svelte";

    let apiUrl: string[] = JSON.parse(window.localStorage.getItem('apiUrl') || '[]');

    onMount(() => {
        let url = new URL(window.location.href);
        apiUrl.push(url.origin + '/api/v0');
    });

    // function addUrl(url: string) {
    function addUrl() {
        let url: string | null = prompt('Enter new API URL:');
        url = url?.trim() || '';
        if (!url) {
            alert('URL cannot be empty.');
            return;
        }
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'http://' + url; // デフォルトでhttpを追加
        }
        try {
            new URL(url); // URLの形式を検証
            fetch(url, { method: 'HEAD' }) // URLが有効か確認
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Invalid URL');
                    }
                });
        } catch (e) {
            alert('Invalid URL format. Please enter a valid URL.');
            return;
        }
        if (url && !apiUrl.includes(url)) {
            apiUrl.push(url);
            localStorage.setItem('apiUrl', JSON.stringify(apiUrl));
        }
    }

    function removeUrl(url: string) {
        apiUrl = apiUrl.filter(u => u !== url);
        localStorage.setItem('apiUrl', JSON.stringify(apiUrl));
    }
</script>


<div class="settings-popup hidden">
    <h2>Settings</h2>
    <!-- <p>Settings functionality will be implemented here.</p> -->
    <!-- Add settings options here -->
     {#if apiUrl.length > 0}
        <h3>API URLs</h3>
        <ul>
            {#each apiUrl as url}
                <li>
                    {url}
                    <button on:click={() => removeUrl(url)} class="remove-url-button">
                        <img src="/icons/remove.svg" alt="Remove" class="remove-icon" />
                    </button>
                </li>
            {/each}
        </ul>
    {:else}
        <p>No API URLs configured. Please add one.</p>
    {/if}
    <!-- <button on:click={() => addUrl(prompt('Enter new API URL:') || '')} class="add-url-button"> -->
    <button on:click={() => addUrl()} class="add-url-button">
        <img src="/icons/add.svg" alt="Add" class="add-icon" />
    </button>
</div>

<style>
    .settings-popup {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        width: 300px;
        max-height: 80vh;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .settings-popup.hidden {
        display: none;
    }
    h2 {
        margin-bottom: 10px;
    }
    h3 {
        margin-top: 20px;
    }
    ul {
        list-style-type: none;
        padding: 0;
    }
    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
    }
    .remove-url-button, .add-url-button {
        background: none;
        border: none;
        cursor: pointer;
    }
    .remove-icon, .add-icon {
        width: 16px;
        height: 16px;
    }
    .add-url-button:hover, .remove-url-button:hover {
        opacity: 0.8;
    }
</style>