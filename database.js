import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = 'divein.db';

let db;

// データベース接続を非同期で初期化
export async function initDb() {
    db = await open({
        filename: './db/database.sqlite',
        driver: sqlite3.Database
    });
    console.log('データベース接続が初期化されました。');
    return db;
}

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

// データベース初期化関数
export async function initializeDatabase() {
    try {
        const schemaPath = path.join(process.cwd(), 'sql/createtable.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        // セミコロンで分割し、順次実行
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        for (const stmt of statements) {
            await run(stmt);
        }
        console.log('データベースの初期化が完了しました。');
    } catch (error) {
        console.error('データベースの初期化中にエラーが発生しました:', error.message);
        process.exit(1);
    }
}

// ユーザー名でユーザーを検索
export async function findUserByUsername(username) {
    return await db.get('SELECT * FROM users WHERE username = ?', [username]);
}

// 新規ユーザーを作成
export async function createUser(username, passwordHash) {
    const result = await db.run(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash]
    );
    return { id: result.lastID, username };
  }