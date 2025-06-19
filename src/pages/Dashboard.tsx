
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash, ArrowUp, ArrowDown, ExternalLink, LogOut, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TrackingDialog from "@/components/TrackingDialog";
import { supabase } from "@/integrations/supabase/client";
import { useEmailNotifications } from "@/hooks/useEmailNotifications";
import { useTrackedProducts } from "@/hooks/useTrackedProducts";
import type { User } from "@supabase/supabase-js";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [productUrl, setProductUrl] = useState("");
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendPriceAlert } = useEmailNotifications();
  
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
        navigate('/login');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate('/login');
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
    navigate('/login');
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-indigo"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Top Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-gray">💰 CashiFracker</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">{user.email}</span>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-slate-gray mb-4">
            Your Refurb Deal Tracker
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Paste any Cashify product link to begin tracking price drops.
          </p>
          
          {/* Product URL Input */}
          <div className="max-w-2xl mx-auto flex gap-4">
            <Input
              placeholder="Enter Cashify Product Link"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="h-14 text-lg border-gray-300 focus:border-blue-indigo focus:ring-blue-indigo"
            />
            <Button
              onClick={handleTrackProduct}
              className="h-14 px-8 bg-gradient-to-r from-gradient-start to-gradient-end hover:from-blue-700 hover:to-blue-600 text-white font-medium text-lg rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Track
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {productsLoading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-indigo mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tracked products...</p>
          </div>
        )}

        {/* Tracked Products Grid */}
        {!productsLoading && trackedProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trackedProducts.map((product) => (
              <Card key={product.id} className="shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 border-0 animate-fade-in">
                <CardContent className="p-6">
                  {/* Product Image */}
                  <div className="mb-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-contain rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-gray line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* Price Section */}
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive" className="bg-rose-red">
                        -{product.discount}%
                      </Badge>
                      <span className="text-2xl font-bold text-slate-gray">
                        {formatPrice(product.currentPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>
                    
                    {/* Price History */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-leaf-green">
                          <ArrowDown className="h-4 w-4" />
                          <span>Lowest Price:</span>
                        </div>
                        <span className="font-medium">{formatPrice(product.lowestPrice)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-rose-red">
                          <ArrowUp className="h-4 w-4" />
                          <span>Highest Price:</span>
                        </div>
                        <span className="font-medium">{formatPrice(product.highestPrice)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-gray-500">
                        <span>🕓 Last Checked:</span>
                        <span>{product.lastChecked}</span>
                      </div>
                      
                      {product.alertPrice && (
                        <div className="flex items-center justify-between text-blue-indigo font-medium">
                          <span>🔔 Alert at:</span>
                          <span>{formatPrice(product.alertPrice)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 flex items-center justify-center space-x-1"
                        onClick={() => window.open(product.productUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>View Product</span>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-indigo hover:text-blue-indigo hover:bg-blue-50"
                        onClick={() => handleSendTestAlert(product)}
                        title="Send test price alert email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-red hover:text-rose-red hover:bg-red-50"
                        onClick={() => deleteTrackedProduct(product.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
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
            <h3 className="text-2xl font-semibold text-slate-gray mb-2">
              No products tracked yet
            </h3>
            <p className="text-gray-600">
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
