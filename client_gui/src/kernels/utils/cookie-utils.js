import { Cookies } from "react-cookie";

class CookieManager {
    constructor() {
        this.cookie = new Cookies();
    }

    saveCookie(key, value, usedPath, options) {
        this.cookie.set(key, value, { 
            path: usedPath, 
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            ...options });
    }

    getCookie(key) {
        return this.cookie.get(key);
    }

    deleteCookie(key, usePath, options) {
        this.cookie.remove(key, { path: usePath, 
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            ...options });
    }
}

export default CookieManager;

export const isAccessTokenCookieValid = () => {
    return new Cookies().get('accessToken') === undefined;
}
