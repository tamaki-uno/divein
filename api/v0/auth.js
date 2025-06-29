import jwt from 'jsonwebtoken';

// アクセストークンを生成
export function generateAccessToken(payload) {
    if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_TOKEN_EXPIRATION) {
        throw new Error('JWT環境変数が未設定です');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
    });
}

// リクエストヘッダーのトークンを検証するミドルウェア（Cookieのみ対応）
export function authenticateToken(req, res, next) {
    try {
        // リクエストヘッダーにCookieが存在するか確認
        if (!req.headers.cookie) {
            return res.status(401).json({ message: '認証トークンが必要です' });
        }
        // Cookieからトークンを抽出
        const match = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
        const token = match ? match[1] : null;
        if (!token) {
            return res.status(401).json({ message: '認証トークンが必要です' });
        }
        // JWT_SECRETが設定されているか確認
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'JWT_SECRETが未設定です' });
        }
        // トークンを検証
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                return res.status(403).json({ message: 'トークンが無効または期限切れです' });
            }
            req.payload = payload; // ペイロードをreqに保存
            next();
        });
    } catch (error) {
        console.error('認証ミドルウェアでエラー:', error);
        return res.status(500).json({ message: 'サーバー内部でエラーが発生しました。' });
    }
}