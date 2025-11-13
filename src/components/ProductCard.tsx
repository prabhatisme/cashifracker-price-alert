
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash, ExternalLink, Edit } from "lucide-react";
import { PriceTrend } from "@/components/PriceTrend";
import { useIsMobile } from "@/hooks/use-mobile";
import { z } from "zod";

const priceSchema = z.number().positive("Price must be positive").max(10000000, "Price too high");
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TrackedProduct {
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

interface ProductCardProps {
  product: TrackedProduct;
  onDelete: (id: string) => void;
  onUpdate?: () => void;
}

export const ProductCard = ({ product, onDelete, onUpdate }: ProductCardProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newAlertPrice, setNewAlertPrice] = useState(product.alertPrice?.toString() || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  const handleEditAlert = async () => {
    setIsUpdating(true);
    const alertPrice = parseInt(newAlertPrice);

    // Validate price with zod schema
    const validationResult = priceSchema.safeParse(alertPrice);
    if (!validationResult.success) {
      toast({
        title: "Invalid Price",
        description: validationResult.error.issues[0].message,
        variant: "destructive",
      });
      setIsUpdating(false);
      return;
    }

    const { error } = await supabase
      .from('tracked_products')
      .update({ alert_price: alertPrice })
      .eq('id', product.id);

    if (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Alert Updated",
        description: `Alert price set to ${formatPrice(alertPrice)}`,
      });
      setIsEditDialogOpen(false);
      if (onUpdate) onUpdate();
    }

    setIsUpdating(false);
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border animate-fade-in">
      <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
        <div className="mb-4">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full object-contain rounded-lg bg-white ${
              isMobile ? 'h-48' : 'h-64'
            }`}
          />
        </div>
        
        <div className="space-y-3">
          <h3 className={`font-semibold text-foreground line-clamp-2 ${
            isMobile ? 'text-base' : 'text-lg'
          }`}>
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-2 flex-wrap">
            <Badge variant="destructive" className="bg-destructive">
              -{product.discount}%
            </Badge>
            <span className={`font-bold text-foreground ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>
              {formatPrice(product.currentPrice)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          </div>
          
          <PriceTrend
            currentPrice={product.currentPrice}
            lowestPrice={product.lowestPrice}
            highestPrice={product.highestPrice}
          />
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>🕓 Last Checked:</span>
              <span className="text-xs">{product.lastChecked}</span>
            </div>
            
            {product.alertPrice && (
              <div className="flex items-center justify-between text-primary font-medium">
                <span>🔔 Alert at:</span>
                <div className="flex items-center space-x-2">
                  <span>{formatPrice(product.alertPrice)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setNewAlertPrice(product.alertPrice?.toString() || "");
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center space-x-1 flex-1"
              onClick={() => window.open(product.productUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span>View Product</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(product.id)}
            >
              <Trash className="h-4 w-4" />
              {isMobile && <span className="ml-1">Delete</span>}
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Alert Price</DialogTitle>
            <DialogDescription>
              Set a new price alert for this product. You'll be notified when the price drops below this amount.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="alertPrice">Alert Price (₹)</Label>
              <Input
                id="alertPrice"
                type="number"
                placeholder="Enter alert price"
                value={newAlertPrice}
                onChange={(e) => setNewAlertPrice(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Current price: {formatPrice(product.currentPrice)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAlert} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
