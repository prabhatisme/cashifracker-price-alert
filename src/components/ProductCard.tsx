
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash, ExternalLink } from "lucide-react";
import { PriceTrend } from "@/components/PriceTrend";
import { useIsMobile } from "@/hooks/use-mobile";

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
}

export const ProductCard = ({ product, onDelete }: ProductCardProps) => {
  const isMobile = useIsMobile();

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

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
                <span>{formatPrice(product.alertPrice)}</span>
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
    </Card>
  );
};
