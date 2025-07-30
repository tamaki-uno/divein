<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { v4 as uuidv4 } from 'uuid';
	import type { Note } from '$lib/db';
	import { db_getAllNotes, db_saveNote } from '$lib/db';

	let notes: Note[] = [];

	// コンポーネントがマウントされたらDBからノートを読み込む
	onMount(async () => {
		notes = await db_getAllNotes();
	});

	// 新規ノートを作成して編集ページに飛ぶ
	const createNewNote = async () => {
		const newNote: Note = {
			id: uuidv4(),
			title: '新しいノート',
			content: '',
			updated_at: Date.now()
		};
		await db_saveNote(newNote);
		goto(`/${newNote.id}`); // 編集ページへ
	};
</script>

<div class="p-4 sm:p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-bold">メモ一覧</h1>
		<button on:click={createNewNote} class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
			＋ 新規作成
		</button>
	</div>

	<div class="space-y-3">
		{#each notes as note (note.id)}
			<a href="/{note.id}" class="block p-4 bg-white border rounded-lg hover:bg-gray-50">
				<h2 class="font-semibold truncate">{note.title}</h2>
				<p class="text-sm text-gray-500">{new Date(note.updated_at).toLocaleString()}</p>
			</a>
		{/each}
	</div>

	{#if notes.length === 0}
		<p class="text-center text-gray-500 mt-8">まだノートがありません。</p>
	{/if}
</div>