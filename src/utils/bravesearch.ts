import axios from 'axios'

interface SearchResult {
  title: string
  url: string
  description: string
}

export const executeSearch = async (
  query: string,
  limit: number = 10,
  brave_api_key: string,
): Promise<SearchResult[]> => {
  const response = await axios.get('/mealapi/search', {
    params: { q: query, count: limit, apikey: brave_api_key },
  })
  if (response.status !== 200) {
    throw new Error(`Failed to fetch search results: ${response.statusText}`)
  }

  const results: SearchResult[] = []

  for (const item of response.data.web.results) {
    results.push({
      title: item.title,
      url: item.url,
      description: item.description || '',
    })
  }

  return results
}
