import jwt from 'jsonwebtoken';

/**
 * アクセストークン（JWT）を生成する
 * @param {Object} payload - JWTのペイロード
 * @returns {string} 生成されたJWT
 * @throws {Error} JWT環境変数が未設定の場合
 */
function generateAccessToken(payload) {
    if (!process.env.JWT_SECRET || !process.env.JWT_ACCESS_TOKEN_EXPIRATION) {
        throw new Error('JWT環境変数が未設定です');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
    });
}

/**
 * 認証成功時のレスポンスを生成する
 * @async
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @param {Object} record - ユーザーレコード
 * @returns {Promise<import('express').Response>} レスポンスオブジェクト
 */
export async function respondAuth(res, record) {
    try {
        const payload = { uuid: record.uuid };
        const accessToken = generateAccessToken(payload);
        res.cookie('token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION) * 1000
        });
        return res.status(200).json({
            message: '認証成功',
            user: record
        });
    } catch (error) {
        console.error('認証エラー:', error);
        return res.status(500).json({ message: 'サーバー内部でエラーが発生しました。' });
    }
}

/**
 * JWTトークンを検証する認証ミドルウェア
 * @param {import('express').Request} req - リクエストオブジェクト
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 * @returns {void}
 */
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