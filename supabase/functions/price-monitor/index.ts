import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12"

// --- JSON-LD helpers (kept in-file since edge functions can't share imports) ---
function toNumber(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'number') return Math.round(v)
  const n = parseFloat(String(v).replace(/[₹,\s]/g, ''))
  return Number.isFinite(n) ? Math.round(n) : 0
}

function extractCurrentPrice(html: string): number {
  const $ = load(html)
  const scripts = $('script[type="application/ld+json"]').toArray()
  for (const s of scripts) {
    const raw = $(s).contents().text().trim()
    if (!raw) continue
    let parsed: any
    try { parsed = JSON.parse(raw) } catch { continue }
    const entries = Array.isArray(parsed) ? parsed : [parsed]
    for (const entry of entries) {
      const graph = entry?.['@graph'] ? entry['@graph'] : [entry]
      for (const node of graph) {
        const type = node?.['@type']
        const isProduct = type === 'Product' || (Array.isArray(type) && type.includes('Product'))
        if (isProduct && node.offers) {
          const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers
          const price = toNumber(offers?.price ?? offers?.lowPrice)
          if (price > 0) return price
        }
      }
    }
  }
  return 0
}


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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting price monitoring check...')

    // Get all tracked products
    const { data: trackedProducts, error: fetchError } = await supabase
      .from('tracked_products')
      .select('*')

    if (fetchError) {
      console.error('Error fetching tracked products:', fetchError)
      throw fetchError
    }

    console.log(`Found ${trackedProducts?.length || 0} tracked products`)

    // Hash identifier for logs (PII protection): only first 8 chars of UUID
    const shortId = (id: string) => id?.substring(0, 8) ?? 'unknown'

    for (const product of trackedProducts || []) {
      try {
        console.log(`Checking product ${shortId(product.id)}`)

        // Scrape current price
        const response = await fetch(product.product_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        })

        if (!response.ok) {
          console.log(`Failed to fetch product ${shortId(product.id)}: ${response.status}`)
          continue
        }

        const html = await response.text()

        // Extract current price from JSON-LD (robust to layout changes)
        const currentPrice = extractCurrentPrice(html)

        if (currentPrice > 0 && currentPrice !== product.current_price) {
          console.log(`Price changed for product ${shortId(product.id)}: ${product.current_price} -> ${currentPrice}`)


          // Update tracked product with new price
          await supabase
            .from('tracked_products')
            .update({
              current_price: currentPrice,
              last_checked_at: new Date().toISOString()
            })
            .eq('id', product.id)

          // Add to price history
          await supabase
            .from('price_history')
            .insert({
              tracked_product_id: product.id,
              price: currentPrice,
              checked_at: new Date().toISOString()
            })

          // Check if price dropped below alert price and send email
          if (product.alert_price && currentPrice <= product.alert_price) {
            console.log(`Price alert triggered for product ${shortId(product.id)}`)
            
            // Get user email
            const { data: userData } = await supabase.auth.admin.getUserById(product.user_id)
            
            if (userData?.user?.email) {
              const productData = product.product_data as any
              
              // Send price alert email
              await supabase.functions.invoke('send-price-alert', {
                body: {
                  userEmail: userData.user.email,
                  productName: productData?.name || 'Product',
                  currentPrice: currentPrice,
                  alertPrice: product.alert_price,
                  productUrl: product.product_url,
                  productImage: productData?.image
                }
              })
            }
          }
        } else if (currentPrice > 0) {
          // Just update last checked time
          await supabase
            .from('tracked_products')
            .update({
              last_checked_at: new Date().toISOString()
            })
            .eq('id', product.id)
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error checking product ${shortId(product.id)}:`, error instanceof Error ? error.message : 'Unknown error')
      }
    }

    console.log('Price monitoring check completed')

    return new Response(
      JSON.stringify({ success: true, checked: trackedProducts?.length || 0 }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Price monitoring error:', error instanceof Error ? error.message : 'Unknown error')
    return new Response(
      JSON.stringify({ error: 'Failed to monitor prices' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
