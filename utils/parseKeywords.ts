import Keyword from '../database/models/keyword'

/**
 * Parses the SQL Keyword Model object to frontend cosumable object.
 * @param {Keyword[]} allKeywords - Keywords to scrape
 * @returns {KeywordType[]}
 */
const parseKeywords = (allKeywords: Keyword[]): KeywordType[] => {
  const parsedItems = allKeywords.map((keyword: Keyword) => ({
    ...keyword,
    history: keyword.history as unknown as KeywordHistory,
    tags: keyword.tags,
    lastUpdateError:
      typeof keyword.last_update_error === 'string' &&
      keyword.last_update_error !== 'false' &&
      (keyword.last_update_error as string).includes('{')
        ? JSON.parse(keyword.last_update_error as string)
        : false,
    domain: keyword.domain_id,
    lastResult: keyword.last_result as unknown as KeywordLastResult[]
  }))
  return parsedItems as unknown as KeywordType[]
}

export default parseKeywords
