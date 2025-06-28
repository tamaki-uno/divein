import { checkAuth } from './auth.js';
import { initHeader, initPopup, initMain } from './ui.js';

export function route(path) {
    initHeader();
    if (['/login', '/signup', '/logout'].includes(path)) {
        initPopup();
        return;
    }
    checkAuth()
        .then(userData => {
            if (userData && userData.success && userData.loggedIn) {
                initMain(userData);
            } else {
                window.location.href = '/login';
            }
        })
        .catch(() => {
            window.location.href = '/login';
        });
}
