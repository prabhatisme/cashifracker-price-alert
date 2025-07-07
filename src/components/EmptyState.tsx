
import { useIsMobile } from "@/hooks/use-mobile";

export const EmptyState = () => {
  const isMobile = useIsMobile();

  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="text-6xl mb-4">📱</div>
      <h3 className={`font-semibold text-foreground mb-2 ${
        isMobile ? 'text-xl' : 'text-2xl'
      }`}>
        No products tracked yet
      </h3>
      <p className="text-muted-foreground">
        Add your first Cashify product URL above to start tracking deals!
      </p>
    </div>
  );
};
