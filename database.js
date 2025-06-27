'use strict';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// const DB_PATH = 'divein.db';
const DB_PATH = process.env.DB_PATH || './database.sqlite'; // 環境変数からデータベースパスを取得、デフォルトは './database.sqlite'

// let db;

// // データベース接続を非同期で初期化
// export async function initDb() {
//     db = await open({
//         filename: './database.sqlite',
//         driver: sqlite3.Database
//     });
//     console.log('データベース接続が初期化されました。');
//     return db;
// }

// データベース接続を返す関数
export function getDatabaseConnection() {
    return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('データベース接続エラー:', err.message);
            throw err;
        }
        console.log('データベースに接続しました。');
    });
}

// データベース接続を閉じる関数
export async function closeDatabaseConnection(db) {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error('データベース切断エラー:', err.message);
                reject(err);
            } else {
                console.log('データベース接続を切断しました。');
                resolve();
            }
        });
    });
}

// テーブルを作成する関数
export async function createTable() {
    const db = getDatabaseConnection();
    const sql = fs.readFileSync(path.join(process.cwd(), 'sql/createTable.sql'), 'utf8');
    // セミコロンで分割し、順次実行
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    for (const stmt of statements) {
        await new Promise((resolve, reject) => {
            db.run(stmt, (err) => {
                if (err) {
                    console.error('テーブル作成エラー:', err.message);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

// 完全一致でUUIDで探す関数
export async function findByUuid(uuid) {
    const db = getDatabaseConnection();
    const tableName = 'records';
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM ?? WHERE uuid = ?', [tableName, uuid], (err, row) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

// コンテンツの内容の部分一致で探す関数
export async function findByContent(keyword) {
    const db = getDatabaseConnection();
    const tableName = 'records';
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM ?? WHERE content LIKE ?', [tableName, `%${keyword}%`], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


// // SQLをパラメータ付きで実行するユーティリティ関数（SELECT用）
// export function select(sql, params = []) {
//     const db = getDatabaseConnection();
//     return new Promise((resolve, reject) => {
//         db.all(sql, params, (err, rows) => {
//             db.close();
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// }

// // SQLをパラメータ付きで実行するユーティリティ関数（INSERT/UPDATE/DELETE用）
// export function run(sql, params = []) {
//     const db = getDatabaseConnection();
//     return new Promise((resolve, reject) => {
//         db.run(sql, params, function (err) {
//             db.close();
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve({ changes: this.changes, lastID: this.lastID });
//             }
//         });
//     });
// }

// // データベース初期化関数
// export async function initializeDatabase() {
//     try {
//         const schemaPath = path.join(process.cwd(), 'sql/createtable.sql');
//         const sql = fs.readFileSync(schemaPath, 'utf8');
//         // セミコロンで分割し、順次実行
//         const statements = sql
//             .split(';')
//             .map(s => s.trim())
//             .filter(s => s.length > 0);
//         for (const stmt of statements) {
//             await run(stmt);
//         }
//         console.log('データベースの初期化が完了しました。');
//     } catch (error) {
//         console.error('データベースの初期化中にエラーが発生しました:', error.message);
//         process.exit(1);
//     }
// }

// // ユーザー名でユーザーを検索
// export async function findUserByUsername(username) {
//     return await db.get('SELECT * FROM users WHERE username = ?', [username]);
// }

// // 新規ユーザーを作成
// export async function createUser(username, passwordHash) {
//     const result = await db.run(
//         'INSERT INTO users (username, password_hash) VALUES (?, ?)',
//         [username, passwordHash]
//     );
//     return { id: result.lastID, username };
// }