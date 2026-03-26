import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { consumers } from "@/data/mockData";
import { 
  Package, MapPin, Bell, TrendingUp, ShoppingBag, Users, ArrowUpRight, 
  Plus, Edit, Trash2, Check, AlertTriangle, Loader2, ArrowUpDown, 
  ChevronLeft, ChevronRight, Star, StarHalf, Percent, X, Download, 
  BarChart2, ShoppingCart
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NearbyVendorsMap from "@/components/vendor/NearbyVendorsMap";
import ProtectedRoute from "@/components/ProtectedRoute";
import { logout, getUser } from "@/utils/auth";
import { productService } from "@/services/product.service";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MarginModal from "@/components/vendor/MarginModal";
import NearbyConsumersMap from "@/components/vendor/NearbyConsumersMap";
import { socketService } from "@/services/socket.service";
import { useToast } from "@/components/ui/use-toast";
import type { Product } from "@/types/product";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/lib/axios";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorHotSpotsAnalytics from "@/components/vendor/VendorHotSpotsAnalytics";

const salesData = [
  { day: "Mon", sales: 2800 },
  { day: "Tue", sales: 3200 },
  { day: "Wed", sales: 3800 },
  { day: "Thu", sales: 3500 },
  { day: "Fri", sales: 4200 },
  { day: "Sat", sales: 4800 },
  { day: "Sun", sales: 4100 },
];

const productDistribution = [
  { name: "Rice", value: 35 },
  { name: "Wheat", value: 25 },
  { name: "Vegetables", value: 20 },
  { name: "Fruits", value: 20 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface FilterState {
  minPrice: string;
  maxPrice: string;
  sort: string;
  order: 'asc' | 'desc';
}

interface NearbyConsumer {
  _id: string;
  name: string;
  location: {
    coordinates: [number, number];
  };
  distance: number;
}

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'consumer' | 'vendor' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isConsumer: () => boolean;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  consumer?: {
    _id: string;
    name: string;
    email: string;
  };
  buyer?: {
    name: string;
  };
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [showLowStock, setShowLowStock] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: "",
    maxPrice: "",
    sort: "createdAt",
    order: "desc"
  });

  // Add new state for ratings analytics
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    ratingDistribution: [0, 0, 0, 0, 0] // 1 to 5 stars
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMarginModalOpen, setIsMarginModalOpen] = useState(false);
  const [nearbyConsumersCount, setNearbyConsumersCount] = useState(0);
  const [nearbyConsumers, setNearbyConsumers] = useState<NearbyConsumer[]>([]);
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const [showOrderNotification, setShowOrderNotification] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // New state variables for inventory alerts
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(10);
  
  // State for export options
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState<string | null>(null);
  
  // Calculate dashboard stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < alertThreshold).length;
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

  useEffect(() => {
    console.log('Initializing VendorDashboard...');
    const auth = useAuth.getState();
    console.log('Authentication status:', auth.token ? 'true' : 'false');

    let mounted = true;
    let cleanup: (() => void) | null = null;
    let watchId: number | null = null;

    const initialize = async () => {
      if (!auth.token) {
        console.log('No authentication token found, skipping initialization');
        return;
      }

      try {
        // Initialize socket first
        const socket = await socketService.initialize();
        if (!socket) {
          console.log('Failed to initialize socket connection');
          return;
        }

        // Set up order notification listener
        cleanup = socketService.onNewOrder((order) => {
          if (mounted) {
            console.log('Received new order:', order);
            setNewOrders(prev => [...prev, order]);
            setOrders(prev => [order, ...prev]);
            setShowOrderNotification(true);
            // Play notification sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(console.error);
          }
        });

        // Start location tracking after socket is ready
        watchId = await startLocationTracking();
        
        // Fetch orders immediately
        fetchOrders();
      } catch (error) {
        console.error('Initialization error:', error);
        setLocationError('Failed to initialize vendor services');
      }
    };

    initialize();

    return () => {
      console.log('Cleaning up VendorDashboard...');
      mounted = false;
      if (cleanup) {
        cleanup();
      }
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setIsTracking(false);
      }
      socketService.disconnect();
    };
  }, []);

  // Add useEffect to fetch products
  useEffect(() => {
    console.log('Fetching products with filters:', filters);
    fetchProducts();
  }, [currentPage, itemsPerPage, filters]);

  const startLocationTracking = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return null;
    }

    try {
        setIsTracking(true);
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const location = {
            lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      setCurrentLocation(location);
      await updateVendorLocation(location);

      // Start continuous location watching
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
        const newLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
        };
        setCurrentLocation(newLocation);
          await updateVendorLocation(newLocation);
        },
        (error) => {
          console.error('Location tracking error:', error);
          setLocationError('Failed to track location');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      return watchId;
    } catch (error) {
      console.error('Location tracking error:', error);
      setLocationError('Failed to start location tracking');
      setIsTracking(false);
      return null;
    }
  };

  // Function to get address from coordinates
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || 'Address not found';
    } catch (error) {
      console.error('Error getting address:', error);
      return 'Address not found';
    }
  };

  const updateVendorLocation = async (location: { lat: number; lng: number }) => {
    try {
      const address = await getAddressFromCoordinates(location.lat, location.lng);
      
      // Check if socket is connected before emitting
      const socket = await socketService.initialize();
      if (socket) {
        console.log('Emitting vendor location update:', {
          coordinates: [location.lng, location.lat],
          address
        });
        
        socket.emit('vendor:location:update', {
          coordinates: [location.lng, location.lat],
          address
        });
      } else {
        console.log('Socket not connected, using REST API for location update');
      }

      // Also update through REST API for persistence
      await fetch(`${import.meta.env.VITE_API_URL}/location/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          coordinates: [location.lng, location.lat],
          address
        })
      });
      
      // Check for nearby consumers after updating location
      console.log('Location updated successfully, checking for nearby consumers');
      await checkNearbyCustomers(location);
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: filters.sort,
        order: filters.order,
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice })
      });

      // Use the api service for consistency
      const response = await api.get(`/products/vendor/own?${queryParams}`);
      console.log('Fetched products:', response.data);
      
      // Handle different response formats
      const data = response.data;
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
        calculateRatingStats(data);
      } else if (data.products) {
      setProducts(data.products);
        setTotalPages(data.totalPages || Math.ceil(data.products.length / itemsPerPage));
      calculateRatingStats(data.products);
      } else {
        setProducts([]);
        setTotalPages(1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch products";
      setErrorMessage(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product._id !== id));
      toast({
        title: "Product Deleted",
        description: "The product has been removed from your inventory.",
      });
    } catch (error) {
      // Error is handled by the service
    }
  };

  const checkNearbyCustomers = async (location: { lat: number; lng: number }) => {
    try {
      console.log('Checking for nearby consumers at:', location);
      const response = await api.get(`/location/nearby/consumers?lat=${location.lat}&lng=${location.lng}&radius=2000`);
      
      if (response.data && Array.isArray(response.data.consumers)) {
        const consumers = response.data.consumers;
        console.log(`Found ${consumers.length} nearby consumers:`, consumers);
        setNearbyConsumers(consumers);
        setNearbyConsumersCount(consumers.length);
        
        // Show notification for newly discovered consumers
        if (consumers.length > 0) {
          toast({
            title: "Consumers Nearby!",
            description: `${consumers.length} consumers are in your area.`,
          });
        }
      } else {
        console.log('No nearby consumers found or invalid response format:', response.data);
        setNearbyConsumers([]);
        setNearbyConsumersCount(0);
      }
    } catch (error) {
      console.error('Error checking nearby consumers:', error);
      toast({
        title: "Error",
        description: "Failed to get nearby consumers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const lowStockCount = products.filter(item => item.stock < 20).length;
  const filteredProducts = showLowStock 
    ? products.filter(item => item.stock < 20) 
    : products;

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when limit changes
  };

  // Add function to calculate rating statistics
  const calculateRatingStats = (products: Product[]) => {
    const stats = {
      averageRating: 0,
      totalRatings: 0,
      ratingDistribution: [0, 0, 0, 0, 0]
    };

    products.forEach(product => {
      if (product.averageRating && product.totalRatings) {
        stats.averageRating += product.averageRating * product.totalRatings;
        stats.totalRatings += product.totalRatings;
        
        // Calculate distribution
        const rating = Math.round(product.averageRating);
        if (rating >= 1 && rating <= 5) {
          stats.ratingDistribution[rating - 1] += product.totalRatings;
        }
      }
    });

    if (stats.totalRatings > 0) {
      stats.averageRating /= stats.totalRatings;
    }

    setRatingStats(stats);
  };

  const handleAddProduct = () => {
    navigate('/products/new');
  };

  const handleEditProduct = (productId: string) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleOrderNotificationClose = () => {
    setShowOrderNotification(false);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderNotification(false);
  };

  const handleAcceptOrder = (orderId: string) => {
    socketService.emitOrderEvent('order:accept', { orderId });
    
    // Update order status in the local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'accepted' } 
          : order
      )
    );
    
    setSelectedOrder(null);
    toast({
      title: "Order Accepted",
      description: "You will be notified when the order is ready for delivery",
    });
  };

  const handleRejectOrder = (orderId: string) => {
    socketService.emitOrderEvent('order:reject', { orderId });
    
    // Update order status in the local state
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'rejected' } 
          : order
      )
    );
    
    setSelectedOrder(null);
    toast({
      title: "Order Rejected",
      description: "The customer will be notified",
    });
  };

  // Handle Export
  const handleExport = async (type: 'orders' | 'inventory' | 'sales') => {
    try {
      setIsExporting(true);
      setExportType(type);
      
      let endpoint = '';
      let filename = '';
      
      switch (type) {
        case 'orders':
          endpoint = '/export/orders';
          filename = 'vendor_orders.csv';
          break;
        case 'inventory':
          endpoint = '/export/inventory';
          filename = 'vendor_inventory.csv';
          break;
        case 'sales':
          endpoint = '/export/sales';
          filename = 'vendor_sales_analytics.csv';
          break;
      }
      
      const response = await api.get(endpoint, { responseType: 'blob' });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} data has been exported.`,
      });
    } catch (error) {
      console.error(`Export error (${type}):`, error);
      toast({
        title: "Export Failed",
        description: `Failed to export ${type} data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };
  
  // Add this new function for testing notification
  const testNotification = () => {
    console.log('Testing notification system...');
    
    // Create a test order
    const testOrder = {
      orderId: 'test-' + Date.now(),
      orderNumber: 'TEST-' + Math.floor(Math.random() * 10000),
      totalAmount: Math.floor(Math.random() * 5000) + 500,
      items: [
        {
          product: {
            _id: 'test-product',
            name: 'Test Product',
            price: 250
          },
          quantity: 2
        }
      ],
      customerName: 'Test Customer',
      timestamp: Date.now()
    };
    
    // Get vendor ID from API data or session
    // Using session object to retrieve user ID
    const auth = useAuth.getState();
    let vendorId = '';
    
    // Get ID from auth state
    if (auth?.user?.id) {
      vendorId = auth.user.id;
    } else {
      // Fallback to a fixed test ID
      console.warn('Could not get vendor ID from auth state, using test ID');
      vendorId = 'test-vendor-id';
    }
    
    // Manually emit an order event
    if (socketService.isConnected()) {
      socketService.emit('order:new', {
        vendorId,
        ...testOrder
      });
      
      toast({
        title: 'Test Notification Sent',
        description: 'The test notification has been sent to the socket server.',
      });
    } else {
      toast({
        title: 'Socket Not Connected',
        description: 'Please ensure you are connected to the socket server.',
        variant: 'destructive'
      });
    }
  };
  
  // Inventory Alert Functions
  const handleToggleAlerts = (enabled: boolean) => {
    setAlertsEnabled(enabled);
    // Save to backend
    saveAlertSettings(enabled, alertThreshold);
  };
  
  const handleSaveAlertSettings = () => {
    // Save to backend
    saveAlertSettings(alertsEnabled, alertThreshold);
  };
  
  const saveAlertSettings = async (enabled: boolean, threshold: number) => {
    try {
      await api.post('/inventory/alerts/settings', {
        enabled,
        threshold
      });
      
      toast({
        title: "Settings Saved",
        description: `Inventory alert settings have been updated.`,
      });
    } catch (error) {
      console.error('Save alert settings error:', error);
      toast({
        title: "Error",
        description: "Failed to save alert settings.",
        variant: "destructive",
      });
    }
  };
  
  // Fetch alert settings
  const fetchAlertSettings = async () => {
    try {
      // Attempt to fetch alert settings from the server
      const response = await api.get('/inventory/alerts/settings');
      const { enabled, threshold } = response.data;
      
      setAlertsEnabled(enabled);
      setAlertThreshold(threshold);
    } catch (error) {
      console.error('Fetch alert settings error:', error);
      // Set default values if the endpoint is not found (404) or other errors occur
      setAlertsEnabled(false);
      setAlertThreshold(10);
      
      // Don't show error toast for 404 - this is expected if the backend endpoint isn't implemented yet
      if (error.response && error.response.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load alert settings. Using defaults.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle margin save
  const handleMarginSave = async (productId: string, marginPercentage: number) => {
    try {
      await api.patch(`/products/${productId}/margin`, { marginPercentage });
      
      toast({
        title: "Margin Updated",
        description: "Product margin has been updated successfully.",
      });
      
      fetchProducts();
      setIsMarginModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Update margin error:', error);
      toast({
        title: "Error",
        description: "Failed to update product margin.",
        variant: "destructive",
      });
    }
  };
  
  // Add useEffect to fetch alert settings
  useEffect(() => {
    fetchAlertSettings();
  }, []);

  // Add fetchOrders function to load vendor orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await api.get('/orders/vendor');
      console.log('Fetched vendor orders:', response.data);
      if (Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  // Add this to initialize function to load orders
  useEffect(() => {
    fetchOrders();
  }, []);

  const renderOrderDialog = () => {
    return (
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.orderNumber}</DialogTitle>
            <DialogDescription>
              Order details and delivery information
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.product._id}
                      className="flex justify-between text-sm"
                    >
                      <span>{item.product.name} x {item.quantity}</span>
                      <span>₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-medium">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span>₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Delivery Address</h3>
                <p className="text-sm">
                  {selectedOrder.deliveryAddress.street}<br />
                  {selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}<br />
                  {selectedOrder.deliveryAddress.pincode}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => selectedOrder && handleAcceptOrder(selectedOrder._id)}
                >
                  Accept Order
                </Button>
                <Button
                  variant="outline"
                  className="w-full text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => selectedOrder && handleRejectOrder(selectedOrder._id)}
                >
                  Reject Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };
  
  const renderMarginModal = () => {
    return (
      <MarginModal 
        isOpen={isMarginModalOpen} 
        onClose={() => {
          setIsMarginModalOpen(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onUpdate={fetchProducts}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#138808]"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* Header section with fixed height */}
        <header className="bg-white border-b px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
              <h1 className="text-2xl font-bold text-[#138808]">Vendor Dashboard</h1>
              <p className="text-gray-500 text-sm">Welcome back, {user?.name}</p>
          </div>
            <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setIsTracking(!isTracking)}
                className={isTracking ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}
            >
              {isTracking ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Stop Tracking
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Start Location Tracking
                </>
              )}
            </Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>
        </header>

        {/* Main content area with max width and auto margins */}
        <main className="flex-grow bg-gray-50 px-6 py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Error alerts */}
        {locationError && (
              <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-center gap-2 py-3 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <p>{locationError}</p>
            </CardContent>
          </Card>
        )}

            {/* Quick access navigation cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link to="/vendor/dashboard">
            <Card className="hover:bg-gray-50 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <ShoppingBag className="h-8 w-8 mb-2 text-blue-500" />
                <h3 className="font-medium">Dashboard</h3>
                    <p className="text-xs text-muted-foreground">Overview</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/vendor/products">
            <Card className="hover:bg-gray-50 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <Package className="h-8 w-8 mb-2 text-green-500" />
                <h3 className="font-medium">Products</h3>
                    <p className="text-xs text-muted-foreground">Inventory</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/vendor/orders">
            <Card className="hover:bg-gray-50 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <ShoppingCart className="h-8 w-8 mb-2 text-purple-500" />
                <h3 className="font-medium">Orders</h3>
                    <p className="text-xs text-muted-foreground">Management</p>
              </CardContent>
            </Card>
          </Link>
          <Link to="/vendor/analytics">
            <Card className="hover:bg-gray-50 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <BarChart2 className="h-8 w-8 mb-2 text-orange-500" />
                <h3 className="font-medium">Analytics</h3>
                    <p className="text-xs text-muted-foreground">Reports</p>
              </CardContent>
            </Card>
          </Link>
              <Link to="/vendor/export">
            <Card className="hover:bg-gray-50 cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <Download className="h-8 w-8 mb-2 text-red-500" />
                    <h3 className="font-medium">Export</h3>
                    <p className="text-xs text-muted-foreground">Data</p>
              </CardContent>
            </Card>
          </Link>
        </div>

            {/* Stats overview with equal height cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Package className="h-4 w-4 mr-2 text-blue-500" /> 
                Total Products
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Active products in inventory</p>
            </CardContent>
          </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" /> 
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold">₹{totalValue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Current inventory value</p>
            </CardContent>
          </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Users className="h-4 w-4 mr-2 text-purple-500" /> 
                Nearby Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold">{nearbyConsumersCount}</div>
                  <p className="text-xs text-muted-foreground">
                    {isTracking ? 'Customers in your area' : 'Tracking disabled'}
              </p>
            </CardContent>
          </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-red-500" /> 
                    Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <div className="text-2xl font-bold">{lowStockProducts}</div>
                  <p className="text-xs text-muted-foreground">Products below threshold</p>
            </CardContent>
          </Card>
        </div>

            {/* Two-column layout for charts and data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={salesData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Sales']} />
                        <Line 
                          type="monotone" 
                          dataKey="sales" 
                          stroke="#138808" 
                          strokeWidth={2}
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
            </CardContent>
          </Card>

              {/* Product Distribution Chart */}
              <Card className="shadow-sm">
              <CardHeader>
                  <CardTitle>Product Distribution</CardTitle>
                  <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {productDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

              {/* Nearby Customers Map */}
              <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Nearby Customers</CardTitle>
                  <CardDescription>Potential customers in your area</CardDescription>
            </CardHeader>
                <CardContent className="p-0 overflow-hidden rounded-b-lg">
                  <div className="h-[280px] relative">
                {currentLocation ? (
                  <NearbyConsumersMap
                    vendorLocation={currentLocation}
                    consumers={nearbyConsumers}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center p-6">
                          <MapPin className="mx-auto h-10 w-10 text-gray-400" />
                          <h3 className="mt-2 text-gray-700 font-medium">Location unavailable</h3>
                          <p className="text-xs text-gray-500 mb-4">
                        Enable location services to see nearby customers
                      </p>
                      <Button 
                        variant="outline" 
                            size="sm"
                        onClick={startLocationTracking}
                      >
                        Enable Location
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

              {/* Rating Analytics */}
              <Card className="shadow-sm">
            <CardHeader>
                  <CardTitle>Rating Analytics</CardTitle>
                  <CardDescription>Customer satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
                  <div className="flex flex-col items-center mb-4">
                    <div className="relative h-28 w-28 flex items-center justify-center mb-2">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-3xl font-bold">{ratingStats.averageRating.toFixed(1)}</div>
                      </div>
                      <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f0f0f0" strokeWidth="2" />
                        <circle
                          cx="18"
                          cy="18"
                          r="16"
                          fill="none"
                          stroke="#FFB900"
                          strokeWidth="2"
                          strokeDasharray={`${(ratingStats.averageRating / 5) * 100} 100`}
                        />
                      </svg>
                    </div>
                    <div className="text-sm text-gray-500">{ratingStats.totalRatings} total ratings</div>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <div className="text-sm min-w-5">{rating}★</div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400" 
                            style={{ 
                              width: `${ratingStats.totalRatings > 0 ? 
                                (ratingStats.ratingDistribution[rating-1] / ratingStats.totalRatings) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 min-w-5 text-right">
                          {ratingStats.ratingDistribution[rating-1]}
                        </div>
                      </div>
                    ))}
              </div>
            </CardContent>
          </Card>
            </div>

            {/* Recent Orders Section */}
            {orders.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Latest customer orders</CardDescription>
                  </div>
                  {orders.length > 5 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/vendor/orders')}
                    >
                      View All
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
            </CardHeader>
            <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.slice(0, 5).map((order) => (
                          <TableRow key={order._id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{order.consumer?.name || order.buyer?.name || 'Anonymous'}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>₹{order.totalAmount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge className={
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                order.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'accepted' ? 'bg-amber-100 text-amber-800' :
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
              </div>
            </CardContent>
          </Card>
            )}

            {/* Products Table with equal height and proper alignment */}
            <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Latest Products</CardTitle>
                  <CardDescription>Recently added inventory</CardDescription>
              </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/vendor/products')}
                  >
                    View All
                </Button>
                  {/* <Button size="sm" onClick={handleAddProduct}>
                    <Plus className="mr-1 h-4 w-4" /> Add
                  </Button> */}
              </div>
            </CardHeader>
            <CardContent>
              {errorMessage ? (
                  <div className="text-center py-6">
                    <AlertTriangle className="mx-auto h-10 w-10 text-red-400" />
                    <p className="mt-2 text-gray-700">{errorMessage}</p>
                  <Button 
                    variant="outline" 
                      size="sm"
                    onClick={fetchProducts}
                    className="mt-4"
                  >
                    Retry
                  </Button>
                </div>
              ) : products.length === 0 ? (
                  <div className="text-center py-6">
                    <Package className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-gray-700">No products yet</h3>
                    <p className="text-xs text-gray-500 mb-4">
                    Add your first product to start selling
                  </p>
                  <Button 
                      size="sm"
                    onClick={handleAddProduct}
                  >
                    Add Product
                  </Button>
                </div>
              ) : (
                  <div className="overflow-x-auto -mx-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Stock</TableHead>
                          <TableHead className="text-right">Rating</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                      {products.slice(0, 5).map((product) => (
                          <TableRow key={product._id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell className="text-right">₹{product.price.toLocaleString()}</TableCell>
                            <TableCell className={`text-right ${product.stock < 10 ? 'text-red-600 font-medium' : ''}`}>
                              {product.stock}
                            </TableCell>
                            <TableCell className="text-right">
                            {product.averageRating ? (
                                <span>⭐ {product.averageRating.toFixed(1)}</span>
                              ) : (
                                <span className="text-gray-400">No ratings</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                            <Button
                                  variant="ghost"
                                  size="icon"
                              onClick={() => handleEditProduct(product._id)}
                            >
                                  <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                                  variant="ghost"
                                  size="icon" 
                                  className="text-red-500"
                              onClick={() => handleDeleteProduct(product._id)}
                            >
                                  <Trash2 className="h-4 w-4" />
                            </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))}
                      </TableBody>
                    </Table>
                </div>
              )}
            </CardContent>
          </Card>
            
            {/* Hot Spots Analytics Section */}
            <div>
              <VendorHotSpotsAnalytics />
              </div>
                </div>
        </main>
      </div>

      {renderOrderDialog()}
      {renderMarginModal()}

      {/* New Orders Notification */}
      {showOrderNotification && newOrders.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="w-80 shadow-lg border-green-100">
            <CardHeader className="bg-green-50 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-green-800 text-base">
                <ShoppingCart className="h-4 w-4 inline mr-2" />
                New Order Received!
              </CardTitle>
                <Button
                  variant="ghost"
                size="icon"
                className="h-6 w-6"
                  onClick={handleOrderNotificationClose}
                >
                  <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {newOrders.slice(0, 2).map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleViewOrder(order)}
                  >
                    <div>
                      <p className="font-medium text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} items • ₹{order.totalAmount}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7">
                      View
                    </Button>
                  </div>
                ))}
                {newOrders.length > 2 && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full text-xs" 
                    onClick={() => {
                      handleOrderNotificationClose();
                      navigate('/vendor/orders');
                    }}
                  >
                    View All Orders ({newOrders.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ProtectedRoute>
  );
};

export default VendorDashboard;
