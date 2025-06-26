// サーバプログラム

import express from 'express';
import { join } from 'path'; // Node.js標準のパス操作モジュール

// --- 初期設定 ---
const app = express();
const port = 3000;

// --- APIハンドラの読み込み ---
// import { getHandler, postHandler } from '../api/v0.js'; // v0バージョンのGETとPOSTハンドラをまとめて読み込む
import signupHandler from '../api/v0/signup.js'; // ユーザ登録用のハンドラを読み込み
import loginHandler from '../api/v0/login.js'; // ユーザログイン用のハンドラを読み込み
import syncHandler from '../api/v0/sync.js'; // データ同期用のハンドラを読み込み
import contentHandler from '../api/v0/content.js'; // コンテンツ取得用のハンドラを読み込み

// --- ミドルウェアとルーティングの設定 ---

// 1. 静的ファイルの配信設定
app.use(express.static(join(process.cwd(), 'pub'))); // カレントディレクトリの 'pub' フォルダを静的ファイル置き場として設定

// 2. APIエンドポイントの設定
// app.get('/api/v0', getHandler); // v0バージョンのGETハンドラを設定
// app.post('/api/v0', postHandler); // v0バージョンのPOSTハンドラを設定
app.post('/api/v0/signup', signupHandler); // ユーザ登録用のPOSTエンドポイント
app.post('/api/v0/login', loginHandler); // ユーザログイン用のPOSTエンドポイント
app.post('/api/v0/sync', syncHandler); // データ同期用のPOSTエンドポイント
app.get('/api/v0/content', contentHandler); // コンテンツ取得用のGETエンドポイント

export default app; // appをデフォルトエクスポートとして設定

// --- サーバーの起動 ---
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});