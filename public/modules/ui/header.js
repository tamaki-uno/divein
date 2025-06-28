// ユーザー情報付きヘッダー表示クラス
// - ユーザー情報に応じてヘッダーのリンクやアイコンを切り替える
// - 既存ヘッダーがあれば再利用し、なければHTMLを挿入
export default class Header {
    constructor() {
        this.user = null; // 現在のユーザー情報
        this.header = null; // ヘッダーDOM要素
        console.log('[Header] constructor called');
        // 非同期初期化を明示的に呼び出し
        this.init();
    }

    // ヘッダー初期化処理
    // - 既にheader要素が存在すれば再利用
    // - なければHTMLをfetchして挿入
    async init() {
        // すでにheaderが存在する場合は追加しない
        const existingHeader = document.querySelector('header');
        if (existingHeader) {
            this.header = existingHeader;
            console.log('[Header] header already exists, skipping insert');
            this.updateHeader();
            return;
        }
        try {
            // ヘッダーHTMLを取得してbody先頭に挿入
            const res = await fetch('/modules/ui/header.html');
            if (!res.ok) throw new Error('header.html fetch failed');
            const html = await res.text();
            document.body.insertAdjacentHTML('afterbegin', html);
            this.header = document.querySelector('header');
            console.log('[Header] header inserted');
            this.updateHeader();
        } catch (e) {
            console.error('[Header] ヘッダーHTMLの取得に失敗:', e);
        }
    }

    // ヘッダーのユーザー情報表示を更新
    // @param {Object} user - ユーザー情報（省略可）
    updateHeader(user) {
        // user引数があればthis.userを更新
        if (user !== undefined) this.user = user;
        if (!this.header) {
            console.warn('[Header] header要素が未初期化です');
            return;
        }
        // DOM要素取得
        const userLink = this.header.querySelector('.user-link');
        const userIcon = this.header.querySelector('.user-icon');
        if (!userLink || !userIcon) {
            console.warn('[Header] .user-linkまたは.user-iconが見つかりません');
            return;
        }
        // ユーザー情報に応じてリンクとアイコンを切り替え
        if (this.user && this.user.username) {
            // ユーザーがログインしている場合
            userLink.href = "/logout";
            userIcon.src = "/icon/open.svg";
            userIcon.alt = "logout icon";
        } else {
            // ユーザーがログインしていない場合
            userLink.href = "/login";
            userIcon.src = "/icon/closed.svg";
            userIcon.alt = "login icon";
        }
        console.log('[Header] updateHeader called. user:', this.user);
    }
}