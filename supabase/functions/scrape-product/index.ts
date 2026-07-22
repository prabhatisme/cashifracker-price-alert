import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const urlSchema = z.string().url().max(2048).regex(/^https:\/\/(www\.)?cashify\.in\//, {
  message: "URL must be a valid Cashify.in product page"
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

export interface ScrapedProduct {
  name: string
  variant: string
  image: string
  currentPrice: number
  originalPrice: number
  discount: number
}

function toNumber(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return Math.round(v)
  const n = parseFloat(String(v).replace(/[₹,\s]/g, ''))
  return Number.isFinite(n) ? Math.round(n) : 0
}

function pickFirstImage(img: unknown): string {
  if (!img) return ''
  if (typeof img === 'string') return img.split('?')[0]
  if (Array.isArray(img) && img.length) return pickFirstImage(img[0])
  if (typeof img === 'object' && img !== null && 'url' in (img as any)) {
    return pickFirstImage((img as any).url)
  }
  return ''
}

function extractFromLdJson(html: string): Partial<ScrapedProduct> | null {
  const $ = load(html)
  const scripts = $('script[type="application/ld+json"]').toArray()

  let best: any = null
  for (const s of scripts) {
    const raw = $(s).contents().text().trim()
    if (!raw) continue
    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch {
      continue
    }
    const entries = Array.isArray(parsed) ? parsed : [parsed]
    for (const entry of entries) {
      const graph = entry?.['@graph'] ? entry['@graph'] : [entry]
      for (const node of graph) {
        const type = node?.['@type']
        const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'))
        const isGroup = type === 'ProductGroup' || (Array.isArray(type) && type.includes('ProductGroup'))
        if (isProduct && node.offers) {
          return normalizeProductNode(node)
        }
        if ((isProduct || isGroup) && !best) {
          best = node
        }
      }
    }
  }
  return best ? normalizeProductNode(best) : null
}

function normalizeProductNode(node: any): Partial<ScrapedProduct> {
  const name: string = node.name ?? ''
  const image = pickFirstImage(node.image)

  // Offers may be object, array, or AggregateOffer
  const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers
  let currentPrice = 0
  let originalPrice = 0

  if (offers) {
    currentPrice = toNumber(offers.price ?? offers.lowPrice)
    // Look for ListPrice inside priceSpecification
    const specs = Array.isArray(offers.priceSpecification)
      ? offers.priceSpecification
      : offers.priceSpecification
      ? [offers.priceSpecification]
      : []
    for (const spec of specs) {
      const priceType: string = spec?.priceType ?? ''
      if (priceType.toLowerCase().includes('listprice')) {
        originalPrice = toNumber(spec.price)
      }
    }
    if (!originalPrice) originalPrice = toNumber(offers.highPrice)
  }

  return { name, image, currentPrice, originalPrice, variant: '' }
}

export async function scrapeCashifyProduct(productUrl: string): Promise<ScrapedProduct> {
  const response = await fetch(productUrl, { headers: BROWSER_HEADERS })
  if (!response.ok) {
    throw new Error(`Failed to fetch page: ${response.status}`)
  }
  const html = await response.text()

  const ld = extractFromLdJson(html) ?? {}

  const name = (ld.name ?? '').trim() || 'Unknown Product'
  const image = ld.image ?? ''
  const currentPrice = ld.currentPrice ?? 0
  const originalPrice = ld.originalPrice ?? 0
  const discount =
    originalPrice > 0 && currentPrice > 0 && originalPrice >= currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0

  return {
    name,
    variant: ld.variant ?? '',
    image,
    currentPrice,
    originalPrice,
    discount,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { productUrl } = await req.json()

    const validationResult = urlSchema.safeParse(productUrl)
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid Cashify URL', details: validationResult.error.issues[0].message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Scraping product request received')

    const productData = await scrapeCashifyProduct(productUrl)

    console.log('Scraped product successfully:', productData.name)

    return new Response(
      JSON.stringify({ success: true, data: productData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Scraping error:', error instanceof Error ? error.message : 'Unknown error')
    return new Response(
      JSON.stringify({ error: 'Failed to scrape product data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
