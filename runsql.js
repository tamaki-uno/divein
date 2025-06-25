// Description: SQLiteのSQLを実行する関数
import sqlite3 from 'sqlite3';

export default function runSql(sql) {
    const db = new sqlite3.Database('divein.db', (err) => {
        if (err) {
            console.error('データベースの接続に失敗しました:', err.message);
        } else {
            console.log('データベースに接続しました。');
        }
    });
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('SQL実行中にエラーが発生しました:', err.message);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    });
}