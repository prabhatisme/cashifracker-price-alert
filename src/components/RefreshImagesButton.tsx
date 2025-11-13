import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const RefreshImagesButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const { data, error } = await supabase.functions.invoke('refresh-product-images');

      if (error) {
        throw error;
      }

      toast({
        title: "Images Refreshed",
        description: `Successfully updated ${data.updated} product image(s)`,
      });

      // Reload the page to show updated images
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing images:', error);
      toast({
        title: "Refresh Failed",
        description: error.message || "Failed to refresh product images",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Images'}
    </Button>
  );
};