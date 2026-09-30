import http from 'node:http'
import { URL } from 'node:url'
import { PRODUCTS, CATEGORIES } from './data/products.mjs'

const PORT = Number(process.env.BACKEND_PORT ?? 4000)

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(payload))
}

const getRelatedProducts = (slug, limit = 4) => {
  const product = PRODUCTS.find((item) => item.slug === slug)
  if (!product) return null

  const related = PRODUCTS.filter((item) => item.category === product.category && item.slug !== product.slug)
  return related.slice(0, Math.max(1, limit))
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendJson(res, 400, { message: 'Bad request' })
    return
  }

  if (req.method === 'OPTIONS') {
    sendJson(res, 204, {})
    return
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method not allowed' })
    return
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`)
  const path = requestUrl.pathname

  if (path === '/health') {
    sendJson(res, 200, { status: 'ok' })
    return
  }

  if (path === '/api/categories') {
    sendJson(res, 200, CATEGORIES)
    return
  }

  if (path === '/api/products') {
    const category = requestUrl.searchParams.get('category')
    const items = !category || category === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((item) => item.category === category)
    sendJson(res, 200, items)
    return
  }

  const relatedMatch = path.match(/^\/api\/products\/([^/]+)\/related$/)
  if (relatedMatch) {
    const slug = decodeURIComponent(relatedMatch[1])
    const limit = Number(requestUrl.searchParams.get('limit') ?? 4)
    const related = getRelatedProducts(slug, Number.isFinite(limit) ? limit : 4)

    if (!related) {
      sendJson(res, 404, { message: 'Product not found' })
      return
    }

    sendJson(res, 200, related)
    return
  }

  const productMatch = path.match(/^\/api\/products\/([^/]+)$/)
  if (productMatch) {
    const slug = decodeURIComponent(productMatch[1])
    const product = PRODUCTS.find((item) => item.slug === slug)

    if (!product) {
      sendJson(res, 404, { message: 'Product not found' })
      return
    }

    sendJson(res, 200, product)
    return
  }

  sendJson(res, 404, { message: 'Not found' })
})

server.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`)
})
