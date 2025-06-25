// Description: SQLiteのSQLを実行する関数
export default function runSql(db, sql) {
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