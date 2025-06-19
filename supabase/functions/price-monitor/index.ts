
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12"

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

    for (const product of trackedProducts || []) {
      try {
        console.log(`Checking product: ${product.product_url}`)

        // Scrape current price
        const response = await fetch(product.product_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })

        if (!response.ok) {
          console.log(`Failed to fetch ${product.product_url}: ${response.status}`)
          continue
        }

        const html = await response.text()
        const $ = load(html)

        // Scrape current price using the same selectors as the scrape-product function
        const currentPriceText = $('span.h1[itemprop="price"]').text().trim()
        const currentPrice = parseInt(currentPriceText.replace(/[₹,]/g, '')) || 0

        if (currentPrice > 0 && currentPrice !== product.current_price) {
          console.log(`Price changed for product ${product.id}: ${product.current_price} -> ${currentPrice}`)

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
            console.log(`Price alert triggered for product ${product.id}`)
            
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
        console.error(`Error checking product ${product.id}:`, error)
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
    console.error('Price monitoring error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to monitor prices', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
