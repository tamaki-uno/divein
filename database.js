import sqlite3 from 'sqlite3';

const DB_PATH = 'divein.db';

// データベース接続を返す関数
export function getDatabaseConnection() {
    return new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('データベース接続エラー:', err.message);
        }
    });
}

// SQLをパラメータ付きで実行するユーティリティ関数（SELECT用）
export function select(sql, params = []) {
    const db = getDatabaseConnection();
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

// SQLをパラメータ付きで実行するユーティリティ関数（INSERT/UPDATE/DELETE用）
export function run(sql, params = []) {
    const db = getDatabaseConnection();
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            db.close();
            if (err) {
                reject(err);
            } else {
                resolve({ changes: this.changes, lastID: this.lastID });
            }
        });
    });
}