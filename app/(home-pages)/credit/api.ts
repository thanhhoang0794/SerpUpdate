export async function fetchUserCredit(): Promise<any> {
    const origin = window?.location?.origin;
    try {
        const response = await fetch(`${origin}/api/credits`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json()
    } catch (error) {
        console.error('Failed to fetch credit history:', error);
        throw error;
    }
}

export async function fetchPrice(): Promise<any> {
    const origin = window?.location?.origin;
    try {
        const response = await fetch(`${origin}/api/prices`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json()
    } catch (error) {
        console.error('Failed to fetch price:', error);
        throw error;
    }
}
