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
        super.initHtml(); // 親クラスのHTML初期化を呼び出す
        this.html.classList.add('level-' + this.level); // レベルに応じたクラスを追加
    }
    addChild(event) {
        console.log('[line] Adding child to Line module'); // 子要素追加ログ
        event.preventDefault(); // デフォルトの動作を防ぐ
        // 子要素のUUIDを生成
        const childUuid = crypto.randomUUID(); // 子要素のUUIDを生成
        this.child.push(
            new Record(
                childUuid,
                this.html.querySelector('.children-container'),
                this.level + 1 // 子要素のレベルを親のレベル+1に設定
            ) // 子要素を追加
        )
        this.open(); // レコードを開く
    }
}