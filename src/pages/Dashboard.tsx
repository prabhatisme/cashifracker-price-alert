
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import TrackingDialog from "@/components/TrackingDialog";
import { supabase } from "@/integrations/supabase/client";
import { useTrackedProducts } from "@/hooks/useTrackedProducts";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ProductUrlInput } from "@/components/ProductUrlInput";
import { ProductGrid } from "@/components/ProductGrid";
import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    trackedProducts, 
    isLoading: productsLoading, 
    addTrackedProduct, 
    deleteTrackedProduct 
  } = useTrackedProducts(user);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleTrackProduct = () => {
    if (!productUrl.includes('cashify.in')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Cashify product URL.",
        variant: "destructive",
      });
      return;
    }
    
    setIsTrackingDialogOpen(true);
  };

  const handleProductAdded = async (productData: any, alertPrice: number) => {
    const success = await addTrackedProduct(productData, alertPrice, productUrl);
    if (success) {
      setProductUrl("");
      setIsTrackingDialogOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Logout Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logged Out",
          description: "You have been logged out successfully.",
        });
        // Force navigation to home page
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "An unexpected error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ProductUrlInput
          productUrl={productUrl}
          onProductUrlChange={setProductUrl}
          onTrackProduct={handleTrackProduct}
        />

        {productsLoading && <LoadingState />}

        {!productsLoading && trackedProducts.length > 0 && (
          <ProductGrid
            products={trackedProducts}
            onDeleteProduct={deleteTrackedProduct}
          />
        )}

        {!productsLoading && trackedProducts.length === 0 && <EmptyState />}
      </div>

      <TrackingDialog
        isOpen={isTrackingDialogOpen}
        onClose={() => setIsTrackingDialogOpen(false)}
        productUrl={productUrl}
        onProductAdded={handleProductAdded}
      />
    </div>
  );
};

export default Dashboard;
