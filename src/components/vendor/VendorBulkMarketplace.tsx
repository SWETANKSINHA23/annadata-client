import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Package, Truck, Search, ShoppingCart, Filter, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { Product } from "@/types/product";
import { bulkOrderService, BulkPurchaseInput } from "@/services/bulk-order.service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { loadRazorpayScript, createRazorpayOrder, verifyRazorpayPayment, RazorpayResponse } from "@/utils/razorpay";

interface Farmer {
  _id: string;
  name: string;
  farmName: string;
  farmLocation: {
    address: string;
  };
  primaryCrops: string[];
  averageRating: number;
}

interface OrderItem {
  productId: string;
  quantity: number;
  productName: string;
  price: number;
  unit: string;
}

const VendorBulkMarketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod"); // cod or online
  
  useEffect(() => {
    fetchFarmers();
  }, []);
  
  useEffect(() => {
    if (selectedFarmer) {
      fetchFarmerProducts(selectedFarmer._id);
    }
  }, [selectedFarmer]);
  
  useEffect(() => {
    // We no longer try to update from user data that might not exist
    // Instead, let the user enter these details manually
  }, [user]);
  
  const fetchFarmers = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching farmers for bulk marketplace');
      
      const response = await api.get('/users/farmers');
      console.log(`Received ${response.data.length} farmers:`, response.data);
      
      setFarmers(response.data);
      
      // If farmers exist, select the first one by default
      if (response.data.length > 0) {
        setSelectedFarmer(response.data[0]);
      } else {
        console.log('No farmers available');
        setSelectedFarmer(null);
      }
    } catch (error: any) {
      console.error('Error fetching farmers:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      setFarmers([]);
      setSelectedFarmer(null);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch farmers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchFarmerProducts = async (farmerId: string) => {
    try {
      setIsLoading(true);
      console.log(`Fetching products for farmer: ${farmerId}`);
      
      const response = await api.get(`/products/farmer/${farmerId}/bulk`);
      console.log(`Received ${response.data.length} products:`, response.data);
      
      setProducts(response.data);
    } catch (error: any) {
      console.error('Error fetching farmer products:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      setProducts([]);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch farmer products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const addToCart = (product: Product) => {
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      // Update quantity
      setCart(prev => prev.map(item => 
        item.productId === product._id 
          ? { ...item, quantity: item.quantity + (product.minQuantity || 10) }
          : item
      ));
    } else {
      // Add new item with default minimum quantity
      setCart(prev => [...prev, {
        productId: product._id,
        quantity: product.minQuantity || 10,
        productName: product.name,
        price: product.price,
        unit: product.unit
      }]);
    }
    
    toast({
      title: "Added to cart",
      description: `${product.name} added to your cart`,
    });
  };
  
  const addToCartWithQuantity = (product: Product, quantity: number) => {
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      // Update quantity
      setCart(prev => prev.map(item => 
        item.productId === product._id 
          ? { ...item, quantity: quantity }
          : item
      ));
    } else {
      // Add new item with specified quantity
      setCart(prev => [...prev, {
        productId: product._id,
        quantity: quantity,
        productName: product.name,
        price: product.price,
        unit: product.unit
      }]);
    }
    
    toast({
      title: "Added to cart",
      description: `${quantity}${product.unit} of ${product.name} added to your cart`,
    });
  };
  
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    ));
  };
  
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }
    
    // Set default delivery date to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDeliveryDate(defaultDate.toISOString().split('T')[0]);
    
    setIsCheckoutOpen(true);
  };
  
  const handlePlaceOrder = async () => {
    // Check for specific missing requirements one by one for better user feedback
    if (!selectedFarmer) {
      toast({
        title: "Missing Selection",
        description: "Please select a farmer first",
        variant: "destructive",
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before placing an order",
        variant: "destructive",
      });
      return;
    }
    
    if (!deliveryDate) {
      toast({
        title: "Missing Information",
        description: "Please select a delivery date",
        variant: "destructive",
      });
      return;
    }
    
    if (!street || !city || !state || !pincode) {
      toast({
        title: "Address Incomplete",
        description: "Please complete all address fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsPlacingOrder(true);
      
      // Prepare order data
      const orderData: BulkPurchaseInput = {
        farmerId: selectedFarmer._id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        deliveryAddress: {
          street,
          city,
          state,
          pincode
        },
        deliveryDate
      };
      
      console.log('Placing bulk order with data:', orderData);
      
      // If using Cash on Delivery, directly create the order
      if (paymentMethod === "cod") {
        try {
          const response = await bulkOrderService.createBulkPurchase(orderData);
          console.log('Bulk order created successfully:', response);
          
          // Clear cart and close checkout
          clearCart();
          setIsCheckoutOpen(false);
          
          // Show success message
          toast({
            title: "Order Placed",
            description: "Your bulk order has been placed successfully",
          });
          
          // Redirect to orders page
          navigate('/vendor/orders');
          return;
        } catch (error) {
          console.error('Error creating bulk order with COD:', error);
          throw error;
        }
      }
      
      // If using online payment (Razorpay)
      // Initialize Razorpay payment
      const res = await loadRazorpayScript();
      
      if (!res) {
        toast({
          title: "Error",
          description: "Razorpay SDK failed to load. Please check your internet connection.",
          variant: "destructive",
        });
        setIsPlacingOrder(false);
        return;
      }
      
      // Calculate total amount in paise (Razorpay requires amount in smallest currency unit)
      const totalAmount = calculateTotal() * 100;
      
      // Create order on backend
      const response = await createRazorpayOrder(totalAmount, 'INR', `bulk-order-${Date.now()}`);
      
      if (!response || !response.id) {
        throw new Error("Failed to create Razorpay order");
      }
      
      const options = {
        key: "rzp_test_S3JYZogxWKuFHR", // Replace with your actual Razorpay key
        amount: totalAmount.toString(),
        currency: 'INR',
        name: "Annadata",
        description: "Bulk Order Payment",
        order_id: response.id,
        handler: async function (response: RazorpayResponse) {
          try {
            console.log('Razorpay payment successful:', response);
            
            // Verify payment
            const verification = await verifyRazorpayPayment(
              response.razorpay_order_id, 
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );
            
            console.log('Payment verification result:', verification);
            
            // If verification successful, create the bulk order
            const orderResponse = await bulkOrderService.createBulkPurchase(orderData);
            console.log('Bulk order created successfully after payment:', orderResponse);
            
            // Clear cart and close checkout
            clearCart();
            setIsCheckoutOpen(false);
            
            // Show success message
            toast({
              title: "Order Placed",
              description: "Your bulk order has been placed successfully",
            });
            
            // Redirect to orders page
            navigate('/vendor/orders');
          } catch (error) {
            console.error('Error verifying payment:', error);
            toast({
              title: "Payment Verification Failed",
              description: "Your payment was processed but couldn't be verified. Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: ''  // Leave this empty if there's no phone number available
        },
        notes: {
          address: `${street}, ${city}, ${state}, ${pincode}`
        },
        theme: {
          color: "#138808"
        }
      };
      
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: error instanceof Error && error.message ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const filteredProducts = products.filter(product => {
    let matches = true;
    
    // Filter by category
    if (filterCategory !== "all") {
      matches = matches && product.category === filterCategory;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      matches = matches && (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }
    
    return matches;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Farmer Marketplace</h2>
          <p className="text-muted-foreground">Purchase bulk products directly from farmers</p>
        </div>
        
        <div className="flex items-center">
          <Button 
            onClick={handleCheckout}
            className="flex gap-2 bg-[#138808] hover:bg-[#138808]/90"
            disabled={cart.length === 0}
          >
            <ShoppingCart className="h-4 w-4" />
            Checkout ({cart.length})
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Select Farmer</CardTitle>
            </CardHeader>
            <CardContent>
              {farmers.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No farmers available</p>
                </div>
              ) : (
                <Select
                  value={selectedFarmer?._id}
                  onValueChange={(value) => {
                    const farmer = farmers.find(f => f._id === value);
                    setSelectedFarmer(farmer || null);
                    // Clear cart when changing farmer
                    clearCart();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map(farmer => (
                      <SelectItem key={farmer._id} value={farmer._id}>
                        {farmer.farmName} - {farmer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
          
          {selectedFarmer && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Farmer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm text-muted-foreground">Name</h3>
                  <p>{selectedFarmer.name}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Farm Name</h3>
                  <p>{selectedFarmer.farmName}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Location</h3>
                  <p>{selectedFarmer.farmLocation.address}</p>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Primary Crops</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedFarmer.primaryCrops.map((crop, idx) => (
                      <Badge key={idx} variant="secondary">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-muted-foreground">Rating</h3>
                  <div className="flex items-center">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span 
                          key={i} 
                          className={`text-lg ${i < Math.floor(selectedFarmer.averageRating) ? 'text-yellow-500' : 'text-gray-300'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-1 text-sm">
                      ({selectedFarmer.averageRating.toFixed(1)})
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Cart Summary */}
          {cart.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Cart Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between py-1 border-b">
                    <div className="text-sm">
                      <span className="font-medium">{item.productName}</span>
                      <br />
                      <span className="text-muted-foreground">
                        {item.quantity} {item.unit} × ₹{item.price}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <br />
                      <button 
                        className="text-red-500 text-xs"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  className="w-full mt-2 bg-[#138808] hover:bg-[#138808]/90"
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Main Content */}
        <div className="md:col-span-3">
          {/* Search and Filters */}
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="crops">Crops</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          ) : !selectedFarmer ? (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 mx-auto text-gray-300" />
              <h3 className="mt-4 text-lg font-medium">Please select a farmer</h3>
              <p className="text-muted-foreground">
                Choose a farmer from the sidebar to view available products
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Package className="h-12 w-12 mx-auto text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium">No products found</h3>
                  <p className="text-muted-foreground">
                    This farmer doesn't have any products available for bulk purchase
                  </p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <Card key={product._id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-48 bg-gray-100 relative">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-12 w-12 text-gray-300" />
                        </div>
                      )}
                      <Badge 
                        className="absolute top-2 right-2 bg-[#138808]"
                      >
                        Bulk
                      </Badge>
                    </div>
                    
                    <CardHeader className="p-4 pb-0">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-4">
                      <div className="mt-1 mb-2">
                        <p className="line-clamp-2 text-sm text-gray-600">
                          {product.description}
                        </p>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Price:</span>
                        <span>₹{product.price.toLocaleString()}/{product.unit}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Available:</span>
                        <span>{product.stock} {product.unit}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Min. Order:</span>
                        <span>{product.minQuantity || 10} {product.unit}</span>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2 w-full mb-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => addToCartWithQuantity(product, 50)}
                          disabled={product.stock < 50}
                          className="text-xs"
                        >
                          Add 50{product.unit}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => addToCartWithQuantity(product, 100)}
                          disabled={product.stock < 100}
                          className="text-xs"
                        >
                          Add 100{product.unit}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 w-full">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => addToCartWithQuantity(product, 250)}
                          disabled={product.stock < 250}
                          className="text-xs"
                        >
                          Add 250{product.unit}
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => addToCartWithQuantity(product, 500)}
                          disabled={product.stock < 500}
                          className="text-xs"
                        >
                          Add 500{product.unit}
                        </Button>
                      </div>
                      <Button 
                        className="w-full mt-2 bg-[#138808] hover:bg-[#138808]/90"
                        onClick={() => addToCart(product)}
                      >
                        Custom Amount
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your bulk purchase from {selectedFarmer?.farmName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Items Summary */}
            <div className="space-y-2">
              <h3 className="font-medium">Order Items</h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between py-1 border-b">
                    <div>
                      <span className="font-medium">{item.productName}</span>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center border rounded">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => {
                              const newQuantity = Math.max((products.find(p => p._id === item.productId)?.minQuantity || 10), item.quantity - 10);
                              updateCartItemQuantity(item.productId, newQuantity);
                            }}
                            disabled={item.quantity <= (products.find(p => p._id === item.productId)?.minQuantity || 10)}
                          >
                            <span className="text-lg">-</span>
                          </Button>
                          <Input
                            type="number"
                            min={(products.find(p => p._id === item.productId)?.minQuantity || 10)}
                            max={products.find(p => p._id === item.productId)?.stock || 999}
                            value={item.quantity}
                            onChange={(e) => updateCartItemQuantity(item.productId, Number(e.target.value))}
                            className="w-16 h-7 text-center border-0"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-none"
                            onClick={() => {
                              const maxStock = products.find(p => p._id === item.productId)?.stock || 999;
                              const newQuantity = Math.min(maxStock, item.quantity + 10);
                              updateCartItemQuantity(item.productId, newQuantity);
                            }}
                            disabled={item.quantity >= (products.find(p => p._id === item.productId)?.stock || 999)}
                          >
                            <span className="text-lg">+</span>
                          </Button>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">{item.unit}</span>
                      </div>
                      <div className="text-xs mt-1">
                        <span className="text-gray-500">
                          Max available: {products.find(p => p._id === item.productId)?.stock || 0} {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        ₹{item.price}/{item.unit} × {item.quantity}
                      </div>
                      <button
                        className="text-red-500 text-xs mt-1"
                        onClick={() => removeFromCart(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            
            {/* Delivery Information */}
            <div className="space-y-2">
              <h3 className="font-medium">Delivery Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Expected Delivery Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="deliveryDate"
                    type="date"
                    className="pl-10"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="border rounded-md p-3">
                <h4 className="font-medium mb-2">Delivery Address</h4>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="Enter street address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="Pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Options */}
            <div className="space-y-2">
              <h3 className="font-medium">Payment Options</h3>
              
              <div className="border rounded-md p-3">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="payment-cod" 
                    name="payment" 
                    value="cod" 
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />
                  <Label htmlFor="payment-cod" className="cursor-pointer">Cash on Delivery</Label>
                </div>
                
                <div className="flex items-center space-x-2 mt-2">
                  <input 
                    type="radio" 
                    id="payment-online" 
                    name="payment" 
                    value="online" 
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                  />
                  <Label htmlFor="payment-online" className="cursor-pointer">Pay Online (Razorpay)</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCheckoutOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#138808] hover:bg-[#138808]/90"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder || cart.length === 0 || !deliveryDate}
            >
              {isPlacingOrder ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                  Processing...
                </>
              ) : (
                <>Place Order</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorBulkMarketplace; 