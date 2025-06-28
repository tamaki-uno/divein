import bcrypt from 'bcrypt';
import 'dotenv/config';
import cookie from 'cookie'; // クッキー操作用ライブラリ

import { findRecords } from '#database'; // データベース操作関数
// import { generateAccessToken } from '#api/v0/auth.js'; // JWT生成関数
import { generateAccessToken } from './auth.js'; // JWT生成関数のパスを修正


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
    const users = await findRecords({
        type: 'user',
        content: username // 部分一致検索
    });

    // 厳密一致でユーザーを特定し、パース済みcontentも取得
    let user, userContent;
    for (const u of users) {
        try {
            const content = JSON.parse(u.content);
            if (content.username === username) {
                user = u;
                userContent = content;
                break;
            }
        } catch {
            continue;
        }
    }

    if (!user || !userContent) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
    }

    // パスワードハッシュを取得
    const passwordHash = userContent.password_hash;
    if (!passwordHash) {
        return res.status(500).json({ message: 'ユーザーデータが不正です。' });
    }

    // パスワードを比較
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
    }

    // JWTを生成して返す（uuid, usernameのみ渡す）
    const token = generateAccessToken({
        id: user.uuid,
        username: userContent.username,
        // email: userContent.email, // 必要なら
    });

    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', // ← StrictからLaxに変更
        maxAge: 60 * 60 // 1時間
    }));

    res.status(200).json({
        message: 'ログイン成功',
        user: { uuid: user.uuid, username: userContent.username },
        success: true
    });
}