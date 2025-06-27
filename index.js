// 
import sqlite3 from 'sqlite3'; // SQLite3のモジュールをインポート
// import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
// import express from 'express';

// 自前のモジュールをインポート
// import initDatabase from './init-database.js';
import app from './server.js';
import { run } from './database.js';

const port = 3000;

// データベース初期化関数
async function initializeDatabase() {
    try {
        const schemaPath = path.join(process.cwd(), 'sql/createtable.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        // セミコロンで分割し、順次実行
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        for (const stmt of statements) {
            await run(stmt);
        }
        console.log('データベースの初期化が完了しました。');
    } catch (error) {
        console.error('データベースの初期化中にエラーが発生しました:', error.message);
        process.exit(1);
    }
}

// メイン処理
(async () => {
    await initializeDatabase();
    app.listen(port, () => {
        console.log(`サーバーがポート${port}で起動しました: http://localhost:${port}`);
    });
})();