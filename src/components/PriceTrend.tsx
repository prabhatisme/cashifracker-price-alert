
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PriceTrendProps {
  currentPrice: number;
  lowestPrice: number;
  highestPrice: number;
  className?: string;
}

export const PriceTrend = ({ currentPrice, lowestPrice, highestPrice, className = "" }: PriceTrendProps) => {
  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;
  
  // Determine if current price is at lowest, highest, or somewhere in between
  const isAtLowest = currentPrice === lowestPrice;
  const isAtHighest = currentPrice === highestPrice;
  const isStable = lowestPrice === highestPrice;

  const getTrendIcon = () => {
    if (isStable) return <Minus className="h-4 w-4" />;
    if (isAtLowest) return <ArrowDown className="h-4 w-4" />;
    if (isAtHighest) return <ArrowUp className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (isStable) return "text-gray-500";
    if (isAtLowest) return "text-leaf-green";
    if (isAtHighest) return "text-rose-red";
    return "text-gray-500";
  };

  const getTrendBadge = () => {
    if (isStable) return null;
    if (isAtLowest) return <Badge variant="secondary" className="bg-leaf-green/10 text-leaf-green">Best Price!</Badge>;
    if (isAtHighest) return <Badge variant="secondary" className="bg-rose-red/10 text-rose-red">Highest Seen</Badge>;
    return null;
  };

  return (
    <div className={`space-y-2 text-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>Current Trend</span>
        </div>
        {getTrendBadge()}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-leaf-green">
            <ArrowDown className="h-4 w-4" />
            <span>Lowest Price:</span>
          </div>
          <span className="font-medium">{formatPrice(lowestPrice)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1 text-rose-red">
            <ArrowUp className="h-4 w-4" />
            <span>Highest Price:</span>
          </div>
          <span className="font-medium">{formatPrice(highestPrice)}</span>
        </div>
      </div>
    </div>
  );
};
