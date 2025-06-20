
-- Create RLS policies for tracked_products table
CREATE POLICY "Users can view their own tracked products" 
  ON public.tracked_products 
  FOR SELECT 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own tracked products" 
  ON public.tracked_products 
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own tracked products" 
  ON public.tracked_products 
  FOR UPDATE 
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own tracked products" 
  ON public.tracked_products 
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- Create RLS policies for price_history table (if needed for future features)
CREATE POLICY "Users can view price history for their tracked products" 
  ON public.price_history 
  FOR SELECT 
  USING (
    tracked_product_id IN (
      SELECT id FROM public.tracked_products WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "System can insert price history" 
  ON public.price_history 
  FOR INSERT 
  WITH CHECK (true); -- Allow system/cron jobs to insert price history
