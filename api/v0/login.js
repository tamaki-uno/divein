import bcrypt from 'bcrypt';
import 'dotenv/config';
import cookie from 'cookie'; // クッキー操作用ライブラリ

import { find } from '#database'; // データベース操作関数
import { generateAccessToken } from '#api/v0/auth.js'; // JWT生成関数


/**
 * ユーザーログイン処理
 * - POSTメソッドのみ許可
 * - ユーザー名とパスワードをチェック
 * - 成功時はユーザー情報を返す
 */
export default async function loginHandler(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' });
    }

    // ユーザーを検索
    const users = await find({
        type: 'user',
        content: username // 部分一致検索
    });

    // 厳密一致でユーザーを特定
    const user = users.find(u => {
        try {
            const content = JSON.parse(u.content);
            return content.username === username;
        } catch {
            return false;
        }
    });

    if (!user) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
    }

    // パスワードハッシュを取得
    let passwordHash;
    try {
        passwordHash = JSON.parse(user.content).password_hash;
    } catch {
        return res.status(500).json({ message: 'ユーザーデータが不正です。' });
    }

    // パスワードを比較
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
    }

    // JWTを生成して返す
    const token = generateAccessToken(user);
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'Strict',
        maxAge: 60 * 60 // 1時間
    }));
    res.status(200).json({
        message: 'ログイン成功',
        user: { uuid: user.uuid, username: JSON.parse(user.content).username },
        success: true
    });
}