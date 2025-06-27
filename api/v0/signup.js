import bcrypt from 'bcrypt';
import 'dotenv/config';
import crypto from 'crypto'; // UUID生成用
import { find, insertRecord } from '#database'; // データベース操作関数
import fs from 'fs';
import path from 'path';

// テンプレートJSONを同期的に読み込む
const templatePath = path.join(process.cwd(), 'public', 'template.json');

/**
 * ユーザー登録処理
 * - POSTメソッドのみ許可
 * - ユーザー名とパスワードをチェック
 * - 成功時は新規ユーザー情報を返す
 */

export default async function signupHandler(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'ユーザー名、メールアドレス、パスワードは必須です。' });
    }

    // 既存ユーザーのチェック
    const existingUser = await find({
        type: 'user',
        content: username // 部分一致検索のため、content LIKE でチェック
    });
    if (existingUser && existingUser.length > 0) {
        return res.status(409).json({ message: 'そのユーザー名は既に使用されています。' });
    }

    // ユーザーデータ作成
    const now = new Date().toISOString();
    const uuid = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);

    // テンプレートをディープコピー
    // const userData = JSON.parse(JSON.stringify(template));
    const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    const userData = { ...template };
    userData.uuid = uuid;
    userData.type = 'user';
    userData.content = JSON.stringify({
        username,
        email,
        password_hash: passwordHash
    });
    userData.children = [];
    userData.permissionsRead = ['*'];
    userData.permissionsWrite = [uuid];
    userData.createdBy = uuid;
    userData.updatedBy = uuid;
    userData.createdAt = now;
    userData.updatedAt = now;

    try {
        const newUser = await insertRecord(userData);
        res.status(201).json({ message: 'ユーザー登録が成功しました。', user: { uuid, username, email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}