export async function getCurrencyRate() {
  try {
    const result = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/convertRateConfig`)
    const dataConfig = await result.json()
    const openExchangeRateBaseUrl = dataConfig?.openExchangeRateBaseUrl
    const openExchangeRateApiKey = dataConfig?.openExchangeRateApiKey
    const url = `${openExchangeRateBaseUrl}latest.json?app_id=${openExchangeRateApiKey}&base=USD&symbols=VND`
    const response = await fetch(url)
    const data = await response.json()
    return Math.round(data?.rates?.VND)
  } catch (error) {
    console.error(error)
    return 0
  }
}
