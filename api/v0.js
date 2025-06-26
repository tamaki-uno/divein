import fs from 'fs';
import { select, run } from './database.js';

// テンプレートJSONの読み込み
const template = JSON.parse(fs.readFileSync('./api/template.json', 'utf8'));

/** * APIリクエストのメインハンドラ
 */
export async function getHandler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });
    // Content-Typeチェック
    if (!req.is('application/json')) return res.status(400).json({ error: 'Content-Type must be application/json' });

    let data = req.query;
    // クエリパラメータがオブジェクトでなければエラー
    if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Query parameters must be a JSON object' });

}

/**
 * APIリクエストのメインハンドラ
 * - POSTのみ許可
 * - uuid未指定時はテンプレート返却
 * - type='request'ならDBから取得
 * - それ以外はDBと同期
 */
export default async function postHandler(req, res) {
    // POST以外は許可しない
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
    // Content-Typeチェック
    if (!req.is('application/json')) return res.status(400).json({ error: 'Content-Type must be application/json' });

    let data = req.body;
    // ボディがオブジェクトでなければエラー
    if (!data || typeof data !== 'object') return res.status(400).json({ error: 'Request body must be a JSON object' });

    // uuid未指定ならテンプレート返却
    if (!data.uuid) return res.status(200).json(template);

    try {
        if (data.type === 'request') {
            // typeが'request'ならDBから取得
            const record = await getRecord(data.uuid);
            if (!record) return res.status(404).json({ error: 'Not Found' });
            return res.status(200).json(record);
        } else {
            // それ以外は同期
            const synced = await syncRecord(data);
            return res.status(200).json(synced);
        }
    } catch (err) {
        // 予期しないエラーは500
        console.error('API error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

/**
 * UUIDでDBからレコード取得
 * @param {string} uuid
 * @returns {object|null}
 */
async function getRecord(uuid) {
    const rows = await select('SELECT * FROM records WHERE uuid = ?', [uuid]);
    return rows[0] || null;
}

/**
 * レコードを新規作成または更新し、最新データを返す
 * @param {object} data
 * @returns {object}
 */
async function syncRecord(data) {
    const dbData = await getRecord(data.uuid);
    const now = data.updatedAt ?? Date.now();

    if (!dbData) {
        // 新規作成
        await run('INSERT INTO records (uuid, data, updatedAt) VALUES (?, ?, ?)', [data.uuid, JSON.stringify(data.data ?? {}), now]);
        return { ...data, updatedAt: now };
    }
    // 更新条件: DBのupdatedAtが古い場合のみ
    if (!dbData.updatedAt || (data.updatedAt && dbData.updatedAt > dbData.updatedAt)) {
        await run('UPDATE records SET data = ?, updatedAt = ? WHERE uuid = ?', [JSON.stringify(data.data ?? {}), now, data.uuid]);
        return { ...data, updatedAt: now };
    }
    // それ以外はDBの内容を返す
    return {
        uuid: dbData.uuid,
        data: dbData.data ? JSON.parse(dbData.data) : {},
        updatedAt: dbData.updatedAt
    };
}

async function getContent