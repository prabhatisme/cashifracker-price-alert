
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, ExternalLink, LogOut, Mail, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrackingDialog from "@/components/TrackingDialog";
import { PriceTrend } from "@/components/PriceTrend";
import { supabase } from "@/integrations/supabase/client";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { useTrackedProducts } from "@/hooks/useTrackedProducts";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendPriceAlert } = useEmailNotifications();
  const isMobile = useIsMobile();
  
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

  const handleSendTestAlert = async (product: any) => {
    if (!user?.email) {
      toast({
        title: "Email Required",
        description: "User email not found.",
        variant: "destructive",
      });
      return;
    }

    await sendPriceAlert({
      userEmail: user.email,
      productName: product.name,
      currentPrice: product.currentPrice,
      alertPrice: product.alertPrice || product.currentPrice,
      productUrl: product.productUrl,
      productImage: product.image
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    navigate('/');
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

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
      {/* Mobile-Optimized Top Bar */}
      <div className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💰</span>
              <h1 className={`font-bold text-foreground ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                CashiFracker
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isMobile && (
                <span className="text-muted-foreground text-sm truncate max-w-32">
                  {user.email}
                </span>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                {!isMobile && <span>Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile-Optimized Header Section */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h2 className={`font-bold text-foreground mb-4 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
            Your Refurb Deal Tracker
          </h2>
          <p className={`text-muted-foreground mb-6 sm:mb-8 ${isMobile ? 'text-base px-4' : 'text-xl'}`}>
            Paste any Cashify product link to begin tracking price drops.
          </p>
          
          {/* Mobile-Optimized Product URL Input */}
          <div className="max-w-2xl mx-auto">
            <div className={`flex gap-2 sm:gap-4 ${isMobile ? 'flex-col' : 'flex-row'}`}>
              <Input
                placeholder="Enter Cashify Product Link"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className={`border-input focus:border-primary focus:ring-primary bg-background ${
                  isMobile ? 'h-12 text-base' : 'h-14 text-lg'
                }`}
              />
              <Button
                onClick={handleTrackProduct}
                className={`bg-gradient-to-r from-gradient-start to-gradient-end hover:from-blue-700 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${
                  isMobile ? 'h-12 text-base' : 'h-14 px-8 text-lg'
                }`}
              >
                Track
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {productsLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your tracked products...</p>
          </div>
        )}

        {/* Mobile-Optimized Tracked Products Grid */}
        {!productsLoading && trackedProducts.length > 0 && (
          <div className={`grid gap-4 sm:gap-6 ${
            isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {trackedProducts.map((product) => (
              <Card key={product.id} className="shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border-0 animate-fade-in bg-warm-yellow">
                <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
                  {/* Product Image */}
                  <div className="mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full object-contain rounded-lg bg-white/80 ${
                        isMobile ? 'h-32' : 'h-48'
                      }`}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className={`font-semibold text-foreground line-clamp-2 ${
                      isMobile ? 'text-base' : 'text-lg'
                    }`}>
                      {product.name}
                    </h3>
                    
                    {/* Price Section */}
                    <div className="flex items-center space-x-2 flex-wrap">
                      <Badge variant="destructive" className="bg-rose-red">
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
                    
                    {/* Price History */}
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
                    
                    {/* Mobile-Optimized Actions */}
                    <div className={`flex pt-4 ${
                      isMobile ? 'flex-col space-y-2' : 'space-x-2'
                    }`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`flex items-center justify-center space-x-1 ${
                          isMobile ? 'w-full' : 'flex-1'
                        }`}
                        onClick={() => window.open(product.productUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Product</span>
                      </Button>
                      
                      <div className={`flex ${isMobile ? 'space-x-2' : 'space-x-2'}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-primary hover:text-primary hover:bg-blue-50 ${
                            isMobile ? 'flex-1' : ''
                          }`}
                          onClick={() => handleSendTestAlert(product)}
                          title="Send test price alert email"
                        >
                          <Mail className="h-4 w-4" />
                          {isMobile && <span className="ml-1">Test Alert</span>}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className={`text-rose-red hover:text-rose-red hover:bg-red-50 ${
                            isMobile ? 'flex-1' : ''
                          }`}
                          onClick={() => deleteTrackedProduct(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                          {isMobile && <span className="ml-1">Delete</span>}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!productsLoading && trackedProducts.length === 0 && (
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
        )}
      </div>

      {/* Tracking Dialog */}
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
