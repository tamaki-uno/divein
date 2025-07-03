/**
 * メインサーバープログラム
 * - ExpressによるAPIサーバー
 * - 静的ファイル配信
 * - APIエンドポイントの設定
 * - エラーハンドリング
 */

import express from 'express';
import { join, extname } from 'path';
import 'dotenv/config';

// --- 初期設定 ---
const app = express();
const port = process.env.PORT || 3000;

// --- データベースの初期化 ---
import { createTable } from '#database';

// --- APIハンドラの読み込み ---
import { assetHandler } from '#api/v0/asset.js';
import loginHandler from '#api/v0/login.js';
import logoutHandler from '#api/v0/logout.js';
import signupHandler from '#api/v0/signup.js';
import syncHandler from '#api/v0/sync.js';

// --- 認証ミドルウェアの読み込み ---
import { authenticateToken } from './server/auth.js';


// --- ミドルウェアの設定 ---
app.use(express.json());

/**
 * JSONパースエラー時のハンドリングミドルウェア
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {Function} next
 */
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'リクエストボディが不正です。' });
    }
    next();
});

// // --- 静的ファイルの配信設定 ---
// const publicDir = join(process.cwd(), 'public');
// console.log(`静的ファイルの配信ディレクトリ: ${publicDir}`);
// // 静的ファイルの配信
// // express.staticを使用して、publicディレクトリ内のファイルを配信
// app.use(express.static(publicDir));

// --- APIエンドポイントの設定 ---
app.post('/api/v0/asset', authenticateToken, assetHandler);
app.post('/api/v0/login', loginHandler);
app.post('/api/v0/logout', authenticateToken, logoutHandler);
app.post('/api/v0/signup', signupHandler);
app.post('/api/v0/sync', authenticateToken, syncHandler);

console.log('APIエンドポイントの設定完了');

// --- 静的ファイルの配信設定 ---
const publicDir = join(process.cwd(), 'public');
console.log(`静的ファイルの配信ディレクトリ: ${publicDir}`);
const allowedExtensions = ['.html', '.js', '.css', '.json', '.webmanifest', '.svg'];

/**
 * 静的ファイルまたはindex.htmlを返すルート
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
app.get(/(.*)/, (req, res) => {
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.path}`;
    const ext = extname(req.path);
    if (allowedExtensions.includes(ext)) {
        // 静的ファイルの配信
        res.sendFile(join(publicDir, req.path), (err) => {
            if (err) {
                console.error(logMessage, ' - エラー:', err.message);
                res.status(err.status || 500).end();
            }
        });
    } else {
        // その他のリクエストはindex.htmlを返す
        res.sendFile(join(publicDir, 'index.html'), (err) => {
            if (err) {
                console.error(logMessage, ' - index.htmlの配信中にエラーが発生:', err.message);
                res.status(err.status || 500).end();
            }
        });
    }
});

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


// --- APIハンドラの読み込み ---
import assetHandler from './post/v0/asset.js';
import loginHandler from './post/v0/login.js';
import logoutHandler from './post/v0/logout.js';
import signupHandler from './post/v0/signup.js';
import syncHandler from './post/v0/sync.js';

import { authenticateToken } from './server/auth.js';


async function postHandler(req, res) {
    try {
        const record = req.body;

        return res.status(201).json({ message: '投稿が作成されました。', data: postData });
    } catch (error) {
        console.error('Post handler error:', error);
        return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}