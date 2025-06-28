import { ok } from "assert";

export default async function checkHandler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
        // ユーザー情報の取得
        const user = req.user; // authenticateTokenミドルウェアで設定されたユーザー情報
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // レコードの取得
        const records = await findRecords({ type: 'user', uuid: user.uuid });
        if (records.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // レコードの内容を返す
        const record = records[0];
        if (!record.content) {
            return res.status(404).json({ message: 'Record content not found' });
        }
        res.status(200).json({
            success: true,
            loggedIn: true,
            user: { uuid: user.uuid, username: user.username },
            record: JSON.parse(record.content)
        });
    } catch (error) {
        console.error('Error in checkHandler:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}