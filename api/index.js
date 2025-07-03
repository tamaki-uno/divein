/**
 * メインサーバープログラム
 * - ExpressによるAPIサーバー
 * - 静的ファイル配信
 * - APIエンドポイントの設定
 * - エラーハンドリング
 */

import express from 'express';
import 'dotenv/config';


// --- 初期設定 ---
const app = express();
const port = process.env.PORT || 3000;

// --- データベースの初期化 ---
import { createTable } from './database/database.js';

import postHandler from './server/post.js';
import getHandler from './server/get.js';
import { authenticateToken } from './server/auth.js';

app.post(/(.*)/, postHandler);
app.get(/(.*)/, getHandler);


(async () => {
    try {
        // --- データベースの初期化 ---
        await createTable();
        // --- サーバーの起動 ---
        app.listen(port, () => {
            console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
        });
    } catch (error) {
        console.error('サーバーの初期化中にエラーが発生しました:', error);
        process.exit(1);
    }
})();

// --- エラーハンドリング ---
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