// サーバプログラム

import express from 'express';
import { join, dirname } from 'path';

// --- 初期設定 ---
const app = express();
const port = 3000;

// --- APIハンドラの読み込み ---
import contentHandler from '#api/v0/content.js'; // コンテンツ取得用のハンドラを読み込み
import loginHandler from '#api/v0/login.js'; // ユーザログイン用のハンドラを読み込み
import signupHandler from '#api/v0/signup.js'; // ユーザ登録用のハンドラを読み込み
import syncHandler from '#api/v0/sync.js'; // データ同期用のハンドラを読み込み

// --- ミドルウェア設定 ---
app.use(express.json()); // JSONリクエストボディのパースを有効

// --- APIエンドポイントの設定 ---
app.post('/api/v0/signup', signupHandler); // ユーザ登録用のPOSTエンドポイント
app.post('/api/v0/login', loginHandler); // ユーザログイン用のPOSTエンドポイント
app.post('/api/v0/sync', syncHandler); // データ同期用のPOSTエンドポイント
app.get('/api/v0/content', contentHandler); // コンテンツ取得用のGETエンドポイント

// --- 静的ファイルの配信設定 ---
// public ディレクトリ配下の静的ファイルを配信
app.use(express.static(join(process.cwd(), 'public')));

// SPA対応: それ以外のリクエストは index.html を返す
app.get('*', (req, res) => {
    // ESMの場合は import.meta.url から __dirname を取得する必要あり
    res.sendFile(join(process.cwd(), 'public/index.html'));
});


export default app; // appをデフォルトエクスポートとして設定

// --- サーバーの起動 ---
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});