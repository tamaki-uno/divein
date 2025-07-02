import bcrypt from 'bcrypt';
import 'dotenv/config';

import { findRecords } from '#database'; // データベース操作関数
import { respondAuth } from '#api/v0/auth'; // 認証レスポンス生成関数


/**
 * ユーザーログイン処理
 * @param {import('express').Request} req - リクエストオブジェクト
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @returns {Promise<void>}
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

        // 認証成功時のレスポンスを生成
        return respondAuth(res, userRecordData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}

