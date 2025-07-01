import { join } from 'path';
import fs from 'fs';
import syncHandler from './sync.js';

/**
 * アセット（ファイル）を同期するAPIハンドラ
 * @param {import('express').Request} req - リクエストオブジェクト
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @returns {Promise<void>}
 */
export async function assetHandler(req, res) {
    try {
        const record = await syncHandler(req, res);
        const uploadedFile = req.file; // アップロードされたファイル
        const assetPath = join(process.cwd(), 'assets', record.createdBy, record.uuid);

        // ディレクトリがなければ作成
        if (!fs.existsSync(assetPath)) {
            fs.mkdirSync(assetPath, { recursive: true });
        }

        // ファイル削除
        if (uploadedFile && req.body.delete) {
            const filePath = join(assetPath, uploadedFile.originalname);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        // ファイル追加・更新
        else if (uploadedFile) {
            const filePath = join(assetPath, uploadedFile.originalname);
            fs.writeFileSync(filePath, uploadedFile.buffer);
        }

        // 既存ファイル一覧取得
        let files = [];
        if (fs.existsSync(assetPath)) {
            files = fs.readdirSync(assetPath).map(file => ({
                name: file,
                size: fs.statSync(join(assetPath, file)).size
            }));
        }

        res.status(200).json({
            message: 'Assets synced successfully',
            record: record,
            files: files
        });
    } catch (err) {
        res.status(500).json({ message: 'Asset handler error', error: err.message });
    }
}