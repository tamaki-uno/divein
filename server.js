// サーバプログラム

import express from 'express';
import { join } from 'path'; // Node.js標準のパス操作モジュール

// --- 初期設定 ---
const app = express();
const port = 3000;

// --- APIハンドラの読み込み ---
import { getHandler, postHandler } from './api/v0.js'; // v0バージョンのGETとPOSTハンドラをまとめて読み込む

// --- ミドルウェアとルーティングの設定 ---

// 1. 静的ファイルの配信設定
app.use(express.static(join(process.cwd(), 'pub'))); // カレントディレクトリの 'pub' フォルダを静的ファイル置き場として設定

// 2. APIエンドポイントの設定
app.get('/api/v0', getHandler); // v0バージョンのGETハンドラを設定
app.post('/api/v0', postHandler); // v0バージョンのPOSTハンドラを設定

export default app; // appをデフォルトエクスポートとして設定

// --- サーバーの起動 ---
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});