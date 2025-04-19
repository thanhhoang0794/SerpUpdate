'use client' // Add this directive to make it a Client Component
import { Provider } from '@/components/ui/provider'
import '../styles/globals.css'
import React, { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import Head from 'next/head'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false
          }
        }
      })
  )

  return (
    <html lang="en">
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta name="theme-color" content="#fff" />
      </Head>
      <body>
        <SpeedInsights />
        <Analytics />
        <QueryClientProvider client={queryClient}>
          <Provider>
            <Suspense>{children}</Suspense>
          </Provider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  )
}
