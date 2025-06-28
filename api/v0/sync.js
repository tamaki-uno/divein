//  import
import { syncRecord } from "#database";

export default async function syncHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    // リクエストボディの検証
    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    const user = req.user; // 認証ミドルウェアで設定されたユーザー情報
    if (!user || !user.uuid) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const record = req.body;
    if (!record || !record.uuid) {
        return res.status(400).json({ message: 'Invalid record data' });
    }
    // レコードの更新
    record.updatedBy = user.uuid; // 更新者のUUIDを設定
    record.updatedAt = new Date().toISOString(); // 更新日時を設定
    try {
        const result = await syncRecord(record);
        return res.status(200).json({ message: 'Record synced successfully', record: result });
    } catch (error) {
        console.error('Sync error:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}

