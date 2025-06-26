// Description: SQLiteのSQLを実行する関数
import fs from 'fs';
import { select, run } from './database.js';

// コマンドライン引数からSQLファイルパスまたはSQL文を取得
const argument = process.argv.slice(2);
let sqltext = null;
const showSql = argument.includes('--show-sql');
const filteredArgs = argument.filter(arg => arg !== '--show-sql');

if (filteredArgs.length === 0) {
    console.error('SQLファイルのパスまたはSQL文を指定してください。');
    process.exit(1);
} else if (filteredArgs[0].endsWith('.sql')) {
    const sqlpath = filteredArgs[0];
    try {
        sqltext = fs.readFileSync(sqlpath, 'utf8');
    } catch (err) {
        console.error(`SQLファイルの読み込みに失敗しました: ${err.message}`);
        process.exit(1);
    }
} else {
    sqltext = filteredArgs.join(' ');
}

// SQLを実行
(async () => {
    try {
        // セミコロンで分割し、順次実行
        const statements = sqltext
            .replace(/\r\n/g, '\n') // 改行コードを統一
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        for (const stmt of statements) {
            // パラメータバインディング例（必要に応じてparamsを設定）
            const params = []; // ここにバインドしたい値を配列で指定

            if (showSql) {
                console.log('--- 実行SQL ---\n' + stmt + '\n----------------');
            }

            try {
                if (stmt.toLowerCase().startsWith('select')) {
                    const rows = await select(stmt, params);
                    if (rows && rows.length > 0) {
                        console.table(rows);
                    } else {
                        console.log('SELECT結果: 0件');
                    }
                } else {
                    const result = await run(stmt, params);
                    console.log('実行結果:', result);
                }
            } catch (stmtError) {
                console.error('SQL実行中にエラーが発生しました:', stmtError.message);
                console.error('エラーが発生したSQL:', stmt);
            }
        }
    } catch (error) {
        console.error('SQL実行中にエラーが発生しました:', error.message);
    }
})();

