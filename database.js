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

/**
 * データベース接続を取得する関数
 * @returns {sqlite3.Database}
 */
function getDatabaseConnection() {
    return new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error('データベース接続エラー:', err.message);
            throw err;
        }
    });
}

/**
 * テーブルを作成する関数
 * @returns {Promise<void>}
 */
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

/** * レコードを検索する関数
 * - 検索条件に基づいてレコードを取得
 * permissionsReadを使用して、読み取り権限を持つユーザーのみが取得可能
 * @param {Object} query - 検索条件オブジェクト 一致するフィールドを指定
 * @param {Object} [options={}] - オプションパラメータ
 * @param {number} [options.limit=100] - 取得するレコードの最大数
 * @param {string} [options.sortBy='createdAt'] - ソートするカラム名
 * @param {string} [options.sortOrder='DESC'] - ソート順 ('ASC' or 'DESC')
 * @param {boolean} [options.exact=false] - 完全一致検索を行うかどうか
 * @returns {Promise<Array>}
 */
export async function findRecords(query, options = { limit: 100, sortBy: 'createdAt', sortOrder: 'DESC', exact: false }) {
    const db = getDatabaseConnection();
    let sql = 'SELECT * FROM records WHERE 1=1';
    const params = [];
    if (query.uuid) {
        sql += ' AND uuid = ?';
        params.push(query.uuid);
    }
    if (query.type) {
        sql += ' AND type = ?';
        params.push(query.type);
    }
    if (query.content) {
        if (options.exact) {
            sql += ' AND content = ?';
            params.push(query.content);
        } else {
            sql += ' AND content LIKE ?';
            params.push(`%${query.content}%`);
        }
    }
    if (query.permissionsRead) {
        sql += ' AND permissionsRead LIKE ?';
        params.push(`%${query.permissionsRead}%`);
    }
    if (query.permissionsWrite) {
        sql += ' AND permissionsWrite LIKE ?';
        params.push(`%${query.permissionsWrite}%`);
    }
    sql += ` ORDER BY ${options.sortBy} ${options.sortOrder} LIMIT ?`;
    params.push(options.limit);

    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            db.close();
            if (err) {
                reject(err);
            } else {
                // JSON文字列のカラムをパースして返す
                const parsedRows = rows.map(row => ({
                    ...row,
                    children: row.children ? JSON.parse(row.children) : [],
                    permissionsRead: row.permissionsRead ? JSON.parse(row.permissionsRead) : [],
                    permissionsWrite: row.permissionsWrite ? JSON.parse(row.permissionsWrite) : []
                }));
                resolve(parsedRows);
            }
        });
    });
}

/** * レコードを準備する関数
 * - レコードのカラムを適切に変換
 * - JSON文字列のカラムはJSON.parseでパース
 * * @param {Object} record - レコードデータ
 * @returns {Object} - 準備されたレコードオブジェクト
 */
function prepareRecord(record) {
    const keys = Object.keys(columns);
    const columnsToChange = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map(key => {
        if (key === 'children' || key === 'permissionsRead' || key === 'permissionsWrite') {
            return record[key] !== undefined ? JSON.stringify(record[key]) : JSON.stringify([]);
        } else if (key === 'createdAt' || key === 'updatedAt') {
            return record[key] ? new Date(record[key]).toISOString() : new Date().toISOString();
        } else {
            return record[key] ?? null;
        }
    });
    return {
        columns: columnsToChange,
        placeholders,
        values
    };
}


/**
 * レコードを挿入する関数
 * @param {Object} record
 * @returns {Promise<Object>}
 */
