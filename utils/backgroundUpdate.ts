export default async function backgroundUpdateKeywordsRanking(campaignId: string) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/update-keyword-new-version`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ campaignId }),
        })

        if (!response.ok) {
            throw new Error(`Failed to update keywords ranking: ${response.statusText}`)
        }

        const data = await response.json()
        console.log('Keywords ranking update response:', data)
        
        return data
    } catch (error) {
        console.error('Error updating keywords ranking:', error)
        throw error 
    }
}
