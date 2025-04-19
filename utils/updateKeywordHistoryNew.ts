import { toJSON } from 'flatted'
import { cloneDeep } from 'lodash'

export async function updateKeywordsInDatabase(
  supabase: any,
  resultData: any,
  searchResults: any,
  domainNames: any[],
  keywordData: any,
  newDate: string
) {
  const { keyword, device } = keywordData
  for (const keywordRanking of resultData.tasks[0].result[0].items) {
    let allMatched = true
    for (const domainName of domainNames) {
      if (!domainName.matched && keywordRanking.domain.includes(domainName.name)) {
        domainName.matched = true
        const { data: historyResponse, error: historyError } = await supabase
          .from('keywords')
          .select('*')
          .eq('domain_id', domainName.id)
          .eq('keyword', keyword)
          .eq('is_active', true)
          .eq('device', device)
          .single()

        if (historyError) {
          console.error('Error fetching keyword history:', historyError)
          continue
        }

        const position = keywordRanking.rank_absolute
        const url = keywordRanking.url
        const updatedHistory = { ...(historyResponse?.history || {}), [`${newDate}`]: position }

        const { error: updateKeywordError } = await supabase
          .from('keywords')
          .update({
            history: updatedHistory,
            updated_at: newDate,
            position: position,
            url: url,
            updating: false
          })
          .eq('domain_id', domainName.id)
          .eq('keyword', keyword)
          .eq('is_active', true)
          .eq('device', device)

        if (updateKeywordError) {
          console.error('Error updating keyword:', updateKeywordError)
        }
        const searchResultsClone = cloneDeep(searchResults)
        const matchingItem = searchResultsClone.find((item: any) => item.rank === position)
        if (matchingItem) {
          matchingItem.highlight = true
        }

        const { data: keywordRankingData, error: keywordRankingError } = await supabase.from('keywordRankings').upsert(
          {
            keyword_data: toJSON(searchResultsClone),
            crawl_date: newDate,
            domain_id: domainName.id,
            keyword_id: historyResponse.id
          },
          {
            onConflict: 'keyword_id, crawl_date',
            ignoreDuplicates: true
          }
        )

        if (keywordRankingError) {
          console.error('Error inserting keyword ranking:', keywordRankingError)
        }
      }
      if (!domainName.matched) {
        allMatched = false
      }
    }
    if (allMatched) {
      break
    }
  }
  for (const domainName of domainNames) {
    if (!domainName.matched) {
      const { data: historyResponse, error: historyError } = await supabase
        .from('keywords')
        .select('*')
        .eq('domain_id', domainName.id)
        .eq('keyword', keyword)
        .eq('device', device)
        .eq('is_active', true)
        .single()

      if (historyError) {
        console.error('Error fetching keyword history:', historyError)
        continue
      }

      const { error: updateKeywordError } = await supabase
        .from('keywords')
        .update({
          history: { ...historyResponse?.history, [`${newDate}`]: 0 },
          updated_at: newDate,
          position: 0,
          url: '-',
          updating: false
        })
        .eq('domain_id', domainName.id)
        .eq('keyword', keyword)
        .eq('device', device)
        .eq('is_active', true)

      if (updateKeywordError) {
        console.error('Error updating keyword for non-matching domain:', updateKeywordError)
      }
      const { data: keywordRankingData, error: keywordRankingError } = await supabase.from('keywordRankings').upsert(
        {
          keyword_data: toJSON(searchResults),
          crawl_date: newDate,
          domain_id: domainName.id,
          keyword_id: historyResponse.id
        },
        {
          onConflict: 'keyword_id, crawl_date',
          ignoreDuplicates: true
        }
      )
      if (keywordRankingError) {
        console.error('Error inserting keyword ranking:', keywordRankingError)
      }
    }
  }
  return
}
