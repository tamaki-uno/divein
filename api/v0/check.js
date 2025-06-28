import { findRecords } from '#database';

// ユーザー認証状態を確認し、ユーザーレコードを返すAPIハンドラ
export default async function checkHandler(req, res) {
    // POSTメソッド以外は許可しない
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '許可されていないメソッドです。' });
    }
    try {
        // ユーザー情報取得
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: '認証されていません。' });
        }

        // ユーザーレコード取得
        const records = await findRecords({ type: 'user', uuid: user.uuid });
        if (!records?.length) {
            return res.status(404).json({ message: 'ユーザーが見つかりません。' });
        }

        // contentフィールド確認
        const record = records[0];
        if (!record.content) {
            return res.status(404).json({ message: 'レコード内容が見つかりません。' });
        }

        // contentをJSONとしてパース
        let parsedContent;
        try {
            parsedContent = JSON.parse(record.content);
        } catch (parseError) {
            console.error('レコード内容のパースに失敗:', parseError);
            return res.status(500).json({ message: 'レコード内容の形式が不正です。' });
        }

        // 正常レスポンス
        return res.status(200).json({
            success: true,
            loggedIn: true,
            user: { uuid: user.uuid, username: user.username },
            record: parsedContent
        });
    } catch (error) {
        // 予期しないエラー
        console.error('checkHandlerでエラー:', error);
        return res.status(500).json({ message: 'サーバー内部でエラーが発生しました。' });
    }
}