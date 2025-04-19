import { createClient } from 'redis'

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })

    redisClient.on('error', err => console.error('Redis Client Error', err))
    await redisClient.connect()
  }

  return redisClient
}

export async function setCache(key: string, value: any, ttlSeconds = 3600) {
  const client = await getRedisClient()
  await client.set(key, JSON.stringify(value), { EX: ttlSeconds })
}

export async function getCache<T>(key: string): Promise<T | null> {
  const client = await getRedisClient()
  const value = await client.get(key)
  return value ? (JSON.parse(value) as T) : null
}

export async function deleteCache(key: string) {
  const client = await getRedisClient()
  await client.del(key)
}

export async function setCampaignTaskState(campaignId: string, taskData: any) {
  return setCache(`campaign:${campaignId}:tasks`, taskData, 86400) // 24 hour TTL
}

export async function getCampaignTaskState(campaignId: string): Promise<string | null> {
  return getCache<string>(`campaign:${campaignId}:tasks`)
}

export async function setTaskTrackingBatch(campaignId: string, taskIds: string[]) {
  const client = await getRedisClient()
  const key = `taskTrackingCampaign:${campaignId}`
  return client.set(key, JSON.stringify(taskIds), { EX: 86400 }) // 24 hour TTL
}

export async function getTaskTrackingBatch(campaignId: string): Promise<string[]> {
  const client = await getRedisClient()
  const key = `taskTrackingCampaign:${campaignId}`
  const result = await client.get(key)
  return result ? JSON.parse(result) : []
}
