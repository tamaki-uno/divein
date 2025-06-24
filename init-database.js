// SQLiteの初期設定
import sqlite3 from 'sqlite3'; // SQLite3のモジュールをインポート

const db = new sqlite3.Database('divein.db', (err) => {
    if (err) {
        console.error('データベースの接続に失敗しました:', err.message);
    } else {
        console.log('データベースに接続しました。');
    }
});

// 作成するデータベースの情報の定義
const user = {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    name: 'TEXT NOT NULL',
    email: 'TEXT NOT NULL UNIQUE',
    password: 'TEXT NOT NULL',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
}
const records = {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    user_id: 'INTEGER NOT NULL',
    content: 'TEXT NOT NULL',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    FOREIGN_KEY: 'FOREIGN KEY (user_id) REFERENCES user(id)'
}

// データベースのテーブルを作成
db.serialize(() => {
    // ユーザーテーブルの作成
    db.run(`CREATE TABLE IF NOT EXISTS user (${Object.entries(user).map(([key, value]) => `${key} ${value}`).join(', ')})`, (err) => {
        if (err) {
            console.error('ユーザーテーブルの作成に失敗しました:', err.message);
        } else {
            console.log('ユーザーテーブルを作成しました。');
        }
    });

    // レコードテーブルの作成
    db.run(`CREATE TABLE IF NOT EXISTS records (${Object.entries(records).map(([key, value]) => `${key} ${value}`).join(', ')})`, (err) => {
        if (err) {
            console.error('レコードテーブルの作成に失敗しました:', err.message);
        } else {
            console.log('レコードテーブルを作成しました。');
        }
    });
});
// データベースの接続を閉じる
db.close((err) => {
    if (err) {
        console.error('データベースの切断に失敗しました:', err.message);
    } else {
        console.log('データベースを切断しました。');
    }
});
