// ユーザー認証状態を確認し、ユーザーレコードを返すAPIハンドラ
export default async function checkHandler(req, res) {
    // GETメソッドのみ許可
    if (req.method !== 'GET') {
        return res.status(405).json({ message: '許可されていないメソッドです。' });
    }
    try {
        const payload = req.payload; // 認証ミドルウェアで設定されたペイロードを使用
        // 正常レスポンス
        return res.status(200).json({
            success: true,
            payload: payload
        });
    } catch (error) {
        // 予期しないエラー
        console.error('checkHandlerでエラー:', error);
        return res.status(500).json({ message: 'サーバー内部でエラーが発生しました。' });
    }
}