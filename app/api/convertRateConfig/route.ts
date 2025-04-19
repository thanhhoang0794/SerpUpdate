import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    openExchangeRateApiKey: process.env.OPEN_EXCHANGE_RATE_API_KEY,
    openExchangeRateBaseUrl: process.env.OPEN_EXCHANGE_RATE_BASE_URL
   })
}
