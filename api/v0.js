
import fs from 'fs';
import {getDatabaseConnection} from './database.js'; // データベース接続関数をインポート

import {select, run} from './database.js'; // ユーティリティ関数をインポート

const templatePath = './api/template.json'; // テンプレートファイルのパス
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8')); // テンプレートを読み込む

export default function handleApiRequest(req, res) {
    if (req.method !== 'POST') {
        // POSTリクエスト以外は405 Method Not Allowedを返す
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }
    // リクエストのContent-Typeを確認
    if (!req.is('application/json')) {
        // JSON以外のContent-Typeは400 Bad Requestを返す
        res.status(400).json({ error: 'Bad Request: Content-Type must be application/json' });
        return;
    }
    // リクエストボディをJSONとしてパース
    let requestData;
    try {
        requestData = req.body; // Expressが自動的にJSONをパースしてくれる
    } catch (error) {
        // JSONパースエラーは400 Bad Requestを返す
        res.status(400).json({ error: 'Bad Request: Invalid JSON' });
        return;
    }
    switch (requestData.type) {
        case 'request':
            // リクエストタイプが'request'の場合、UUIDを使ってデータベースからレコードを取得
            return getDatabaseRecord(requestData.uuid)
                .then(record => {
                    if (!record) {
                        // レコードが見つからない場合は404 Not Foundを返す
                        res.status(404).json({ error: 'Not Found: No record found with the given UUID' });
                    } else {
                        // レコードが見つかった場合はそのデータを返す
                        res.status(200).json(record);
                    }
                })
                .catch(err => {
                    console.error('Database error:', err);
                    // データベースエラーは500 Internal Server Errorを返す
                    res.status(500).json({ error: 'Internal Server Error' });
                });
        default:
            return syncRecord(requestData)
                .then(updatedData => {
                    // データの同期が成功した場合は200 OKを返す
                    res.status(200).json(updatedData);
                })
                .catch(err => {
                    console.error('Sync error:', err);
                    // 同期エラーは500 Internal Server Errorを返す
                    res.status(500).json({ error: 'Internal Server Error' });
                });
    }
}

// データベースからUUIDを使ってレコードを取得する関数
async function getDatabaseRecord(uuid) {
    const sql = 'SELECT * FROM records WHERE uuid = ?';
    select(sql, [uuid])
        .then(rows => {
            if (rows.length === 0) {
                // throw new Error('No record found with the given UUID');
                return null; // レコードが見つからない場合はnullを返す
            }
            // return rows[0];
            // レコードが見つかった場合は最初の行をJSON形式で返す
            return JSON.stringify(rows[0]);
        })
        .catch(err => {
            console.error('Database error:', err);
            throw err;
        });
    // return select(sql, [uuid]);
}

// データを同期し、新しいデータを返す
async function syncRecord(data) {
    // const sql = 'UPDATE records SET data = ? WHERE uuid = ?';
    // return run(sql, [data, uuid]);
    const dbData = getDatabaseRecord(data.uuid); // データベースからレコードを取得
    if (dbData.updatedAt < data.updatedAt) {
        // データベースのレコードが古い場合は更新
        const sql = 'UPDATE records SET data = ?, updatedAt = ? WHERE uuid = ?';
        run(sql, [data.data, data.updatedAt, uuid])
            .then(result => {
                if (result.changes === 0) {
                    // 更新が行われなかった場合は404 Not Foundを返す
                    throw new Error('No record found with the given UUID');
                }
                return data; // 更新後のデータを返す
            })
            .catch(err => {
                console.error('Database error:', err);
                throw err; // エラーを再スロー
            });
        // return run(sql, [data.data, data.updatedAt, uuid]);
    } else {
        // データベースのレコードが新しい場合は何もしない
        return dbData; // 既存のデータを返す
    }
}