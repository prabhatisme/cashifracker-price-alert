import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('Starting to refresh blurred product images...')

    // Get all products with blurred images
    const { data: products, error: fetchError } = await supabase
      .from('tracked_products')
      .select('id, product_data')
      .like('product_data->>image', '%blur%')

    if (fetchError) {
      throw new Error(`Failed to fetch products: ${fetchError.message}`)
    }

    console.log(`Found ${products?.length || 0} products with blurred images`)

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No blurred images found', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let updatedCount = 0
    const errors = []

    // Update each product
    for (const product of products) {
      try {
        const productData = product.product_data as any
        const currentImage = productData.image

        // Remove query parameters from image URL
        const cleanImage = currentImage.split('?')[0]

        console.log(`Updating product ${product.id}: ${currentImage} -> ${cleanImage}`)

        // Update the product with clean image URL
        const { error: updateError } = await supabase
          .from('tracked_products')
          .update({
            product_data: {
              ...productData,
              image: cleanImage
            }
          })
          .eq('id', product.id)

        if (updateError) {
          console.error(`Failed to update product ${product.id}:`, updateError)
          errors.push({ id: product.id, error: updateError.message })
        } else {
          updatedCount++
        }
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error)
        errors.push({ id: product.id, error: error.message })
      }
    }

    console.log(`Successfully updated ${updatedCount} out of ${products.length} products`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated ${updatedCount} product images`,
        updated: updatedCount,
        total: products.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error refreshing product images:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to refresh product images', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})