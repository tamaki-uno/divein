import bcrypt from 'bcrypt';
import 'dotenv/config';
import cookie from 'cookie'; // クッキー操作用ライブラリ

// import { findUserByUsername } from '../../database.js'; // ユーザー検索関数
// import { generateAccessToken } from './auth.js'; // JWT生成関数
import find from '#database'; // データベース操作関数
import { generateAccessToken } from './auth';
import { parse } from 'dotenv';



// import { select, run } from "../../database";


/** * ユーザーログイン処理
 * - POSTメソッドのみ許可
 * - ユーザー名とパスワードをチェック
 * - 成功時はユーザー情報を返す
 */

export default async function loginHandler(req, res) {
    const { username, password } = req.body; // リクエストボディからユーザー名とパスワードを取得
    if (!username || !password) {
        return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' }); // ユーザー名またはパスワードが空の場合
    }
    // ユーザーを検索
    const users = await find({
        type: 'user',
        content: username // 部分一致検索のため、content LIKE でチェック
    });
    const user = users.find(u => JSON.parse(u.content).username === username); // ユーザー名でフィルタリング
    if (!user) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' }); // ユーザーが存在しない場合
    }
    // パスワードを比較
    const isPasswordValid = await bcrypt.compare(password, user.content.password_hash); // パスワードハッシュと比較
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' }); // パスワードが一致しない場合
    }
    // JWTを生成して返す
    const token = generateAccessToken(user); // ユーザー情報を元にアクセストークンを生成
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true, // JavaScriptからアクセスできないようにする
        secure: process.env.NODE_ENV === 'development' ? false : true, // 本番環境ではSecure属性を有効にする
        sameSite: 'Strict', // CSRF対策
        maxAge: 60 * 60 * 1 // 1時間の有効期限
    }));
    res.status(200).json({ message: 'ログイン成功', user: { uuid: user.uuid, username: JSON.parse(user.content).username } }); // ユーザー情報をレスポンスとして返す
}


    // try {
    //     const { username, password } = req.body; // リクエストボディからユーザー名とパスワードを取得
    //     if (!username || !password) {
    //         return res.status(400).json({ message: 'ユーザー名とパスワードは必須です。' }); // ユーザー名またはパスワードが空の場合
    //     }

    //     // ユーザーを検索
    //     const user = await findUserByUsername(username);
    //     if (!user) {
    //         return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' }); // ユーザーが存在しない場合
    //     }

    //     // パスワードを比較
    //     const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    //     if (!isPasswordValid) {
    //         return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません。' }); // パスワードが一致しない場合
    //     }

    //     // JWTを生成して返す
    //     // const token = generateAccessToken(user); // ユーザー情報を元にアクセストークンを生成
    //     // res.json({ accessToken: token }); // アクセストークンをレスポンスとして返す
    //     res.setHeader('Set-Cookie', cookie.serialize('token', generateAccessToken(user), {
    //         httpOnly: true, // JavaScriptからアクセスできないようにする
    //         secure: process.env.NODE_ENV === 'development' ? false : true, // 本番環境ではSecure属性を有効にする
    //         sameSite: 'Strict', // CSRF対策
    //         maxAge: 60 * 60 // 1時間の有効期限
    //     }));

    // } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ message: 'サーバーエラーが発生しました。' });
    // }
}