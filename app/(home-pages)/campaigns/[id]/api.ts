export async function fetchCampaignDetail (id: string) {
  const origin = window?.location?.origin
  const response = await fetch(`${origin}/api/campaignDetail?id=${id}`)
  if (response.status === 403) {
    const errorData = await response.json()
    throw {
      response: {
        status: 403,
        data: {
          error: errorData.error
        }
      }
    }
  }
  if (!response.ok) {
    const errorData = await response.json()
    throw {
      response: {
        status: response.status,
        data: {
          error: errorData.error
        }
      }
    }
  }
  return response.json()
}

export async function fetchKeywordRanking(id: number, date: string) {
  const origin = window?.location?.origin
  const response = await fetch(`${origin}/api/check-keyword-ranking?id=${id}&date=${date}`)
  if (!response.ok) {
    const errorData = await response.json()
    throw {
      response: {
        status: response.status,
        data: {
          error: errorData.error
        }
      }
    }
  }
  return response.json()
}


