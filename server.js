// サーバプログラム

import express from 'express';
import { join } from 'path';
import 'dotenv/config';
import morgan from 'morgan';

// --- 初期設定 ---
const app = express();
const port = process.env.PORT || 3000;

// --- アクセスログの出力 ---
app.use(morgan('combined'));

// --- データベースの初期化 ---
import { createTable } from '#database';
// createTable().catch(err => {
//     console.error('データベースの初期化に失敗しました:', err);
//     process.exit(1);
// });

// --- APIハンドラの読み込み ---
import { assetHandler } from '#api/v0/asset.js';
import checkHandler from '#api/v0/check.js';
import loginHandler from '#api/v0/login.js';
import signupHandler from '#api/v0/signup.js';
import syncHandler from '#api/v0/sync.js';

// --- 認証ミドルウェアの読み込み ---
import { authenticateToken } from '#api/v0/auth.js';
import { create } from 'domain';

// --- ミドルウェアの設定 ---
app.use(express.json());

// JSONパースエラー時のハンドリング
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'リクエストボディが不正です。' });
    }
    next();
});

// --- APIエンドポイントの設定 ---
app.post('/api/v0/asset', authenticateToken, assetHandler);
// app.post('/api/v0/check', authenticateToken, checkHandler);
app.get('/api/v0/check', authenticateToken, checkHandler); // GETメソッドに変更
app.post('/api/v0/login', loginHandler);
app.post('/api/v0/signup', signupHandler);
app.post('/api/v0/sync', authenticateToken, syncHandler);

// --- 静的ファイルの配信設定 ---
const publicDir = join(process.cwd(), 'public');
app.use(express.static(publicDir));

// // SPA対応: API以外のリクエストは index.html を返す
app.get(/^\/(?!api\/v0\/).*/, (req, res) => {
    res.sendFile(join(publicDir, 'index.html'));
});


export default app;

// --- サーバーの起動 ---
createTable().then(() => {
    // データベースの初期化が成功したらサーバーを起動
    app.listen(port, () => {
        console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
    });
}).catch(err => {
    console.error('データベースの初期化に失敗しました:', err);
    process.exit(1);
});
export { app }; // モジュールとしてエクスポート