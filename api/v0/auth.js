import jwt from 'jsonwebtoken';

// アクセストークンを生成
export function generateAccessToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION
    });
}

// リクエストヘッダーのトークンを検証するミドルウェア
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (token == null) {
        return res.sendStatus(401); // トークンが存在しない
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.sendStatus(403); // トークンが無効または期限切れ
        }
        // 検証成功後、リクエストオブジェクトにユーザー情報を格納
        req.user = userPayload;
        next();
    });
}