export default class Header {
    constructor() {
        this.user = null; // ユーザー情報を格納する変数
        this.header = null; // ヘッダー要素を格納する変数
        console.log('[Header] constructor called');
        this.init();
    }
    async init() {
        // すでにheaderが存在する場合は追加しない
        if (document.querySelector('header')) {
            this.header = document.querySelector('header');
            console.log('[Header] header already exists, skipping insert');
            this.updateHeader();
            return;
        }
        const res = await fetch('/modules/header.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('afterbegin', html);
        this.header = document.querySelector('header');
        console.log('[Header] header inserted');
        this.updateHeader();
    }
    updateHeader(user) {
        // user引数があればthis.userを更新
        if (user !== undefined) this.user = user;
        const userLink = this.header.querySelector('.user-link');
        const userIcon = this.header.querySelector('.user-icon');
        if (this.user && this.user.username) {
            userLink.href = "/logout";
            userIcon.src = "/icon/open.svg";
            userIcon.alt = "logout icon";
        } else {
            userLink.href = "/login";
            userIcon.src = "/icon/closed.svg";
            userIcon.alt = "login icon";
        }
        console.log('[Header] updateHeader called. user:', this.user);
    }
}