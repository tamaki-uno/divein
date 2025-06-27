'use strict';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { create } from 'domain';

// const DB_PATH = 'divein.db';
const DB_PATH = process.env.DB_PATH || './database.sqlite'; // 環境変数からデータベースパスを取得、デフォルトは './database.sqlite'

const templatePath = path.join(process.cwd(), 'api/v0/template.json');
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
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
    // 'content', 部分一致はインデックスが効かないため、インデックスはあきらめ
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
        console.log('データベースに接続しました。');
    });
}

// テーブルを作成する関数
export async function createTable() {
    const db = getDatabaseConnection();
    const statements = [`CREATE TABLE IF NOT EXISTS records (\n${Object.entries(columns).map(([key, value]) => `  ${key} ${value}`).join(',\n')}\n);`]; // テーブル作成のSQL文を生成
    statements.push(...indexes.map(index => `CREATE INDEX IF NOT EXISTS idx_records_${index} ON records (${index});`)); // インデックス作成のSQL文を生成
    for (const stmt of statements) {
        // 各ステートメントを実行
        console.log('実行中のSQL:', stmt); // デバッグ用に実行中のSQLを表示
        // ステートメントを実行
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
export async function findByContent(keyword, limit = 100, sortBy = 'created_at', sortOrder = 'DESC') {
    const db = getDatabaseConnection();
    const sql = `SELECT * FROM records WHERE content LIKE ? ORDER BY ${sortBy} ${sortOrder} LIMIT ?`;
    // contentカラムにインデックスがある場合、LIKE検索も高速化される（ただし前方一致が基本）
    return new Promise((resolve, reject) => {
        // db.all('SELECT * FROM records WHERE content LIKE ?', [`%${keyword}%`], (err, rows) => {
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

// レコードを挿入する関数
export async function insertRecord(record) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO records (${Object.keys(columns).join(', ')})
            VALUES (${Object.keys(columns).map(key => `:${key}`).join(', ')})`; // プレースホルダを使用してSQLインジェクション対策
        const placeholders = Object.keys(columns).reduce((acc, key) => {
            if (key === 'children' || key === 'permissionsRead' || key === 'permissionsWrite') {
                acc[key] = JSON.stringify(record[key] ?? null); // JSON文字列として保存
            } else if (key === 'createdAt' || key === 'updatedAt') {
                acc[key] = record[key] ? new Date(record[key]).toISOString() : new Date().toISOString(); // 日付はISO形式で保存
            } else {
                acc[key] = record[key] ?? null; // レコードの値がない場合はnullを設定
            }
            return acc;
        }, {});
        db.run(
            sql,
            placeholders,
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
        // データベースファイルが存在しない場合は作成
        fs.writeFileSync(DB_PATH, '');
    }
    await createTable(); // テーブルを作成
    console.log('データベースの初期化が完了しました。');
}
initializeDatabase();