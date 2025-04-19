import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { overwrite, getName } from 'country-list'
import { NextRequest } from 'next/server'
import pLimit from 'p-limit'
import { StatusCodes } from 'http-status-codes'
import {extractSearchResults} from '@/utils/extractCrawlResult'
import { updateKeywordsInDatabase } from '@/utils/updateKeywordHistory'
overwrite([
    { code: 'VN', name: 'Vietnam' },
    { code: 'US', name: 'United States' }
])

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { campaignId } = await request.json()

    if (!campaignId) {
        return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })
    }

    const newDate = new Date().toISOString()

    // Fetch campaign data
    const { data, error } = await supabase
        .from('campaigns')
        .select('*,domains!inner(*, keywords!inner(*))')
        .eq('id', campaignId)
        .eq('domains.is_active', true)
        .eq('domains.keywords.is_active', true)
        .single()

    if (error || !data) {
        return NextResponse.json({ error: error?.message || 'Campaign not found' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    // Update domain timestamps in batch
    const domainIds = data.domains.map((domain: any) => domain.id)
    if (domainIds.length > 0) {
        const { error: updateError } = await supabase
            .from('domains')
            .update({ updated_at: newDate })
            .in('id', domainIds)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
        }
    }

    // Prepare keyword data
    const keywordsData = data.domains[0].keywords.map((keyword: any) => ({
        keyword: keyword.keyword,
        language_name: keyword.language,
        device: keyword.device,
        location_name: getName(keyword.country_code) || 'Unknown',
    }))

    if (!keywordsData.length) {
        return NextResponse.json({ message: 'No active keywords found' })
    }

    const login = process.env.DATAFORSEO_LOGIN
    const password = process.env.DATAFORSEO_PASSWORD

    if (!login || !password) {
        return NextResponse.json({ error: 'Missing DataForSEO credentials' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const limit = pLimit(5)
    const searchEngine = data?.search_engine

    try {
        const responses = await Promise.all(
            keywordsData.map((keywordData: any) =>
                limit(() =>
                    fetch(`https://api.dataforseo.com/v3/serp/${searchEngine}/organic/live/regular`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Basic ' + btoa(`${login}:${password}`)
                        },
                        body: JSON.stringify([keywordData])
                    })
                )
            )
        )
        await Promise.all(
            responses.map(async (response, index) => {
                if (!response.ok) {
                    console.error(`Failed to post task: ${response.statusText}`)
                    return
                }

                const resultData = await response.json()
                const searchResults = extractSearchResults(resultData)
                const keywordData = keywordsData[index]
                const domainNames = data.domains.map((domain: any) => ({
                    id: domain.id,
                    name: domain.domain,
                    matched: false
                }))
                await updateKeywordsInDatabase(
                    supabase,
                    resultData,
                    searchResults,
                    domainNames,
                    keywordData,
                    newDate
                )
            })
        )
    } catch (error) {
        console.error('Error posting tasks:', error)
    }

    return NextResponse.json({ message: 'success' })
}

