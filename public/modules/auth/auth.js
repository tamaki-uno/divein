const API_BASE_PATH = '/api/v0';

export async function checkAuth() {
    const response = await fetch(`${API_BASE_PATH}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });
    if (!response.ok) return null;
    return await response.json();
}
