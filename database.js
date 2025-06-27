'use strict';

import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const DB_PATH = process.env.DB_PATH || './database.sqlite';

// テンプレート用のカラム定義
const columns = {
    uuid: "TEXT PRIMARY KEY",
    type: "TEXT NOT NULL",
    content: "TEXT",
    children: "TEXT", // JSON文字列として格納
    permissionsRead: "TEXT",  // JSON文字列として格納
    permissionsWrite: "TEXT", // JSON文字列として格納
    createdBy: "TEXT",
    updatedBy: "TEXT",
    createdAt: "TIMESTAMP",
    updatedAt: "TIMESTAMP"
};

const indexes = [
    'uuid',
    'type',
    'createdBy',
    'updatedBy',
    'createdAt',
    'updatedAt'
];

// データベース接続を返す関数
export function getDatabaseConnection() {
    return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('データベース接続エラー:', err.message);
            throw err;
        }
    });
}

// テーブルを作成する関数
export async function createTable() {
    const db = getDatabaseConnection();
    const statements = [
        `CREATE TABLE IF NOT EXISTS records (
${Object.entries(columns).map(([key, value]) => `  ${key} ${value}`).join(',\n')}
);`
    ];
    statements.push(...indexes.map(index => `CREATE INDEX IF NOT EXISTS idx_records_${index} ON records (${index});`));
    for (const stmt of statements) {
        console.log('実行中のSQL:', stmt);
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
    console.log('テーブルの作成が完了しました。');
    db.close();
}

// 完全一致でUUIDで探す関数
export async function findByUuid(uuid) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM records WHERE uuid = ?', [uuid], (err, row) => {
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
export async function findByContent(keyword, limit = 100, sortBy = 'createdAt', sortOrder = 'DESC') {
    const db = getDatabaseConnection();
    const sql = `SELECT * FROM records WHERE content LIKE ? ORDER BY ${sortBy} ${sortOrder} LIMIT ?`;
    return new Promise((resolve, reject) => {
        db.all(sql, [`%${keyword}%`, limit], (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// 任意のJSONデータをカラム名・値として保存する関数
export async function insertRecord(record) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        // columnsのキー順で値を用意
        const keys = Object.keys(columns);
        const sql = `INSERT INTO records (${keys.join(', ')})
            VALUES (${keys.map(key => `?`).join(', ')})`;
        const values = keys.map(key => {
            if (key === 'children' || key === 'permissionsRead' || key === 'permissionsWrite') {
                return record[key] !== undefined ? JSON.stringify(record[key]) : null;
            } else if (key === 'createdAt' || key === 'updatedAt') {
                return record[key] ? new Date(record[key]).toISOString() : new Date().toISOString();
            } else {
                return record[key] ?? null;
            }
        });
        db.run(
            sql,
            values,
            function (err) {
                db.close();
                if (err) {
                    console.error('レコード挿入エラー:', err.message);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            }
        );
    });
}

// レコードを更新する関数 uuidを指定して更新
export async function updateRecord(uuid, updates) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE records SET ${setClause} WHERE uuid = ?`;
        const values = [...Object.values(updates), uuid];
        db.run(sql, values, function (err) {
            db.close();
            if (err) {
                console.error('レコード更新エラー:', err.message);
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
}

// レコードを削除する関数 uuidを指定して削除
export async function deleteRecord(uuid) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM records WHERE uuid = ?', [uuid], function (err) {
            db.close();
            if (err) {
                console.error('レコード削除エラー:', err.message);
                reject(err);
            } else {
                resolve({ changes: this.changes });
            }
        });
    });
}

// テーブルを作成
export async function initializeDatabase() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, '');
    }
    await createTable();
    console.log('データベースの初期化が完了しました。');
}
initializeDatabase();