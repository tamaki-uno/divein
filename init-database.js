// SQLiteの初期設定
import sqlite3 from 'sqlite3'; // SQLite3のモジュールをインポート
// import { open } from 'sqlite'; // SQLiteの非同期APIを使用するためのモジュール
import fs from 'fs'; // ファイルシステムモジュールをインポート
import path from 'path'; // パス操作のためのモジュール

// データベースの初期化関数
export default function initDatabase() {
    // データベースとの接続を開く
    const db = new sqlite3.Database('divein.db', (err) => {
        if (err) {
            console.error('データベースの接続に失敗しました:', err.message);
        } else {
            console.log('データベースに接続しました。');
        }
    });
    // データベーススキーマの読み込み
    try {
        // const databaseSchema = fs.readFileSync('database-schema.json', 'utf8'); // データベーススキーマのJSONファイルを読み込む
        const databaseSchema = fs.readFileSync(path.join(__dirname, 'database-schema.json'), 'utf8'); // データベーススキーマのJSONファイルを読み込む
        const schema = JSON.parse(databaseSchema); // JSONをオブジェクトに変換
    } catch (error) {
        console.error('データベーススキーマの読み込みに失敗しました:', error.message);
        return;
    }
    // データベースのテーブルを作成
    db.serialize(() => {
        for (const tableName in schema) {
            const columns = Object.entries(schema[tableName]) // 各テーブルのカラムを定義
                .map(([key, value]) => `${key} ${value}`) // キーと値を結合してカラム定義を作成
                .join(', '); // カラム定義をカンマで結合
            db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`, (err) => {
                if (err) {
                    console.error(`${tableName} テーブルの作成に失敗しました:`, err.message);
                } else {
                    console.log(`${tableName} テーブルを作成しました。`);
                }
            });
        }
    });
    // データベースの接続を閉じる
    db.close((err) => {
        if (err) {
            console.error('データベースの切断に失敗しました:', err.message);
        } else {
            console.log('データベースを切断しました。');
        }
    });
};

initDatabase(); // 初期化関数を呼び出してデータベースをセットアップ