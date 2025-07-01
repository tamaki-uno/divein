// サーバプログラム

import express from 'express';
import { join } from 'path';
import 'dotenv/config';
import morgan from 'morgan';

// --- 初期設定 ---
const app = express();
const port = process.env.PORT || 3000;

// --- アクセスログの出力 ---
// app.use(morgan('combined'));

// --- データベースの初期化 ---
import { createTable } from '#database';

// --- APIハンドラの読み込み ---
import { assetHandler } from '#api/v0/asset.js';
import loginHandler from '#api/v0/login.js';
import signupHandler from '#api/v0/signup.js';
import syncHandler from '#api/v0/sync.js';

// --- 認証ミドルウェアの読み込み ---
import { authenticateToken } from '#api/v0/auth.js';


try {

// --- ミドルウェアの設定 ---
app.use(express.json());

// JSONパースエラー時のハンドリング
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
app.post('/api/v0/signup', signupHandler);
app.post('/api/v0/sync', authenticateToken, syncHandler);

console.log('APIエンドポイントの設定完了');

// // --- 静的ファイルの配信設定 ---
const publicDir = join(process.cwd(), 'public');
console.log(`静的ファイルの配信ディレクトリ: ${publicDir}`);
const allowedExtensions = ['.html','.js', '.css', '.json', 'svg'];

// 
app.get(/(.*)/, (req, res) => {
    const logMessage = `${new Date().toISOString()} - ${req.method} ${req.path}`;
    if (allowedExtensions.some(ext => req.path.endsWith(ext))) {
        // 静的ファイルの配信
        res.sendFile(join(publicDir, req.path), (err) => {
            if (err) {
                console.error(logMessage, ' - エラー:', err.message);
                res.status(err.status).end();
            } else {
                // console.log(logMessage, ' - ファイルを返しました');
            }
        });
    } else {
        // その他のリクエストはindex.htmlを返す
        res.sendFile(join(publicDir, 'index.html'), (err) => {
            if (err) {
                // console.error(`リクエストされたパス: ${req.path} - エラー: ${err.message}`);
                console.error(logMessage, ' - index.htmlの配信中にエラーが発生:', err.message);
                res.status(err.status).end();
            } else {
                // console.log(`リクエストされたパス: ${req.path} - index.htmlを返しました`);
            }
        });
    }
});


} catch (error) {
    console.error('サーバーの初期化中にエラーが発生しました:', error);
    process.exit(1); // エラーが発生した場合はプロセスを終了
}

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