
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts"

const priceAlertSchema = z.object({
  userEmail: z.string().email().max(255),
  productName: z.string().min(1).max(500),
  currentPrice: z.number().positive().max(10000000),
  alertPrice: z.number().positive().max(10000000),
  productUrl: z.string().url().max(2048),
  productImage: z.string().url().max(2048).optional()
})

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceAlertRequest {
  userEmail: string
  productName: string
  currentPrice: number
  alertPrice: number
  productUrl: string
  productImage?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json()
    
    // Validate input data
    const validationResult = priceAlertSchema.safeParse(requestData)
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input data', details: validationResult.error.issues }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { userEmail, productName, currentPrice, alertPrice, productUrl, productImage } = validationResult.data

    // Mask email for logging (PII protection)
    const maskedEmail = userEmail.replace(/(.{2}).*(@.*)/, '$1***$2')
    console.log('Sending price alert to:', maskedEmail)

    const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`

    const emailResponse = await resend.emails.send({
      from: "CashiFracker <onboarding@resend.dev>",
      to: [userEmail],
      subject: `🎉 Price Drop Alert: ${productName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">💰 CashiFracker</h1>
            <p style="color: #6b7280; margin: 5px 0;">Price Drop Alert</p>
          </div>
          
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            ${productImage ? `<img src="${productImage}" alt="${productName}" style="width: 100%; max-width: 200px; height: auto; display: block; margin: 0 auto 20px; border-radius: 8px;">` : ''}
            
            <h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">${productName}</h2>
            
            <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
              <p style="margin: 0; color: #16a34a; font-weight: bold; font-size: 18px;">
                🎯 Target Price Reached!
              </p>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Current Price</p>
                <p style="margin: 0; color: #16a34a; font-size: 24px; font-weight: bold;">${formatPrice(currentPrice)}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Your Alert Price</p>
                <p style="margin: 0; color: #6b7280; font-size: 18px;">${formatPrice(alertPrice)}</p>
              </div>
            </div>
            
            <a href="${productUrl}" 
               style="display: inline-block; background: linear-gradient(to right, #3b82f6, #1d4ed8); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; text-align: center; width: 100%; box-sizing: border-box;">
              View Product on Cashify
            </a>
          </div>
          
          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>You're receiving this because you set a price alert for this product.</p>
            <p>Happy shopping! 🛍️</p>
          </div>
        </div>
      `,
    })

    console.log("Price alert email sent successfully")

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    })

  } catch (error) {
    // Log generic error server-side without sensitive context
    console.error("Error sending price alert email:", error instanceof Error ? error.message : 'Unknown error')
    return new Response(
      JSON.stringify({ error: "Failed to send price alert email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
})
