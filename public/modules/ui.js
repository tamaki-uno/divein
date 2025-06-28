import Header from './header.js';
import Popup from './popup.js';
import Line from './line.js';

export function initHeader() {
    new Header();
}

export function initPopup() {
    new Popup();
}

export function initMain(userData) {
    const main = document.querySelector('main');
    if (main && userData && userData.user) {
        const line = new Line(userData.user.uuid);
        main.appendChild(line.render());
    }
}

export { Header, Popup, Line };
