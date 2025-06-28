/**
 * 認証関連APIとの通信を行うモジュール
 * API_BASE_PATH: 認証APIのベースパス
 * checkAuth: 現在のユーザーの認証状態を確認する関数
 */
const API_BASE_PATH = '/api/v0';

/**
 * 現在のユーザーが認証されているかどうかをAPI経由で確認する
 * @returns {Promise<Object|null>} 認証済みならユーザー情報オブジェクト、未認証ならnull
 */
export async function checkAuth() {
    // 認証状態を確認するためのAPIリクエストを送信
    const response = await fetch(`${API_BASE_PATH}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!response.ok) return null;
    // 認証済みの場合はユーザー情報を返す
    return await response.json();
}
