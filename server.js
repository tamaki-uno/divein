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

// --- APIハンドラの読み込み ---
import { assetHandler } from '#api/v0/asset.js';
import checkHandler from '#api/v0/check.js';
import loginHandler from '#api/v0/login.js';
import signupHandler from '#api/v0/signup.js';
import syncHandler from '#api/v0/sync.js';

// --- 認証ミドルウェアの読み込み ---
import { authenticateToken } from '#api/v0/auth.js';

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
app.get('/api/v0/check', authenticateToken, checkHandler);
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

// --- サーバーの起動 ---
await createTable();
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});

// エラーハンドリング
process.on('uncaughtException', (err) => {
    console.error('未処理の例外:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理の拒否:', reason);
});
process.on('SIGINT', () => {
    console.log('サーバーをシャットダウンします...');
    process.exit(0);
});

// --- モジュールのエクスポート ---
export default app;