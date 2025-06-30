import Record from '../record.js';

export default class Line extends Record {
    constructor(uuid, parentNode, level) {
        console.log('[line] Initializing Line module'); // Lineモジュール初期化ログ
        super(uuid, parentNode);
        this.HTML_URL = '/modules/ui/html/line.html'; // Line HTMLのURL
        this.level = level; // レベルを設定
    }
    initHtml() {
        console.log('[line] Initializing HTML for Line module'); // LineモジュールのHTML初期化ログ
        super.initHtml()
            .then(html => {
                this.recordContainer.classList.add('line'); // レコードコンテナにlineクラスを追加
            })
            .catch(error => {
                console.error('[line] Error initializing HTML:', error); // HTML初期化エラーログ
            });
        return this.recordContainer; // レコードコンテナを返す
    }
    addChild(event) {
        console.log('[line] Adding child to Line module'); // 子要素追加ログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        // 子要素のUUIDを生成
        const childUuid = crypto.randomUUID(); // 子要素のUUIDを生成
        this.child.push(
            new Record(
                childUuid,
                this.querySelector('.children-container'),
                this.level + 1 // 子要素のレベルを親のレベル+1に設定
            ) // 子要素を追加
        )
        this.open(); // レコードを開く
    }
}