// サーバプログラム

import express from 'express';
import { join } from 'path';
import 'dotenv/config';

// --- 初期設定 ---
const app = express();
const port = process.env.PORT;

// --- APIハンドラの読み込み ---
import contentHandler from '#api/v0/content.js';
import loginHandler from '#api/v0/login.js';
import signupHandler from '#api/v0/signup.js';
import syncHandler from '#api/v0/sync.js';

// --- ミドルウェア設定 ---
app.use(express.json());

// --- APIエンドポイントの設定 ---
app.get('/api/v0/content', contentHandler);
app.post('/api/v0/login', loginHandler);
app.post('/api/v0/signup', signupHandler);
app.post('/api/v0/sync', syncHandler);

// --- 静的ファイルの配信設定 ---
const publicDir = join(process.cwd(), 'public');
app.use(express.static(publicDir));

// SPA対応: API以外のリクエストは index.html を返す
app.get(/^\/(?!api\/v0\/).*/, (req, res) => {
    res.sendFile(join(publicDir, 'index.html'));
});

export default app;

// --- サーバーの起動 ---
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});