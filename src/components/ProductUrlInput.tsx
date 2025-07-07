
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProductUrlInputProps {
  productUrl: string;
  onProductUrlChange: (url: string) => void;
  onTrackProduct: () => void;
}

export const ProductUrlInput = ({ 
  productUrl, 
  onProductUrlChange, 
  onTrackProduct 
}: ProductUrlInputProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="text-center mb-8 sm:mb-12 animate-fade-in">
      <h2 className={`font-bold text-foreground mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
        Your Refurb Deal Tracker
      </h2>
      <p className={`text-muted-foreground mb-6 sm:mb-8 ${isMobile ? 'text-base px-4' : 'text-xl'}`}>
        Paste any Cashify product link to begin tracking price drops.
      </p>
      
      <div className="max-w-2xl mx-auto">
        <div className={`flex gap-2 sm:gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <Input
            placeholder="Enter Cashify Product Link"
            value={productUrl}
            onChange={(e) => onProductUrlChange(e.target.value)}
            className={`border-input focus:border-primary focus:ring-primary bg-background ${
              isMobile ? 'h-12 text-base' : 'h-14 text-lg'
            }`}
          />
          <Button
            onClick={onTrackProduct}
            className={`bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
              isMobile ? 'h-12 text-base' : 'h-14 px-8 text-lg'
            }`}
          >
            Track
          </Button>
        </div>
      </div>
    </div>
  );
};
