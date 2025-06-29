import bcrypt from 'bcrypt';
import 'dotenv/config';
import cookie from 'cookie'; // クッキー操作用ライブラリ

import { findRecords } from '#database'; // データベース操作関数
import { generateAccessToken } from './auth.js'; // JWT生成関数のインポート


/**
 * ユーザーログイン処理
 * - POSTメソッドのみ許可
 * - ユーザー名とパスワードをチェック
 * - 成功時はユーザー情報を返す
 */
export default async function loginHandler(req, res) {
    try {
        // POSTメソッド以外は許可しない
        if (req.method !== 'POST') {
            return res.status(405).json({ message: '許可されていないメソッドです。' });
        }

        // リクエストボディからユーザー名とパスワードを取得
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' });
        }

        // ユーザー名でユーザーレコードを検索（部分一致）
        const userRecords = await findRecords({
            type: 'user',
            content: username // 部分一致検索
        });
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
        if (!userRecordData) {
            return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
        }

        // contentをパースしてオブジェクトに変換
        const parsedContent = JSON.parse(userRecordData.content);
        // パスワードハッシュと入力されたパスワードを比較
        const isPasswordValid = await bcrypt.compare(password, parsedContent.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' });
        }

        // 認証成功時の処理
        const payload = {
            uuid: userRecordData.uuid, // ユーザーUUID
            // username: parsedContent.username, // ユーザー名
            // email: parsedContent.email // メールアドレス
        };

        const token = generateAccessToken(payload); // ペイロードを渡してトークンを生成

        // クッキーにトークンをセット
        res.setHeader('Set-Cookie', cookie.serialize('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 // 1時間
        }));

        res.status(200).json({
            message: 'ログイン成功',
            success: true,
            payload: payload
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}