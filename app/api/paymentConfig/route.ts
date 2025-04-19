import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    merchantId: process.env.ONEPAY_MERCHANT_PAYNOW_ID,
    merchantAccessCode: process.env.ONEPAY_MERCHANT_PAYNOW_ACCESS_CODE,
    merchantHashCode: process.env.ONEPAY_MERCHANT_PAYNOW_HASH_CODE
  })
}
