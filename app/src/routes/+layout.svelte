<script lang="ts">
	import '../app.css'; // Tailwind CSS
	import { idb_getAllNotes, idb_saveNote } from '$lib/idb';

	const API_URL = 'http://localhost:8000'; // FastAPIサーバーのURL

	const syncWithServer = async () => {
		if (!confirm('現在のローカルのメモでサーバーを上書きします。よろしいですか？')) return;

		try {
			const localNotes = await idb_getAllNotes();
			const response = await fetch(`${API_URL}/api/notes/sync`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(localNotes)
			});

			if (!response.ok) throw new Error('サーバーとの同期に失敗しました。');

			alert('同期が完了しました。');
		} catch (error) {
			console.error(error);
			alert('エラーが発生しました。');
		}
	};

	const fetchFromServer = async () => {
		if (!confirm('サーバーのデータでローカルのメモを上書きします。よろしいですか？')) return;

		try {
			const response = await fetch(`${API_URL}/api/notes`);
			if (!response.ok) throw new Error('サーバーからの取得に失敗しました。');
			
			const serverNotes = await response.json();
			// 取得したノートを一件ずつローカルDBに保存（上書き）
			for (const note of serverNotes) {
				await idb_saveNote(note);
			}
			alert('サーバーからデータを復元しました。ページをリロードしてください。');

		} catch (error) {
			console.error(error);
			alert('エラーが発生しました。');
		}
	}
</script>

<header class="bg-gray-800 text-white shadow-md">
	<div class="container mx-auto px-4 py-3 flex justify-between items-center">
		<a href="/" class="text-xl font-bold">Offline-First Note App</a>
		<div class="space-x-2">
			<!-- <button on:click={syncWithServer} class="bg-purple-500 hover:bg-purple-600 text-sm font-bold py-1 px-3 rounded">
				サーバーに同期
			</button>
			<button on:click={fetchFromServer} class="bg-gray-500 hover:bg-gray-600 text-sm font-bold py-1 px-3 rounded">
				サーバーから復元
			</button> -->
		</div>
	</div>
</header>

<main class="container mx-auto">
	<slot />
</main>