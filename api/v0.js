import sqlite3 from 'sqlite3';

export default function handleApiRequest(req, res) {
    // データベースに接続
    const db = new sqlite3.Database('divein.db', (err) => {
        if (err) {
            console.error('データベースの接続に失敗しました:', err.message);
            res.status(500).json({ status: "error", message: "データベース接続エラー" });
            return;
        }
    });

    // ここでデータベース検索や計算などの処理を行う
    const responseData = {
        status: "success",
        message: "これは api/v0.js からの動的な応答です。",
        timestamp: new Date().toISOString() // 現在時刻をISO形式で追加
    };

    // 処理結果をJSON形式でクライアントに返す
    res.json(responseData);

    // データベースの接続を閉じる
    db.close((err) => {
        if (err) {
            console.error('データベースの切断に失敗しました:', err.message);
        } else {
            console.log('データベースを切断しました。');
        }
    });
}