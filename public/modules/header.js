export default class Header {
    constructor() {
        // this.user = user;
        // this.header = null;
        this.user = null; // ユーザー情報を格納する変数
        this.header = null; // ヘッダー要素を格納する変数
        this.init();
        // ユーザー情報の更新を監視する
    }
    async init() {
        const res = await fetch('/modules/header.html');
        const html = await res.text();
        document.body.insertAdjacentHTML('afterbegin', html);
        this.header = document.querySelector('header');
        this.updateHeader();
    }
    updateHeader() {
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
    }
}