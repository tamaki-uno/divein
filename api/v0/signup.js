import bcrypt from 'bcrypt';
import 'dotenv/config';
import crypto from 'crypto'; // UUID生成用
import { find, insertRecord } from '#database'; // データベース操作関数
import template from '#template' assert { type: 'json' }; // ユーザーテンプレートデータのインポート

/**
 * ユーザー登録処理
 * - POSTメソッドのみ許可
 * - ユーザー名とパスワードをチェック
 * - 成功時は新規ユーザー情報を返す
 */

export default async function signupHandler(req, res) {
    const { username, email, password } = req.body; // リクエストボディからユーザー名、メールアドレス、パスワードを取得
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'ユーザー名、メールアドレス、パスワードは必須です。' }); // ユーザー名、メールアドレス、またはパスワードが空の場合
    }

    const userData = template; // テンプレートデータを使用
    userData.uuid = crypto.randomUUID(); // ユニークなUUIDを生成
    userData.type = 'user'; // ユーザータイプを設定
    userData.content = `username:${username}, email:${email}, password_hash:${await bcrypt.hash(password, 10)}`; // ユーザー名、メールアドレス、ハッシュ化されたパスワードを設定
    userData.children = [null]; // 子要素を初期化
    userData.permissionRead = ['*']; // 読み取り権限を設定
    userData.permissionWrite = [userData.uuid]; // 書き込み権限を設定 このユーザー自身のみが書き込み可能
    userData.createdBy = userData.uuid; // 作成者を設定
    userData.updatedBy = userData.uuid; // 更新者を設定
    userData.createdAt = new Date().toISOString(); // 作成日時を設定
    userData.updatedAt = new Date().toISOString(); // 更新日時を設定


    // ユーザーが既に存在するかチェック
    const query = {
        type: 'user', // ユーザータイプで検索
        content: `username:${username}`, // ユーザー名で検索
    }
    const existingUser = await find(query); // ユーザーを検索
    if (existingUser.length > 0) return res.status(409).json({ message: 'そのユーザー名は既に使用されています。' }); // ユーザー名が既に存在する場合

    // ユーザーをDBに保存
    try {
        const newUser = await insertRecord(userData);
        res.status(201).json({ message: 'ユーザー登録が成功しました。', user: newUser }); // 成功時は新規ユーザー情報を返す
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' }); // サーバーエラーの場合
    }
}