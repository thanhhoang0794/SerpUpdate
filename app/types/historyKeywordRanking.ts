export interface HistoryKeywordRanking {
  rank: number,
  domain: string,
  title: string,
  description?: string,
  url: string,
  type: string,
  breadcrumb?: string,
  highlight?: boolean
}
