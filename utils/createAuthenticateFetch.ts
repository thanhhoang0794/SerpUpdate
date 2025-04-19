export function createAuthenticatedFetch(username: string, password: string) {
    return (url: RequestInfo, init?: RequestInit): Promise<Response> => {
      const token = btoa(`${username}:${password}`);
      const authHeader = { 'Authorization': `Basic ${token}` };

      const newInit: RequestInit = {
        ...init,
        headers: {
          ...init?.headers,
          ...authHeader
        }
      };

      return fetch(url, newInit);
    };
}