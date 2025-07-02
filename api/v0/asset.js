import { join } from 'path';
import fs from 'fs';
import syncHandler from './sync.js';

/**
 * アセット（ファイル）を同期するAPIハンドラ
 * @async
 * @param {import('express').Request} req - リクエストオブジェクト
 * @param {import('express').Response} res - レスポンスオブジェクト
 * @returns {Promise<void>}
 */
export async function assetHandler(req, res) {
    try {
        // レコード同期
        let syncedRecord;
        // syncHandlerがresを返す場合は終了するため、ここで同期レコードのみ取得
        const resJson = res.json;
        let recordResult;
        res.json = (data) => { recordResult = data; return data; };
        await syncHandler(req, res);
        res.json = resJson;
        if (!recordResult || !recordResult.record) {
            // syncHandlerがエラー応答を返した場合
            return;
        }
        syncedRecord = recordResult.record;

        const uploadedFile = req.file;
        const assetPath = join(process.cwd(), 'assets', syncedRecord.createdBy, syncedRecord.uuid);

        // ディレクトリ作成
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
            record: syncedRecord,
            files: files
        });
    } catch (err) {
        res.status(500).json({ message: 'Asset handler error', error: err.message });
    }
}