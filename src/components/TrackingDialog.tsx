
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TrackingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  productUrl: string;
  onProductAdded: (product: any) => void;
}

const TrackingDialog = ({ isOpen, onClose, productUrl, onProductAdded }: TrackingDialogProps) => {
  const [alertPrice, setAlertPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [productData, setProductData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && productUrl) {
      setIsLoading(true);
      setProductData(null);
      
      // Call the Supabase Edge Function to scrape product data
      supabase.functions.invoke('scrape-product', {
        body: { productUrl }
      }).then(({ data, error }) => {
        setIsLoading(false);
        
        if (error) {
          console.error('Scraping error:', error);
          toast({
            title: "Error",
            description: "Failed to fetch product details. Please check the URL.",
            variant: "destructive",
          });
          return;
        }

        if (data?.success) {
          setProductData(data.data);
        } else {
          toast({
            title: "Error",
            description: data?.error || "Failed to scrape product data.",
            variant: "destructive",
          });
        }
      }).catch((err) => {
        setIsLoading(false);
        console.error('Function call error:', err);
        toast({
          title: "Error",
          description: "Failed to connect to scraping service.",
          variant: "destructive",
        });
      });
    }
  }, [isOpen, productUrl]);

  const handleSetAlert = () => {
    if (!alertPrice || parseFloat(alertPrice) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid alert price.",
        variant: "destructive",
      });
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: productData.name,
      image: productData.image,
      currentPrice: productData.currentPrice,
      originalPrice: productData.originalPrice,
      discount: productData.discount,
      lowestPrice: productData.currentPrice,
      highestPrice: productData.originalPrice,
      lastChecked: "Just now",
      alertPrice: parseFloat(alertPrice),
      productUrl: productUrl
    };

    onProductAdded(newProduct);
    setIsSuccess(true);

    // Close dialog after success animation
    setTimeout(() => {
      setIsSuccess(false);
      setAlertPrice("");
      setProductData(null);
      onClose();
    }, 2000);
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-gray">
            Track Product
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-indigo mx-auto mb-4"></div>
              <p className="text-gray-600">Fetching product details...</p>
            </div>
          )}

          {!isLoading && !isSuccess && productData && (
            <>
              {/* Product Info */}
              <div className="flex space-x-4">
                <img
                  src={productData.image}
                  alt={productData.name}
                  className="w-24 h-24 object-contain rounded-lg bg-gray-50"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/lovable-uploads/4725c5d8-11df-4675-aa0c-cad405db82ad.png";
                  }}
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-gray">{productData.name}</h3>
                  {productData.variant && (
                    <p className="text-sm text-gray-600">{productData.variant}</p>
                  )}
                  <div className="flex items-center space-x-2">
                    {productData.discount > 0 && (
                      <Badge variant="destructive" className="bg-rose-red">
                        -{productData.discount}%
                      </Badge>
                    )}
                    <span className="text-lg font-bold text-slate-gray">
                      {formatPrice(productData.currentPrice)}
                    </span>
                    {productData.originalPrice > productData.currentPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(productData.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Alert Price Input */}
              <div className="space-y-2">
                <Label htmlFor="alertPrice" className="text-slate-gray font-medium">
                  Enter price to track
                </Label>
                <Input
                  id="alertPrice"
                  type="number"
                  placeholder="Enter your target price"
                  value={alertPrice}
                  onChange={(e) => setAlertPrice(e.target.value)}
                  className="h-12 border-gray-300 focus:border-blue-indigo focus:ring-blue-indigo"
                />
                <p className="text-sm text-gray-600">
                  You'll receive an email when the price drops below ₹{alertPrice || "0"}
                </p>
              </div>

              {/* Set Alert Button */}
              <Button
                onClick={handleSetAlert}
                className="w-full h-12 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-blue-700 hover:to-blue-600 text-white font-medium text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                SET ALERT
              </Button>
            </>
          )}

          {isSuccess && (
            <div className="text-center py-8 animate-fade-in">
              <CheckCircle className="h-16 w-16 text-leaf-green mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-gray mb-2">
                Alert Set Successfully!
              </h3>
              <p className="text-gray-600">
                We'll notify you when the price drops below your target.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackingDialog;
