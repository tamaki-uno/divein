/**
 */


// --- APIハンドラの読み込み ---
import assetHandler from './post/v0/asset.js';
import loginHandler from './post/v0/login.js';
import logoutHandler from './post/v0/logout.js';
import signupHandler from './post/v0/signup.js';
import syncHandler from './post/v0/sync.js';

import { checkAuth } from './auth.js';


export default async function postHandler(req, res) {
    const user = await checkAuth(req, res);
    switch (req.path) {
        case 'api/v0/signup':
            return signupHandler(req, res);
        case 'api/v0/login':
            return loginHandler(req, res);
        case 'api/v0/logout':
            return logoutHandler(req, res, user);
        case 'api/v0/sync':
            return syncHandler(req, res, user);
        case 'api/v0/asset':
            return assetHandler(req, res, user);
        default:
            res.status(404).json({ message: 'APIエンドポイントが見つかりません。' });
            break;
    }
}