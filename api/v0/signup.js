import bcrypt from 'bcrypt';
import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { findRecords, insertRecord } from '#database';
import { respondAuth } from '../auth.js';

/**
 * ユーザー登録処理
 * @async
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

    // ユーザーデータ作成
    const now = new Date().toISOString();
    const uuid = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    if (!passwordHash) {
        return res.status(500).json({ message: 'パスワードのハッシュ化に失敗しました。' });
    }
    const userData = {
        uuid,
        type: 'user',
        content: JSON.stringify({
            username,
            email,
            password_hash: passwordHash
        }),
        children: [],
        permissionsRead: ['*'],
        permissionsWrite: [uuid],
        createdBy: uuid,
        updatedBy: uuid,
        createdAt: now,
        updatedAt: now
    };

    try {
        const newUser = await insertRecord(userData);
        if (newUser) {
            return respondAuth(res, newUser);
        } else {
            return res.status(500).json({ message: 'ユーザー登録に失敗しました。' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    }
}