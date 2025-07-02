/**
 * HTML操作用クラス
 * - HTMLファイルをフェッチしてパース
 */
export default class Html {
    /**
     * @param {string} path - HTMLファイルのパス
     */
    constructor(path) {
        this.HTML_URL = path;
        this.doc = null;
        this.node = null;
    }

    /**
     * HTMLをフェッチしてパース
     * @throws {Error}
     * @async
     */
    async fetchHtml() {
        const response = await fetch(this.HTML_URL);
        if (!response.ok) throw new Error(`Failed to fetch HTML: ${response.statusText}`);
        this.doc = await response.text();
        this.node = new DOMParser().parseFromString(this.doc, 'text/html');
    }

    /**
     * HTMLテキストを取得
     * @returns {Promise<string>}
     * @async
     */
    async getHtml() {
        if (!this.doc) await this.fetchHtml();
        return this.doc;
    }

    /**
     * パース済みHTMLドキュメントを取得
     * @returns {Promise<Document>}
     * @async
     */
    async getNode() {
        if (!this.node) await this.fetchHtml();
        return this.node;
    }
}