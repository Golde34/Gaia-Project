export function checkLocalStorage(interval) {
    const lastAccessTime = localStorage.getItem('lastAccessTime');

    if (lastAccessTime && (new Date() - new Date(lastAccessTime)) > 24 * 60 * 60 * 1000) {
        setInterval(() => {
            localStorage.clear();
        }, interval);
    } else {
        localStorage.setItem('lastAccessTime', new Date());
    }
}

// export function useLocalStorageRemoval(removalMethod, timeout) {
//     useEffect(() => {
//         switch (removalMethod) {
//             case 'interval':
//                 const interval = setInterval(() => {
//                     checkLocalStorage();
//                 }, timeout);
//                 return () => clearInterval(interval);
//             case 'timeout':
//                 const timeout = setTimeout(() => {
//                     checkLocalStorage();
//                 }, timeout);
//                 return () => clearTimeout(timeout);
//             default:
//                 return;
//         }
//     })
// }

export function getTabId() {
    let tabId = sessionStorage.getItem('tabId');
    if (!tabId) {
        tabId = crypto.randomUUID();
        sessionStorage.setItem('tabId', tabId);
    }
    return tabId;
}