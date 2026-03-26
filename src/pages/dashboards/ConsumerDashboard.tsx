import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MapPin, Truck, Package, Star, Bell, BarChart } from "lucide-react";
import { orderService, Order } from "@/services/order.service";
import { useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { toast } from "@/hooks/use-toast";
import { logout } from "@/utils/auth";
import { socketService } from "@/services/socket.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConsumerAnalytics from "@/components/consumer/ConsumerAnalytics";

const ConsumerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getTotal, getTotalItems } = useConsumerCart();
  const [isLocating, setIsLocating] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await orderService.getOrders();
      setOrders(fetchedOrders || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch orders";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getActiveOrders = () => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
    );
  };

  const calculateTotalSavings = () => {
    // Calculate savings based on the margin difference
    return orders.reduce((total, order) => {
      return total + (order.totalAmount * 0.1); // Assuming 10% average savings
    }, 0);
  };

  // Function to update user location
  const updateLocation = () => {
    setIsLocating(true);
    
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Update consumer location via socket
        socketService.updateConsumerLocation({
          lat: latitude,
          lng: longitude,
          radius: 2000 // 2km radius
        });
        
        toast({
          title: "Location Updated",
          description: "Your location has been updated. You'll be notified of nearby vendors.",
        });
        
        setIsLocating(false);
        
        // Navigate to nearby vendors page
        navigate('/consumer/nearby-vendors');
      },
      (error) => {
        console.error("Error getting location:", error);
        
        let errorMessage = "Unable to get your location";
        if (error.code === 1) {
          errorMessage = "Location access denied. Please enable location services.";
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Function to test proximity notifications
  const testProximityNotification = () => {
    try {
      // Create test vendor data
      const testVendor = {
        vendorId: 'test-vendor-' + Date.now(),
        vendorName: 'Test Vendor Cart',
        distance: 320, // 320 meters
        businessType: 'Vegetable Cart',
        coordinates: [75.7006336, 31.2508416] // Sample coordinates
      };
      
      // Direct access to the notification handler
      // This is for testing purposes only
      const vendorCallbacks = (socketService as any).vendorNearbyCallbacks;
      if (vendorCallbacks && vendorCallbacks.length > 0) {
        vendorCallbacks.forEach((callback: Function) => {
          try {
            callback(testVendor);
          } catch (error) {
            console.error('Error in callback:', error);
          }
        });
        
        toast({
          title: "Test Notification",
          description: "A test vendor proximity notification has been triggered.",
        });
      } else {
        toast({
          title: "No Handler",
          description: "No proximity notification handler is registered.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification. Check console for details.",
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10 px-4">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'Customer'}!</h1>
            <p className="text-muted-foreground">Manage your orders and track deliveries</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 border-[#138808]/30"
              onClick={updateLocation}
              disabled={isLocating}
            >
              {isLocating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#138808]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Locating...
                </span>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Nearby Vendors
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("analytics")}
              className={activeTab === "analytics" ? 
                "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 border-[#138808]/30" : 
                ""}
            >
              <BarChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            <Button 
              variant="outline" 
              className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-300"
              onClick={testProximityNotification}
            >
              <Bell className="mr-2 h-4 w-4" />
              Test Notification
            </Button>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#138808]" />
                    Active Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{getActiveOrders().length}</div>
                  <p className="text-sm text-muted-foreground">Orders in progress</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#FF9933]" />
                    Delivery Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {getActiveOrders().filter(order => order.status === 'in-transit').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Orders out for delivery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#138808]" />
                    Total Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">₹{calculateTotalSavings().toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Saved on your orders</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Track and manage your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#138808]"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center p-4 text-red-500">{error}</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center p-6">
                      <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium mb-1">No orders yet</h3>
                      <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
                      <Button onClick={() => navigate("/marketplace")}>
                        Browse Marketplace
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order._id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100' :
                              order.status === 'in-transit' ? 'bg-blue-100' :
                              order.status === 'accepted' ? 'bg-yellow-100' :
                              'bg-gray-100'
                            }`}>
                              <Truck className={`h-5 w-5 ${
                                order.status === 'delivered' ? 'text-green-600' :
                                order.status === 'in-transit' ? 'text-blue-600' :
                                order.status === 'accepted' ? 'text-yellow-600' :
                                'text-gray-600'
                              }`} />
                            </div>
                            <div>
                              <p className="font-medium">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()} • 
                                {order.items.length} items • ₹{order.totalAmount}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'accepted' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <Button 
                              variant="outline"
                              onClick={() => navigate(`/orders/${order._id}`)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <ConsumerAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default ConsumerDashboard;
