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
    // POSTメソッド以外は許可しない
    if (req.method !== 'POST') {
        return res.status(405).json({ message: '許可されていないメソッドです。' });
    }

    // リクエストボディからユーザー名とパスワードを取得
    const { username, password } = req.body;
    // ユーザー名とパスワードが未入力の場合は400 Bad Requestを返す
    if (!username || !password) {
        return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' });
    }
    // ユーザー名でユーザーレコードを検索（部分一致）
    const userRecords = await findRecords({
        type: 'user',
        content: username // 部分一致検索
    });
    // ユーザーレコードが見つからない場合は401 Unauthorizedを返す
    if (!userRecords || userRecords.length === 0) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
    }
    // ユーザーレコードからユーザー名を含むものを探す
    const userRecordData = userRecords.find(recordData => {
        try {
            const content = JSON.parse(recordData.content);
            return content.username === username;
        } catch {
            return false;
        }
    });
    // ユーザーレコードが見つからない場合は401 Unauthorizedを返す
    if (!userRecordData) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
    }
    // contentをパースしてオブジェクトに変換
    const parsedContent = JSON.parse(userRecordData.content);
    const userRecord = {
        ...userRecordData,
        content: parsedContent
    };
    // パスワードハッシュを取得
    const passwordHash = userRecord.content.password_hash;
    if (!passwordHash) {
        return res.status(500).json({ message: 'ユーザーデータが不正です。' });
    }

    // パスワードを比較
    const isPasswordValid = await bcrypt.compare(password, passwordHash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
    }

    // 認証成功時の処理
    const payload = {
        ...userRecord,
        content: {
            ...userRecord.content,
            password_hash: undefined // パスワードハッシュは含めない
        }
    };
    const token = generateAccessToken(payload); // ペイロードを渡してトークンを生成

    // クッキーにトークンをセット
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true, // JavaScriptからはアクセスできないようにする
        secure: process.env.NODE_ENV === 'production', // 本番環境ではSecure属性を有効にする
        sameSite: 'Lax', // ← StrictからLaxに変更
        maxAge: 60 * 60 // 1時間
    }));

    res.status(200).json({
        message: 'ログイン成功',
        success: true,
        payload: payload // ペイロードを返す
    });
}