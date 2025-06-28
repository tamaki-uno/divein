import { findRecords } from '#database';

// ユーザー認証状態を確認し、ユーザーレコードを返すAPIハンドラ
export default async function checkHandler(req, res) {
    // POSTメソッド以外は許可しない
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
        // 認証済みユーザー情報を取得
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // ユーザーのレコードをDBから取得
        const records = await findRecords({ type: 'user', uuid: user.uuid });
        if (!records?.length) {
            return res.status(404).json({ message: 'User not found' });
        }

        // レコードのcontentフィールドを確認
        const record = records[0];
        if (!record.content) {
            return res.status(404).json({ message: 'Record content not found' });
        }

        // contentをJSONとしてパース
        let parsedContent;
        try {
            parsedContent = JSON.parse(record.content);
        } catch (parseError) {
            console.error('Failed to parse record content:', parseError);
            return res.status(500).json({ message: 'Invalid record content format' });
        }

        // 正常時のレスポンス
        return res.status(200).json({
            success: true,
            loggedIn: true,
            user: { uuid: user.uuid, username: user.username },
            record: parsedContent
        });
    } catch (error) {
        // 予期しないエラー時のレスポンス
        console.error('Error in checkHandler:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}