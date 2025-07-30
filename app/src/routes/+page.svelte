<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
    import Note from '$lib/note.svelte';

    let user: string = 'guest'; // ユーザー名の初期値
    let useruuid: string = ''; // ユーザーのUUID
    let uuid: string = ''; // クエリパラメータから取得するUUID

	// コンポーネントがマウントされたらDBからノートを読み込む
	onMount(async () => {
        user = localStorage.getItem('user') || 'guest'; // ローカルストレージからユーザー名を取得
        useruuid = localStorage.getItem('useruuid') || ''; // ローカルストレージからユーザーのUUIDを取得
        const params = new URLSearchParams(window.location.search);
        uuid = params.get('uuid') || ''; // クエリパラメータからUUIDを取得
	});

</script>

<div class="p-4 sm:p-6">
    {#if uuid}
        <Note uuid={uuid} />
    {:else}
        <Note uuid={useruuid} />
    {/if}
</div>