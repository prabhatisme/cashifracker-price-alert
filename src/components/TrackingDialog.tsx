
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  // Mock product data - in real app, this would be fetched by scraping the URL
  const mockProductData = {
    name: "Apple iPhone 13 - Refurbished",
    image: "/lovable-uploads/4725c5d8-11df-4675-aa0c-cad405db82ad.png",
    currentPrice: 33799,
    originalPrice: 69900,
    discount: 52,
    variant: "Cashify Warranty, Fair, 4 GB / 64 GB, Midnight Green"
  };

  useEffect(() => {
    if (isOpen && productUrl) {
      setIsLoading(true);
      // Simulate API call to scrape product data
      setTimeout(() => {
        setProductData(mockProductData);
        setIsLoading(false);
      }, 1500);
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
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-slate-gray">{productData.name}</h3>
                  <p className="text-sm text-gray-600">{productData.variant}</p>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="bg-rose-red">
                      -{productData.discount}%
                    </Badge>
                    <span className="text-lg font-bold text-slate-gray">
                      {formatPrice(productData.currentPrice)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(productData.originalPrice)}
                    </span>
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