async function insertRecord(record) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        const preparedRecord = prepareRecord(record);
        const sql = `INSERT INTO records (${preparedRecord.columns})
            VALUES (${preparedRecord.placeholders})`;
        db.run(
            sql,
            preparedRecord.values,
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

// /**
//  * レコードを更新または挿入する関数
//  * @param {Object} record
//  * @returns {Promise<Object>}
//  */
// // export async function saveRecord(record) {
// export async function upsertRecord(record) {
//     if (!record || !record.uuid) {
//         throw new Error('saveRecord: recordまたはuuidが未指定です');
//     }
//     const db = getDatabaseConnection();
//     return new Promise((resolve, reject) => {
//         const keys = Object.keys(columns);
//         const setClause = keys.map(key => `${key} = ?`).join(', ');
//         const sql = `
//             INSERT INTO records (${keys.join(', ')})
//             VALUES (${keys.map(() => `?`).join(', ')})
//             ON CONFLICT(uuid) DO UPDATE SET ${setClause}
//             WHERE updatedAt < ? 
//             `; // ON CONFLICT句を使用して、uuidが重複した場合は更新する upsert処理 updatedAtが古い場合のみ更新
//         const values = keys.map(key => {
//             // 各カラムの値を適切に処理 undefinedの場合はnullにする
//             if (key === 'children' || key === 'permissionsRead' || key === 'permissionsWrite') {
//                 // JSON文字列として保存
//                 return record[key] !== undefined ? JSON.stringify(record[key]) : JSON.stringify([]);
//             } else if (key === 'createdAt' || key === 'updatedAt') {
//                 // 日時をISO形式で保存
//                 return record[key] ? new Date(record[key]).toISOString() : new Date().toISOString();
//             } else {
//                 // その他のカラムはそのまま保存
//                 return record[key] ?? null;
//             }
//         });
//         values.push(new Date().toISOString()); // 更新日時を現在のISO形式に設定
//         db.run(
//             sql,
//             values,
//             function (err) {
//                 db.close();
//                 if (err) {
//                     console.error('レコード保存エラー:', err.message);
//                     reject(err);
//                 } else {
//                     resolve({ id: this.lastID, changes: this.changes });
//                 }
//             }
//         );
//     });
// }

async function updateRecord(record) {
    if (!record || !record.uuid) {
        throw new Error('updateRecord: recordまたはuuidが未指定です');
    }
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        const keys = Object.keys(columns);
        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const sql = `UPDATE records SET ${setClause} WHERE uuid = ?`;
        const values = keys.map(key => {
            if (key === 'children' || key === 'permissionsRead' || key === 'permissionsWrite') {
                return record[key] !== undefined ? JSON.stringify(record[key]) : JSON.stringify([]);
            } else if (key === 'createdAt' || key === 'updatedAt') {
                return record[key] ? new Date(record[key]).toISOString() : new Date().toISOString();
            } else {
                return record[key] ?? null;
            }
        });
        values.push(record.uuid);
        db.run(
            sql,
            values,
            function (err) {
                db.close();
                if (err) {
                    console.error('レコード更新エラー:', err.message);
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            }
        );
    });
}


/** * レコードを同期する関数
 * - 既存のレコードがあれば更新し、なければ新規作成
 * - 更新権限を持つユーザーのみが更新可能
 * * @param {Object} record - レコードデータ
 * @returns {Promise<Object>} - 同期されたレコード
 * * @throws {Error} - 更新権限がない場合
 * @async
 * */

export async function syncRecord(record) {
    const existingRecords = await findRecords({ uuid: record.uuid });
    if (existingRecords && existingRecords.length > 0) {
        const existingRecord = existingRecords[0];
        // 更新権限のチェック
        let permissionsWrite = [];
        try {
            permissionsWrite = Array.isArray(existingRecord.permissionsWrite)
                ? existingRecord.permissionsWrite
                : typeof existingRecord.permissionsWrite === 'string'
                    ? JSON.parse(existingRecord.permissionsWrite)
                    : [];
        } catch {
            permissionsWrite = [];
        }
        // 更新者が権限を持っているか確認
        if (permissionsWrite.includes(record.updatedBy)) {
            // const db = getDatabaseConnection();
            // const updates = {
            //     ...existingRecord,
            //     ...record,
            //     updatedAt: new Date().toISOString(),
            //     updatedBy: record.updatedBy || existingRecord.updatedBy
            // };
            // return new Promise((resolve, reject) => {
            //     const keys = Object.keys(columns);
            //     const setClause = keys.map(key => `${key} = ?`).join(', ');
            //     const sql = `UPDATE records SET ${setClause} WHERE uuid = ?`;
            //     const values = keys.map(key => {
            //         if (key === 'children' || key === 'permissionsRead' || key === 'permissionsWrite') {
            //             return updates[key] !== undefined ? JSON.stringify(updates[key]) : JSON.stringify([]);
            //         } else if (key === 'createdAt' || key === 'updatedAt') {
            //             return updates[key] ? new Date(updates[key]).toISOString() : new Date().toISOString();
            //         }
            //         return updates[key] ?? null;
            //     });
            //     values.push(updates.uuid);
            //     db.run(sql, values, function (err) {
            //         db.close();
            //         if (err) {
            //             console.error('レコード更新エラー:', err.message);
            //             reject(err);
            //         } else {
            //             resolve({ changes: this.changes });
            //         }
            //     });
            // });
            if (record.updatedAt > existingRecord.updatedAt) {
                // 更新日時が新しい場合のみ更新
                const updates = {
                    ...existingRecord,
                    ...record,
                    updatedAt: new Date().toISOString(),
                    updatedBy: record.updatedBy || existingRecord.updatedBy
                };
                return insertRecord(updates);
            }
        } else {
            throw new Error('更新権限がありません。');
        }
    } else {
        return insertRecord(record);
    }
}

/**
 * レコードを削除する関数
 * @param {string} uuid
 * @returns {Promise<Object>}
 */
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
