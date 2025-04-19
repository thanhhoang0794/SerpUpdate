var cron = require('node-cron')
const fetch = require('node-fetch')
const headers = require("next/headers")

cron.schedule('* * * * *', async () => {
  console.log(`Pinging API every hour in ${new Date().toISOString()}`)

  const origin = (await headers()).get('origin')
  try {
    const response = await fetch(`${origin}/api/check-update-campaign`, {
      method: 'GET'
    })

    if (!response.ok) {
      console.error('Failed to ping API:', response.statusText)
    } else {
      const data = await response.json()
      console.log('API response:', data.message)
    }
  } catch (error) {
    console.error('Error pinging API:', error)
  }
})

