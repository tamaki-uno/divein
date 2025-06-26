// Description: SQLiteのSQLを実行する関数
import sqlite3 from 'sqlite3';
import fs from 'fs';


// 複数SQL文を順次実行する関数
export default function runSql(sql) {
    // データベース接続
    const db = new sqlite3.Database('divein.db', (err) => {
        if (err) {
            console.error('データベースの接続に失敗しました:', err.message);
        } else {
            console.log('データベースに接続しました。');
        }
    });
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // セミコロンでSQL文を分割
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);
            let results = [];
            let idx = 0;
            // 再帰的に各SQL文を実行
            function next() {
                if (idx >= statements.length) {
                    db.close();
                    resolve(results);
                    return;
                }
                const stmt = statements[idx];
                // SELECT文はall, それ以外はrunで実行
                if (/^\s*select/i.test(stmt)) {
                    db.all(stmt, [], (err, rows) => {
                        if (err) {
                            db.close();
                            reject(err);
                        } else {
                            results.push(rows);
                            idx++;
                            next();
                        }
                    });
                } else {
                    db.run(stmt, function(err) {
                        if (err) {
                            db.close();
                            reject(err);
                        } else {
                            results.push({ changes: this.changes, lastID: this.lastID });
                            idx++;
                            next();
                        }
                    });
                }
            }
            next();
        });
    });
}

// コマンドライン引数からSQLファイルパスを取得
const sqlpath = process.argv[2]
// SQLファイルを読み込む
const sql = fs.readFileSync(sqlpath, 'utf8');
// SQLを実行
runSql(sql)
    .then((rows) => {
        console.log('SQL実行結果:', rows);
    })
    .catch((err) => {
        console.error('SQL実行中にエラーが発生しました:', err.message);
    });

