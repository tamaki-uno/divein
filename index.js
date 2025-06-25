// 
import sqlite3 from 'sqlite3'; // SQLite3のモジュールをインポート
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import express from 'express';
import apiHandler from './api/api.js';

// 自前のモジュールをインポート
import initDatabase from './init-database.js';
import app from './server.js';

const port = 3000;

// データベースの初期化
const db = new sqlite3.Database('divein.db', (err) => {
    if (err) {
        console.error('データベースの接続に失敗しました:', err.message);
    } else {
        console.log('データベースに接続しました。');
    }
});
// データベースの初期化を実行
initDatabase(db);
// サーバーの起動
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});