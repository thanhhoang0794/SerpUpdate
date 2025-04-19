import * as client from 'dataforseo-client'
import { extractSearchResults } from "@/utils/extractCrawlResult";
import { updateKeywordsInDatabase } from "@/utils/updateKeywordHistoryNew";
import { NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

export async function processKeywordUpdate(id: string, tag: string, supabase: any) {
    try{
    const newDate = new Date().toISOString()
    const { data, error } = await supabase.from('campaigns')
      .select('*,domains!inner(*, keywords!inner(*))')
      .eq('id', tag)
      .eq('domains.is_active', true)
      .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    if (data && data.domains) {
        for (const domain of data.domains) {
          const { count } = await supabase
            .from('keywords')
            .select('*', { count: 'exact' })
            .eq('domain_id', domain.id)
            .eq('is_active', true);

          const batchSize = 1000;
          let allKeywords: any[] = [];
          
          for (let i = 0; i < (count ?? 0); i += batchSize) {
            const { data: keywords } = await supabase
              .from('keywords')
              .select('*')
              .eq('domain_id', domain.id)
              .eq('is_active', true)
              .range(i, i + batchSize - 1)
              .order('id', { ascending: false });
              
            if (keywords) {
              allKeywords = [...allKeywords, ...keywords];
            }
          }
          
          domain.keywords = allKeywords;
        }
    }
    const login = process.env.DATAFORSEO_LOGIN
    const password = process.env.DATAFORSEO_PASSWORD
    if (!login || !password) {
        return NextResponse.json({ error: 'Missing DataForSEO credentials' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    const authFetch = createAuthenticatedFetch(login, password);
    let serpApi = new client.SerpApi("https://api.dataforseo.com", { fetch: authFetch });
    const searchEngine = data?.search_engine
    let result
    switch (searchEngine) {
        case 'google':
            result = await serpApi.googleOrganicTaskGetRegular(id)
            break;
        case 'bing':
            result = await serpApi.bingOrganicTaskGetRegular(id)
            break;
        case 'yahoo':
            result = await serpApi.yahooOrganicTaskGetRegular(id)
            break;
        case 'baidu':
            result = await serpApi.baiduOrganicTaskGetRegular(id)
            break;
        case 'naver':
            result = await serpApi.naverOrganicTaskGetRegular(id)
            break;
        case 'seznam':
            result = await serpApi.seznamOrganicTaskGetRegular(id)
            break;
    }
    const searchResults = extractSearchResults(result)
    const keywordData = {
        keyword: result?.tasks?.[0]?.data?.keyword,
        language_name: result?.tasks?.[0]?.data?.language_name,
        device: result?.tasks?.[0]?.data?.device,
        location_name: result?.tasks?.[0]?.data?.location_name,
    }
    const domainNames = data.domains.map((domain: any) => ({
        id: domain.id,
        name: domain.domain,
        matched: false
    }))
    await updateKeywordsInDatabase(
        supabase,
        result,
        searchResults,
        domainNames,
        keywordData,
        newDate
    )
    } catch (error) {
        console.error('Keyword update error:', error)
        throw error
    }
}

function createAuthenticatedFetch(username: string, password: string) {
    return (url: RequestInfo, init?: RequestInit): Promise<Response> => {
      const token = btoa(`${username}:${password}`);
      const authHeader = { 'Authorization': `Basic ${token}` };

      const newInit: RequestInit = {
        ...init,
        headers: {
          ...init?.headers,
          ...authHeader
        }
      };

      return fetch(url, newInit);
    };
  }


