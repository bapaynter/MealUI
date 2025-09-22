// Load environment variables from the .env file
import express from 'express'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import { NodeHtmlMarkdown } from 'node-html-markdown'

const app = express()
const PORT = process.env.PORT || 3075

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`)
  next() // Pass control to the next middleware or route handler
})

// This is your proxy endpoint
app.get('/mealapi/search', async (req, res) => {
  // Get the search query from the request's query parameters
  const searchQuery = req.query.q
  const apiKey = req.query.apikey
  const count = req.query.count || 5

  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query is required.' })
  }
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required.' })
  }

  const braveApiUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&count=${count}`

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured.' })
  }

  try {
    const response = await fetch(braveApiUrl, {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': apiKey,
      },
    })

    if (!response.ok) {
      // Forward the error from the Brave API
      const errorData = await response.json()
      return res.status(response.status).json(errorData)
    }

    const data = await response.json()
    // Send the results from Brave back to your frontend
    res.json(data)
  } catch (error) {
    console.error('Error proxying the request:', error)
    res.status(500).json({ error: 'Failed to fetch search results.' })
  }
})

app.get('/mealapi/getContent', async (req, res) => {
  const url = req.query.url
  if (!url) {
    return res.status(400).json({ error: 'URL is required.' })
  }
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  })
  const page = await response.text()
  console.log('response from scrape', page)
  if (!response.ok) {
    // Forward the error from the Brave API
    const errorData = await response.json()
    return res.status(response.status).json(errorData)
  }
  const $ = cheerio.load(page)
  const pageContent = NodeHtmlMarkdown.translate($('body').html() || '')
  console.log('scraped page content', pageContent)
  res.type('text/plain')
  res.send(pageContent)
})

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
})
