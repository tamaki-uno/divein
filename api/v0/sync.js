//  import
import { syncRecord } from "#database";

/**
 * レコード同期ハンドラ
 * @param {import('express').Request} req - リクエストオブジェクト
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @returns {Promise<void>}
 */
export default async function syncHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    const payload = req.payload; // 認証ミドルウェアで設定されたペイロードを使用
    if (!payload || !payload.uuid) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const record = req.body;
    if (!record || typeof record.uuid !== 'string' || !record.uuid) {
        return res.status(400).json({ message: 'Invalid record data' });
    }

    record.updatedBy = payload.uuid; // ペイロードから更新者UUIDを取得

    try {
        const syncedRecord = await syncRecord(record); // レコードを同期
        return res.status(200).json({ success: true, record: syncedRecord });
    } catch (error) {
        console.error('Sync error:', error?.message || error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message || 'Unknown error' });
    }
}