// Description: SQLiteのSQLを実行する関数
import fs from 'fs';
import { select, run } from './database.js';

// コマンドライン引数からSQLファイルパスを取得
const sqlpath = process.argv[2];
if (!sqlpath) {
    console.error('SQLファイルのパスを指定してください。');
    process.exit(1);
}

// SQLファイルを読み込む
const sql = fs.readFileSync(sqlpath, 'utf8');

// SQLを実行
(async () => {
    try {
        // セミコロンで分割し、順次実行
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const stmt of statements) {
            // パラメータバインディング例（必要に応じてparamsを設定）
            const params = []; // ここにバインドしたい値を配列で指定

            if (stmt.toLowerCase().startsWith('select')) {
                const rows = await select(stmt, params);
                console.log('SELECT結果:', rows);
            } else {
                const result = await run(stmt, params);
                console.log('実行結果:', result);
            }
        }
    } catch (error) {
        console.error('SQL実行中にエラーが発生しました:', error.message);
    }
})();

