export const buildDefaultHeaders = (headers: Record<string, string>) => {
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
    };
}
