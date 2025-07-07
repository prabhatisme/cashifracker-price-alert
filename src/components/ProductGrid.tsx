
import { ProductCard } from "./ProductCard";
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

interface ProductGridProps {
  products: TrackedProduct[];
  onDeleteProduct: (id: string) => void;
}

export const ProductGrid = ({ products, onDeleteProduct }: ProductGridProps) => {
  const isMobile = useIsMobile();

  return (
    <div className={`grid gap-4 sm:gap-6 ${
      isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onDelete={onDeleteProduct}
        />
      ))}
    </div>
  );
};
