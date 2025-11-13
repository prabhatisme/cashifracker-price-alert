
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const urlSchema = z.string().url().max(2048).regex(/^https:\/\/.*cashify\.in\//, {
  message: "URL must be a valid Cashify.in product page"
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productUrl } = await req.json()
    
    // Validate URL with zod schema
    const validationResult = urlSchema.safeParse(productUrl)
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid Cashify URL', details: validationResult.error.issues[0].message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Scraping product URL:', productUrl)

    // Fetch the product page
    const response = await fetch(productUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status}`)
    }

    const html = await response.text()
    const $ = load(html)

    // Scrape product data using the specified selectors
    const name = $('.h3.line-clamp-2').text().trim()
    const variant = $('.body2.mb-2.text-surface-text').text().trim()
    
    // Get the image src from the img element
    const imageElement = $('img.w-full.h-auto.aspect-square.object-contain')
    let image = imageElement.attr('data-src') || imageElement.attr('src') || ''
    
    // Remove blur and size parameters to get full resolution image
    if (image) {
      image = image.split('?')[0]
    }
    
    // Get current price
    const currentPriceText = $('span.h1[itemprop="price"]').text().trim()
    const currentPrice = parseInt(currentPriceText.replace(/[₹,]/g, '')) || 0
    
    // Get MRP
    const mrpText = $('.subtitle1.line-through.text-surface-text').text().trim()
    const originalPrice = parseInt(mrpText.replace(/[₹,]/g, '')) || 0
    
    // Calculate discount percentage
    const discount = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0

    const productData = {
      name: name || 'Unknown Product',
      variant: variant || '',
      image: image,
      currentPrice: currentPrice,
      originalPrice: originalPrice,
      discount: discount
    }

    console.log('Scraped product data:', productData)

    return new Response(
      JSON.stringify({ success: true, data: productData }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Scraping error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to scrape product data', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
