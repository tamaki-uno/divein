// サーバプログラム

import express from 'express';
import { join } from 'path'; // Node.js標準のパス操作モジュール

// --- 初期設定 ---
const app = express();
const port = 3000;

// --- APIハンドラの読み込み ---
// api/api.js からエクスポートされた関数を読み込む
import apiHandler from './api/api.js';

// --- ミドルウェアとルーティングの設定 ---

// 1. 静的ファイルの配信設定
// 'pub' ディレクトリを静的ファイル置き場として指定
// これにより、/ にアクセスすると自動的に /index.html が返される
app.use(express.static(join(__dirname, 'pub')));

// 2. APIエンドポイントの設定
// /api パスへのGETリクエストが来た時に、読み込んだapiHandlerを実行する
app.get('/api', apiHandler);


// --- サーバーの起動 ---
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});