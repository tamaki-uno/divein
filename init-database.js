import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameをESMで取得（Windows対応）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// データベース初期化関数
export default function initDatabase() {
    // データベース接続
    const db = new sqlite3.Database('divein.db', (err) => {
        if (err) {
            console.error('データベースの接続に失敗しました:', err.message);
        } else {
            console.log('データベースに接続しました。');
        }
    });

    // スキーマファイルの読み込み
    let schema;
    try {
        const schemaPath = path.join(__dirname, 'database-schema.json');
        const databaseSchema = fs.readFileSync(schemaPath, 'utf8');
        schema = JSON.parse(databaseSchema);
        
    } catch (error) {
        console.error('データベーススキーマの読み込みに失敗しました:', error.message);
        try { db.close(); } catch {}
        return;
    }

    // テーブル作成
    db.serialize(() => {
        const tableNames = Object.keys(schema);
        let processed = 0;
        for (const tableName of tableNames) {
            const columns = Object.entries(schema[tableName])
                .map(([key, value]) => `${key} ${value}`)
                .join(', ');
            db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`, (err) => {
                if (err) {
                    console.error(`${tableName} テーブルの作成に失敗しました:`, err.message);
                } else {
                    console.log(`${tableName} テーブルを作成しました。${columns}`);
                }
                processed++;
                // 全テーブル処理後にDBを閉じる
                if (processed === tableNames.length) {
                    db.close((err) => {
                        if (err) {
                            console.error('データベースの切断に失敗しました:', err.message);
                        } else {
                            console.log('データベースを切断しました。');
                        }
                    });
                }
            });
        }
    });
}

// 初期化関数を実行
initDatabase();