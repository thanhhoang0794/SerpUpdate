import { NextResponse } from 'next/server'
import axios from 'axios'
import { StatusCodes } from 'http-status-codes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400
      }
    })


    if (response.request?.res?.responseUrl) {
      return NextResponse.json({
        redirectUrl: response.request.res.responseUrl
      })
    }

    if (response.headers?.location) {
      return NextResponse.json({
        redirectUrl: response.headers.location
      })
    }

    return new NextResponse(response.data, {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  } catch (error: any) {
    console.error('Payment API Error:', error)

    if (error.response) {
      console.log('Error response:', error.response)
      console.log('Error headers:', error.response.headers)
    }

    if (error.response?.headers?.location) {
      return NextResponse.json({
        redirectUrl: error.response.headers.location
      })
    }

    return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
