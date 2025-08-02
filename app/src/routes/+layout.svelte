<script lang="ts">
	import SettingsPopup from '$lib/components/SettingsPopup.svelte';
	// import '../app.css'; // Tailwind CSS

	// const API_URL = 'http://localhost:8000'; // FastAPIサーバーのURL

	// const syncWithServer = async () => {
	// 	if (!confirm('現在のローカルのメモでサーバーを上書きします。よろしいですか？')) return;

	// 	try {
	// 		const localNotes = await idb_getAllNotes();
	// 		const response = await fetch(`${API_URL}/api/notes/sync`, {
	// 			method: 'POST',
	// 			headers: { 'Content-Type': 'application/json' },
	// 			body: JSON.stringify(localNotes)
	// 		});

	// 		if (!response.ok) throw new Error('サーバーとの同期に失敗しました。');

	// 		alert('同期が完了しました。');
	// 	} catch (error) {
	// 		console.error(error);
	// 		alert('エラーが発生しました。');
	// 	}
	// };

	// const fetchFromServer = async () => {
	// 	if (!confirm('サーバーのデータでローカルのメモを上書きします。よろしいですか？')) return;

	// 	try {
	// 		const response = await fetch(`${API_URL}/api/notes`);
	// 		if (!response.ok) throw new Error('サーバーからの取得に失敗しました。');
			
	// 		const serverNotes = await response.json();
	// 		// 取得したノートを一件ずつローカルDBに保存（上書き）
	// 		for (const note of serverNotes) {
	// 			await idb_saveNote(note);
	// 		}
	// 		alert('サーバーからデータを復元しました。ページをリロードしてください。');

	// 	} catch (error) {
	// 		console.error(error);
	// 		alert('エラーが発生しました。');
	// 	}
	// }
	function showSettingPopup() {
		const settingPopup = document.querySelector('.settings-popup');
		if (settingPopup) {
			settingPopup.classList.toggle('hidden');
		}
	}
</script>

<!-- <header class="bg-gray-800 text-white shadow-md">
	<div class="container mx-auto px-4 py-3 flex justify-between items-center">
		<a href="/" class="text-xl font-bold">Offline-First Note App</a>
		<div class="space-x-2"> -->
			<!-- <button on:click={syncWithServer} class="bg-purple-500 hover:bg-purple-600 text-sm font-bold py-1 px-3 rounded">
				サーバーに同期
			</button>
			<button on:click={fetchFromServer} class="bg-gray-500 hover:bg-gray-600 text-sm font-bold py-1 px-3 rounded">
				サーバーから復元
			</button> -->
		<!-- </div>
	</div>
</header> -->

<!-- <main class="container mx-auto"> -->
<main class="main-container">
	<slot />
</main>

<button class="setting-button" on:click={showSettingPopup}>
	<img src="/icons/settings.svg" alt="Settings" class="settings-icon" />
</button>

<SettingsPopup />

<style>
	.main-container {
		padding: 1rem;
	}

	.setting-button {
		position: fixed;
		top: 1rem;
		right: 1rem;
		background-color: #4a5568; /* Gray-700 */
		color: white;
		border: none;
		border-radius: 50%;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.settings-icon {
		width: 24px;
		height: 24px;
	}
	.setting-button:hover {
		background-color: #2d3748; /* Gray-800 */
	}
</style>