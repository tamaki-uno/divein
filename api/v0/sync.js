//  import
import { syncRecord } from "#database";

// レコード同期ハンドラ
export default async function syncHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    // const user = req.user;
    // if (!user || !user.uuid) {
    //     return res.status(401).json({ message: 'Unauthorized' });
    // }
    const payload = req.payload; // 認証ミドルウェアで設定されたペイロードを使用
    if (!payload || !payload.uuid) {
        return res.status(401).json({ message: 'Unauthorized' });
    }


    const record = req.body;
    if (!record || typeof record.uuid !== 'string' || !record.uuid) {
        return res.status(400).json({ message: 'Invalid record data' });
    }

    // record.updatedBy = user.uuid;
    record.updatedBy = payload.uuid; // ペイロードから更新者UUIDを取得
    record.updatedAt = new Date().toISOString();

    try {
        const result = await syncRecord(record);
        return res.status(200).json({ message: 'Record synced successfully', record: result });
    } catch (error) {
        console.error('Sync error:', error?.message || error);
        return res.status(500).json({ message: 'Internal Server Error', error: error?.message || 'Unknown error' });
    }
}

