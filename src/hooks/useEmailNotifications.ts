
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PriceAlertData {
  userEmail: string;
  productName: string;
  currentPrice: number;
  alertPrice: number;
  productUrl: string;
  productImage?: string;
}

export const useEmailNotifications = () => {
  const { toast } = useToast();

  const sendPriceAlert = async (data: PriceAlertData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('send-price-alert', {
        body: data
      });

      if (error) {
        console.error('Error sending price alert:', error);
        toast({
          title: "Email Notification Failed",
          description: "Failed to send price alert email. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log('Price alert sent successfully:', result);
      toast({
        title: "Price Alert Sent! 📧",
        description: "You'll receive an email notification about this price drop.",
      });
      return true;
    } catch (error) {
      console.error('Error in sendPriceAlert:', error);
      toast({
        title: "Email Notification Failed",
        description: "Failed to send price alert email. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    sendPriceAlert
  };
};
