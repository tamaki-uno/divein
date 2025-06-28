import { join } from 'path';
import fs from 'fs';
import syncHandler from './sync.js';

export async function assetHandler(req, res) {
    const record = await syncHandler(req, res);
    const file = req.file; // アップロードされたファイル
    const assetPath = join(process.cwd(), 'assets', record.createdBy, record.uuid);
    if (!fs.existsSync(assetPath)) {
        // アセットディレクトリが存在しない場合は作成
        fs.mkdirSync(assetPath, { recursive: true });
        if (file) {
            // ファイルを保存
            const filePath = join(assetPath, file.originalname);
            fs.writeFileSync(filePath, file.buffer);
        }
    } else if (file) {
        // アセットディレクトリが存在し、ファイルがアップロードされた場合
        if (req.body.delete) {
            // ファイルを削除
            const filePath = join(assetPath, file.originalname);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } else {
            // ファイルを更新
            const filePath = join(assetPath, file.originalname);
            fs.writeFileSync(filePath, file.buffer);
        }
    } else {
        // アセットディレクトリが存在し、ファイルがアップロードされていない場合
        // 既存のファイルを取得
        file = fs.readdirSync(assetPath).map(file => ({
            name: file,
            size: fs.statSync(join(assetPath, file)).size
        }));
    }
    res.status(200).json({
        message: 'Assets synced successfully',
        record: record,
        files: file
    });
}