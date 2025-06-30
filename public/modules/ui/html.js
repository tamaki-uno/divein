export default class Html {
    /**
     * HTMLモジュールのコンストラクタ
     * @param {string} path - HTMLファイルのパス
     */
    constructor(path) {
        console.log('[html] Initializing HTML module'); // HTMLモジュール初期化ログ
        this.HTML_URL = path; // HTMLファイルのパスを設定
    }
    /**
     * HTMLをフェッチしてドキュメントを初期化
     * - フェッチしたHTMLをthis.docに保存
     * @returns {Promise<string>} - フェッチしたHTMLドキュメント
     * @async
     */
    async fetchHtml() {
        console.log(`[html] Fetching HTML from ${this.HTML_URL}`); // HTMLフェッチログ
        const response = await fetch(this.HTML_URL); // HTMLをフェッチ
        if (!response.ok) {
            throw new Error(`Failed to fetch HTML: ${response.statusText}`); // フェッチ失敗時のエラーログ
        }
        this.doc = await response.text(); // レスポンスをテキストとして取得
        const parser = new DOMParser(); // DOMParserを使用してHTMLをパース
        this.node = parser.parseFromString(this.doc, 'text/html'); // パースしたHTMLをthis.nodeに保存
        console.log('[html] HTML fetched successfully'); // HTMLフェッチ成功ログ
        return this.node; // パースしたHTMLドキュメントを返す
    }
    /**
     * HTMLを初期化して返す
     * - HTMLが未取得の場合はfetchHtmlを呼び出す
     * @return {Promise<string>} - フェッチしたHTMLドキュメント
     * @async
     */
    async getHtml() {
        console.log('[html] Getting HTML'); // HTML取得ログ
        if (!this.doc) await this.fetchHtml(); // HTMLが未取得の場合はfetchHtmlを呼び出す
        return this.doc; // フェッチしたHTMLドキュメントを返す
    }
    /**
     * HTMLを初期化して返す
     * - HTMLが未取得の場合はfetchHtmlを呼び出す
     * @return {Promise<Document>} - パースしたHTMLドキュメント
     * @async
     */
    async getNode() {
        console.log('[html] Getting HTML'); // HTML取得ログ
        if (!this.node) await this.fetchHtml(); // HTMLが未取得の場合はfetchHtmlを呼び出す
        return this.node; // パースしたHTMLドキュメントを返す
    }
}