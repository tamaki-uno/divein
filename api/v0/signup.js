import bcrypt from 'bcrypt';
import 'dotenv/config';
import { createUser, findUserByUsername } from '../../database.js'; // ユーザー作成と検索関数
/**
 * ユーザー登録処理
 * - POSTメソッドのみ許可
 * - ユーザー名とパスワードをチェック
 * - 成功時は新規ユーザー情報を返す
 */

export default async function signupHandler(req, res) {
    try {
        const { username, password } = req.body; // リクエストボディからユーザー名とパスワードを取得
        // ユーザー名とパスワードの存在チェック
        if (!username || !password) {
            return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' }); // ユーザー名またはパスワードが空の場合
        }

        // ユーザーが既に存在するかチェック
        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: 'そのユーザー名は既に使用されています。' }); // ユーザー名が既に存在する場合
        }

        // パスワードをハッシュ化
        const passwordHash = await bcrypt.hash(password, 10);

        // ユーザーをDBに保存
        const newUser = await createUser(username, passwordHash);
        res.status(201).json({ message: 'ユーザー登録が成功しました。', user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}