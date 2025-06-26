import fs from 'fs';
import { select, run } from './database.js'; // ユーティリティ関数をインポート

const templatePath = './api/template.json'; // テンプレートファイルのパス
const template = JSON.parse(fs.readFileSync(templatePath, 'utf8')); // テンプレートを読み込む

export default async function handleApiRequest(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }
    if (!req.is('application/json')) {
        res.status(400).json({ error: 'Bad Request: Content-Type must be application/json' });
        return;
    }
    let requestData;
    try {
        requestData = req.body;
    } catch (error) {
        res.status(400).json({ error: 'Bad Request: Invalid JSON' });
        return;
    }

    try {
        switch (requestData.type) {
            case 'request': {
                // UUIDが指定されていない場合は400を返す
                if (!requestData.uuid) {
                    res.status(400).json({ error: 'Bad Request: UUID is required' });
                    return;
                }
                const record = await getDatabaseRecord(requestData.uuid);
                if (!record) {
                    res.status(404).json({ error: 'Not Found: No record found with the given UUID' });
                } else {
                    res.status(200).json(record);
                }
                break;
            }
            default: {
                const updatedData = await syncRecord(requestData);
                res.status(200).json(updatedData);
                break;
            }
        }
    } catch (err) {
        console.error('API error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

// データベースからUUIDを使ってレコードを取得する関数
async function getDatabaseRecord(uuid) {
    const sql = 'SELECT * FROM records WHERE uuid = ?';
    try {
        const rows = await select(sql, [uuid]);
        if (rows.length === 0) {
            return null;
        }
        return rows[0];
    } catch (err) {
        console.error('Database error:', err);
        throw err;
    }
}

// データを同期し、新しいデータを返す
async function syncRecord(data) {
    if (!data.uuid) {
        throw new Error('UUID is required for sync');
    }
    const dbData = await getDatabaseRecord(data.uuid);
    // データが存在しない場合は新規作成
    if (!dbData) {
        const sql = 'INSERT INTO records (uuid, data, updatedAt) VALUES (?, ?, ?)';
        await run(sql, [data.uuid, JSON.stringify(data.data ?? {}), data.updatedAt ?? Date.now()]);
        return { ...data };
    }
    // updatedAtの比較（nullの場合は常に更新）
    if (!dbData.updatedAt || (data.updatedAt && dbData.updatedAt < data.updatedAt)) {
        const sql = 'UPDATE records SET data = ?, updatedAt = ? WHERE uuid = ?';
        await run(sql, [JSON.stringify(data.data ?? {}), data.updatedAt ?? Date.now(), data.uuid]);
        return { ...data };
    } else {
        // データベースのレコードが新しい場合は既存データを返す
        return {
            uuid: dbData.uuid,
            data: dbData.data ? JSON.parse(dbData.data) : {},
            updatedAt: dbData.updatedAt
        };
    }
}