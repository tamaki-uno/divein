// 
import sqlite3 from 'sqlite3'; // SQLite3のモジュールをインポート
// import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
// import express from 'express';

// 自前のモジュールをインポート
// import initDatabase from './init-database.js';
import app from './server.js';
import runSql from './runsql.js';

const port = 3000;

// sqlの読み込み
let sql;
try {
    const schemaPath = path.join(process.cwd(), 'database-schema.sql');
    sql = fs.readFileSync(schemaPath, 'utf8');
} catch (error) {
    console.error('SQLスキーマの読み込みに失敗しました:', error.message);
    process.exit(1);
}

// データベースの初期化
const db = new sqlite3.Database('divein.db', (err) => {
    if (err) {
        console.error('データベースの接続に失敗しました:', err.message);
    } else {
        console.log('データベースに接続しました。');
    }
});
// データベースの初期化を実行
// initDatabase(db);
runSql(db, sql)
    .then(() => {
        console.log('データベースの初期化が完了しました。');
    })
    .catch((err) => {
        console.error('データベースの初期化中にエラーが発生しました:', err.message);
    });

// サーバーの起動
app.listen(port, () => {
    console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
});