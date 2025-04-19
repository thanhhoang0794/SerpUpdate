export interface Keyword {
  id: string
  keyword: string
  position: number
  history: History[],
  device: string
  url: string
  country_code: string
  language: string
  search_engine: string
}
