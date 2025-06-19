
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

interface ProductData {
  name: string;
  image: string;
  currentPrice: number;
  originalPrice: number;
  discount: number;
}

export const useTrackedProducts = (user: User | null) => {
  const [trackedProducts, setTrackedProducts] = useState<TrackedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const formatLastChecked = (lastCheckedAt: string | null): string => {
    if (!lastCheckedAt) {
      return 'Pending first check';
    }

    const lastChecked = new Date(lastCheckedAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - lastChecked.getTime()) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

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

      const formattedProducts: TrackedProduct[] = data.map(product => {
        const productData = product.product_data as any;
        
        return {
          id: product.id,
          name: productData?.name || 'Unknown Product',
          image: productData?.image || '/lovable-uploads/4725c5d8-11df-4675-aa0c-cad405db82ad.png',
          currentPrice: product.current_price || 0,
          originalPrice: productData?.originalPrice || product.current_price || 0,
          discount: productData?.discount || 0,
          lowestPrice: product.current_price || 0,
          highestPrice: productData?.originalPrice || product.current_price || 0,
          lastChecked: formatLastChecked(product.last_checked_at),
          alertPrice: product.alert_price,
          productUrl: product.product_url
        };
      });

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

  const addTrackedProduct = async (productData: ProductData, alertPrice: number, productUrl: string) => {
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
          product_data: productData as any,
          last_checked_at: null // Will be updated by the cron job
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
        lastChecked: "Pending first check",
        alertPrice: alertPrice,
        productUrl: productUrl
      };

      setTrackedProducts(prev => [newProduct, ...prev]);
      
      toast({
        title: "Product Added! 🎉",
        description: "Product has been added to your tracking list. Price monitoring will begin with the next hourly check.",
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
    
    // Set up real-time updates for price changes
    const channel = supabase
      .channel('tracked-products-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tracked_products',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          // Reload products when price monitoring updates them
          loadTrackedProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    trackedProducts,
    isLoading,
    addTrackedProduct,
    deleteTrackedProduct,
    refreshProducts: loadTrackedProducts
  };
};
