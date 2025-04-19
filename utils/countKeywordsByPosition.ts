import { Domain } from "@/app/types/domains"

export const countKeywordsByPosition = (domain: Domain) => {
    const counts = {
      top1: 0,
      top3: 0,
      top5: 0,
      top10: 0,
      top30: 0,
      top100: 0,
      total: 0
    }

    if (!domain?.keywords) return counts
    domain.keywords.forEach((keyword: any) => {
      counts.total++
      const history = keyword.history || {}
      const latestDate = Object.keys(history).sort().pop()
      if (!latestDate) return
      const position = history[latestDate as string]
      if (position === 1) {
      counts.top1++
    } else if (position > 1 && position <= 3) {
      counts.top3++
    } else if (position > 3 && position <= 5) {
      counts.top5++
    } else if (position > 5 && position <= 10) {
      counts.top10++
    } else if (position > 10 && position <= 30) {
      counts.top30++
    } else if (position > 30 && position <= 100 || position === 0) {
      counts.top100++
    }
    })
    return counts
  }