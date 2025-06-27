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
    // const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    //     if (err) {
    //         console.error('データベース接続エラー:', err.message);
    //         throw err;
    //     }
    //     console.log('データベースに接続しました。');
    // });
    // const sql = fs.readFileSync(path.join(process.cwd(), 'sql/createTable.sql'), 'utf8');
    const sqlColumns = Object.entries(columns).reduce((acc, [key, value]) => {
        // 各カラムの定義を追加
        acc[key] = value;
        return acc;
    }, {}); // カラム定義をオブジェクトとして作成
    const sqlIndexes = indexes.map(index => `idx_records_${index} ON records (${index})`); // インデックスの定義
    const sql = `
        CREATE TABLE IF NOT EXISTS records (
            ${Object.entries(columns).map(([key, value]) => `${key} ${value}`).join(',\n')}
        );
        CREATE INDEX IF NOT EXISTS idx_records_${indexes.join('_')} ON records (${indexes.join(', ')});
    `; // SQLスクリプトを直接定義
    // セミコロンで分割し、順次実行
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
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
        // const columns = Object.keys(record).join(', ');
        // const sql = `
        //     INSERT INTO records (${columns})
        //     VALUES (?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
        // `;
        const sql = `
            INSERT INTO records (
                uuid,
                type,
                content,
                children,
                permissionsRead,
                permissionsWrite,
                createdBy,
                updatedBy,
                createdAt,
                updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
        `;

// テンプレートを挿入する関数
export async function insertTemplate(template) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO templates (
                uuid,
                type,
                content,
                children,
                permissions_read,
                permissions_write,
                createdBy,
                updatedBy,
                createdAt,
                updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))
        `;
        db.run(
            sql,
            [
                template.uuid,
                template.type,
                template.content,
                // children, permissions_read, permissions_writeはJSON文字列として保存
                JSON.stringify(template.children ?? null),
                JSON.stringify(template.permissions?.read ?? null),
                JSON.stringify(template.permissions?.write ?? null),
                template.createdBy ?? null,
                template.updatedBy ?? null,
                template.createdAt ?? null,
                template.updatedAt ?? null
            ],
            function (err) {
                db.close();
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            }
        );
    });
}


