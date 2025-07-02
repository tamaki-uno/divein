/**
 * ログアウト処理
 * @async
 * @param {import('express').Request} req - リクエストオブジェクト
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @returns {Promise<void>}
 */
export default async function logoutHandler(req, res) {
    try {
        // POSTメソッド以外は許可しない
        if (req.method !== 'POST') {
            return res.status(405).json({ message: '許可されていないメソッドです。' });
        }

        // クッキーからトークンを削除
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        return res.status(200).json({ message: 'ログアウトしました。' });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}