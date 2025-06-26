import bcrypt from 'bcrypt';
import 'dotenv/config';
import { findUserByUsername } from '../../database'; // ユーザー検索関数
import { generateAccessToken } from '../../auth'; // JWT生成関数



// import { select, run } from "../../database";


/** * ユーザーログイン処理
 * - POSTメソッドのみ許可
 * - ユーザー名とパスワードをチェック
 * - 成功時はユーザー情報を返す
 */

export default async function loginHandler(req, res) {
    try {
        const { username, password } = req.body; // リクエストボディからユーザー名とパスワードを取得
        if (!username || !password) {
            return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' }); // ユーザー名またはパスワードが空の場合
        }

        // ユーザーを検索
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' }); // ユーザーが存在しない場合
        }

        // パスワードを比較
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' }); // パスワードが一致しない場合
        }

        // JWTを生成して返す
        const token = generateAccessToken(user); // ユーザー情報を元にアクセストークンを生成
        res.json({ accessToken: token }); // アクセストークンをレスポンスとして返す

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}