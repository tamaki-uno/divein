'use strict';

import sqlite3 from 'sqlite3';
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
    createdBy: "TEXT", // 作成者のUUID　変更不可
    updatedBy: "TEXT",
    createdAt: "TIMESTAMP", // 変更不可
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

// // 完全一致でUUIDで探す関数
// export async function findByUuid(uuid) {
//     const db = getDatabaseConnection();
//     return new Promise((resolve, reject) => {
//         db.get('SELECT * FROM records WHERE uuid = ?', [uuid], (err, row) => {
//             db.close();
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(row);
//             }
//         });
//     });
// }

// // コンテンツの内容の部分一致で探す関数
// export async function findByContent(keyword, limit = 100, sortBy = 'createdAt', sortOrder = 'DESC') {
//     const db = getDatabaseConnection();
//     const sql = `SELECT * FROM records WHERE content LIKE ? ORDER BY ${sortBy} ${sortOrder} LIMIT ?`;
//     return new Promise((resolve, reject) => {
//         db.all(sql, [`%${keyword}%`, limit], (err, rows) => {
//             db.close();
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(rows);
//             }
//         });
//     });
// }

export async function findRecords(query, limit = 100, sortBy = 'createdAt', sortOrder = 'DESC') {
    const db = getDatabaseConnection();
    // const sql = 'SELECT * FROM records WHERE 1=1'; // 基本のSQL文
    // const params = []; // パラメータ配列
    let sql = 'SELECT * FROM records WHERE 1=1'; // 基本のSQL文
    const params = []; // パラメータ配列
    // クエリパラメータに応じて条件を追加
    if (query.uuid) {
        sql += ' AND uuid = ?';
        params.push(query.uuid);
    }
    if (query.type) {
        sql += ' AND type = ?';
        params.push(query.type);
    }
    if (query.content) {
        sql += ' AND content LIKE ?';
        params.push(`%${query.content}%`);
    }
    if (query.permissionsRead) {
        sql += ' AND permissionsRead LIKE ?';
        params.push(`%${query.permissionsRead}%`);
    }
    if (query.permissionsWrite) {
        sql += ' AND permissionsWrite LIKE ?';
        params.push(`%${query.permissionsWrite}%`);
    }
    // ソート条件とリミットを追加
    sql += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ?`;
    params.push(limit);
    
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
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

// // レコードを更新する関数 uuidを指定して更新
// export async function updateRecord(uuid, updates) {
//     const db = getDatabaseConnection();
//     return new Promise((resolve, reject) => {
//         const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
//         const sql = `UPDATE records SET ${setClause} WHERE uuid = ?`;
//         const values = [...Object.values(updates), uuid];
//         db.run(sql, values, function (err) {
//             db.close();
//             if (err) {
//                 console.error('レコード更新エラー:', err.message);
//                 reject(err);
//             } else {
//                 resolve({ changes: this.changes });
//             }
//         });
//     });
// }

//
export async function syncRecord(record) {
    // レコードを更新または挿入する関数
    // const existingRecord = await findByUuid(record.uuid);
    const existingRecords = await findRecord({ uuid: record.uuid });
    if (existingRecords && existingRecords.length > 0) {
        const existingRecord = JSON.parse(JSON.stringify(existingRecords[0]));
        // // 既存のレコードがある場合は更新
        if (record.updatedBy in existingRecord.permissionsWrite) {
            const db = getDatabaseConnection();
            const updates = {
                ...existingRecord,
                ...record,
                updatedAt: new Date().toISOString(),
                updatedBy: record.updatedBy || existingRecord.updatedBy
            };
            return new Promise((resolve, reject) => {
                const keys = Object.keys(updates);
                const setClause = keys.map(key => `${key} = ?`).join(', ');
                const sql = `UPDATE records SET ${setClause} WHERE uuid = ?`;
                const values = keys.map(key => {
                    if (key === 'children' || key === 'permissionsRead' || key === 'permissionsWrite') {
                        return updates[key] !== undefined ? JSON.stringify(updates[key]) : null;
                    } else if (key === 'createdAt' || key === 'updatedAt') {
                        return updates[key] ? new Date(updates[key]).toISOString() : new Date().toISOString();
                    }
                    return updates[key] ?? null;
                });
                values.push(updates.uuid);
                db.run(sql, values, function (err) {
                    db.close();
            // if (record.updatedAt && new Date(record.updatedAt) > new Date(existingRecord.updatedAt)) {
            //     // 更新日時が新しい場合のみ更新
            //     const updates = {
            //         ...record,
            //         updatedAt: new Date().toISOString(),
            //         updatedBy: record.updatedBy || existingRecord.updatedBy
            //     };
            //     return insertRecord(updates);
            // } else {
            //     return existingRecord;
            // }
        } else {
            // 更新権限がない場合はエラーを投げる
            throw new Error('更新権限がありません。');
        }
    } else {
        // 既存のレコードがない場合は新規挿入
        return insertRecord(record);
    }
    
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

// // テーブルを作成
// createTable().then(() => {
//     console.log('データベースの初期化が完了しました。');
// }).catch(err => {
//     console.error('データベースの初期化中にエラーが発生しました:', err);
// });
