import axios from 'axios'

export const scrapeContent = async (url: string): Promise<string> => {
  const response = await axios.get('/mealapi/getContent', {
    params: { url },
  })
  if (response.status !== 200) {
    throw new Error(`Failed to fetch search results: ${response.statusText}`)
  }
  return response.data
}
