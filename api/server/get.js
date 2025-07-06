import { join } from 'path';
import 'dotenv/config';

// --- 初期設定 ---
const docsDir = process.env.DOCS_DIR || '../../docs';
console.log(`静的ファイルの配信ディレクトリ: ${docsDir}`);

/**
 * アクセスされたパスのファイルを静的に配信
 * もしファイルが存在しない場合は404.htmlを返す
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export default async function getHandler(req, res) {
    const filePath = join(docsDir, req.path);
    try {
        // 静的ファイルの配信
        res.sendFile(filePath, (err) => {
            if (err) {
                if (err.status === 404) {
                    // ファイルが見つからない場合は404.htmlを返す
                    res.sendFile(join(docsDir, '404.html'), (err) => {
                        if (err) {
                            throw { err: err, message: '404.htmlの配信中にエラーが発生' };
                        }
                    });
                } else {
                    throw { err: err, message: '静的ファイルの配信中にエラーが発生' };
                }
            }
        });
    } catch (error) {
        const logMessage = `${new Date().toISOString()} - ${req.method} ${req.path}`;
        const err = error.err || error;
        const message = error.message || 'サーバーエラーが発生しました。';
        console.error(logMessage, ' - エラー:', err.message || err);
        res.status(err.status || 500).json({ message: message });
    }
}