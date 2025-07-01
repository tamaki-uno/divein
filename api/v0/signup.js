import bcrypt from 'bcrypt';
import 'dotenv/config';
import crypto from 'crypto';
import { findRecords, insertRecord } from '#database';
import fs from 'fs';
import path from 'path';

// テンプレートJSONを同期的に読み込む
const recordTemplatePath = path.join(process.cwd(), 'public', 'record.json');

/**
 * ユーザー登録処理
 * @param {import('express').Request} req - リクエストオブジェクト
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @returns {Promise<void>}
 */
export default async function signupHandler(req, res) {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'ユーザー名、メールアドレス、パスワードは必須です。' });
    }

    // 既存ユーザーのチェック
    const users = await findRecords({
        type: 'user',
        content: username
    });
    const exists = users.some(u => {
        try {
            const content = JSON.parse(u.content);
            return content.username === username || content.email === email;
        } catch {
            return false;
        }
    });
    if (exists) {
        return res.status(409).json({ message: 'そのユーザー名またはメールアドレスは既に使用されています。' });
    }

    // テンプレートファイル存在チェック
    if (!fs.existsSync(recordTemplatePath)) {
        return res.status(500).json({ message: 'テンプレートファイルが見つかりません。' });
    }

    // ユーザーデータ作成
    const now = new Date().toISOString();
    const uuid = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    if (!passwordHash) {
        return res.status(500).json({ message: 'パスワードのハッシュ化に失敗しました。' });
    }
    const template = JSON.parse(fs.readFileSync(recordTemplatePath, 'utf8'));
    const userData = { ...template };
    userData.uuid = uuid;
    userData.type = 'user';
    userData.content = JSON.stringify({
        username: username,
        email: email,
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
        res.status(201).json({ message: 'ユーザー登録が成功しました。', user: newUser, success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}