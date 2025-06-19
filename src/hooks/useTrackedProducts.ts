
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";

export interface TrackedProduct {
  id: string;
  name: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
  lowestPrice: number;
  highestPrice: number;
  lastChecked: string;
  alertPrice?: number;
  productUrl: string;
}

export const useTrackedProducts = (user: User | null) => {
  const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTrackedProducts = async () => {
    if (!user) {
      setTrackedProducts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tracked_products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tracked products:', error);
        toast({
          title: "Error",
          description: "Failed to load tracked products.",
          variant: "destructive",
        });
        return;
      }

      const formattedProducts: TrackedProduct[] = data.map(product => ({
        id: product.id,
        name: product.product_data?.name || 'Unknown Product',
        image: product.product_data?.image || '/lovable-uploads/4725c5d8-11df-4675-aa0c-cad405db82ad.png',
        currentPrice: product.current_price || 0,
        originalPrice: product.product_data?.originalPrice || product.current_price || 0,
        discount: product.product_data?.discount || 0,
        lowestPrice: product.current_price || 0,
        highestPrice: product.product_data?.originalPrice || product.current_price || 0,
        lastChecked: product.last_checked_at ? new Date(product.last_checked_at).toLocaleString() : 'Never',
        alertPrice: product.alert_price,
        productUrl: product.product_url
      }));

      setTrackedProducts(formattedProducts);
    } catch (error) {
      console.error('Error in loadTrackedProducts:', error);
      toast({
        title: "Error",
        description: "Failed to load tracked products.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addTrackedProduct = async (productData: any, alertPrice: number, productUrl: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track products.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('tracked_products')
        .insert({
          user_id: user.id,
          product_url: productUrl,
          current_price: productData.currentPrice,
          alert_price: alertPrice,
          product_data: productData,
          last_checked_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding tracked product:', error);
        toast({
          title: "Error",
          description: "Failed to add product to tracking.",
          variant: "destructive",
        });
        return false;
      }

      const newProduct: TrackedProduct = {
        id: data.id,
        name: productData.name,
        image: productData.image,
        currentPrice: productData.currentPrice,
        originalPrice: productData.originalPrice,
        discount: productData.discount,
        lowestPrice: productData.currentPrice,
        highestPrice: productData.originalPrice,
        lastChecked: "Just now",
        alertPrice: alertPrice,
        productUrl: productUrl
      };

      setTrackedProducts(prev => [newProduct, ...prev]);
      
      toast({
        title: "Product Added! 🎉",
        description: "Product has been added to your tracking list.",
      });
      
      return true;
    } catch (error) {
      console.error('Error in addTrackedProduct:', error);
      toast({
        title: "Error",
        description: "Failed to add product to tracking.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteTrackedProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tracked_products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tracked product:', error);
        toast({
          title: "Error",
          description: "Failed to remove product from tracking.",
          variant: "destructive",
        });
        return;
      }

      setTrackedProducts(prev => prev.filter(product => product.id !== id));
      toast({
        title: "Product Removed",
        description: "Product has been removed from tracking.",
      });
    } catch (error) {
      console.error('Error in deleteTrackedProduct:', error);
      toast({
        title: "Error",
        description: "Failed to remove product from tracking.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTrackedProducts();
  }, [user]);

  return {
    trackedProducts,
    isLoading,
    addTrackedProduct,
    deleteTrackedProduct,
    refreshProducts: loadTrackedProducts
  };
};
