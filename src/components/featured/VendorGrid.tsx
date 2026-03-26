import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { useAuth } from "@/hooks/use-auth";
import { 
  Store, 
  MapPin, 
  ShoppingBag, 
  Map as MapIcon, 
  List, 
  AlertCircle, 
  Star, 
  RefreshCw, 
  Package, 
  AlertTriangle, 
  Loader2,
  ShoppingCart 
} from "lucide-react";
import type { Product } from "@/types/product";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NearbyVendorsMap from "../vendor/NearbyVendorsMap";
import NearbyVendorNotification from "../vendor/NearbyVendorNotification";
import ExploreProducts, { ProductWithVendor } from "./ExploreProducts";
import { socketService } from '@/services/socket.service';

// Lazy loaded components for better performance
const HowItWorks = lazy(() => import("../HowItWorks"));
const FeaturedProducts = lazy(() => import("./FeaturedProducts"));
const MarketPrices = lazy(() => import("../MarketPrices"));
const Reviews = lazy(() => import("../Reviews"));
const Contact = lazy(() => import("../Contact"));
const Footer = lazy(() => import("../Footer"));

interface VendorGridProps {
  onVendorSelect?: (vendor: Vendor) => void;
}

interface Vendor {
  _id: string;
  name: string;
  businessName: string;
  businessType: string;
  businessLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  products: Array<any>;
  distance: number;
  averageRating: number;
  isOnline?: boolean;
  lastUpdate?: number;
  businessImage?: string;
}

// Loading component with skeleton design
const SectionLoading = () => (
  <div className="py-12">
    <div className="container mx-auto px-4">
      <div className="h-60 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    </div>
  </div>
);

// Enhanced ProductCard component with better design
const ProductCard = ({ product, onAddToCart }: { product: ProductWithVendor, onAddToCart: (product: ProductWithVendor) => void }) => {
  return (
    <Card key={product._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.images[0]?.url || '/placeholder.png'}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
        />
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-2 right-2 bg-amber-500">
            Only {product.stock} left
          </Badge>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Out of Stock</span>
          </div>
        )}
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
          <span className="font-bold text-lg text-green-700">₹{product.price}</span>
        </div>
        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
          <Store className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{product.sellerName}</span>
        </div>
        <CardDescription className="line-clamp-2 mt-1">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
            <span className="text-muted-foreground">
              ({product.totalRatings || 0})
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5 text-gray-500" />
            <span>{product.distance ? `${(product.distance / 1000).toFixed(1)}km` : ''}</span>
          </div>
        </div>
        <Button 
          className="w-full bg-green-700 hover:bg-green-800 transition-colors"
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};

const VendorGrid = ({ onVendorSelect }: VendorGridProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; radius?: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { addToCart } = useConsumerCart();
  const { isAuthenticated, isConsumer } = useAuth();
  const [vendorProducts, setVendorProducts] = useState<ProductWithVendor[]>([]);
  const [isProductsDialogOpen, setIsProductsDialogOpen] = useState(false);
  const [allNearbyProducts, setAllNearbyProducts] = useState<ProductWithVendor[]>([]);
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [nearbyVendor, setNearbyVendor] = useState<Vendor | null>(null);
  const [activeSection, setActiveSection] = useState('vendors');

  // Filter vendors by online status and distance
  useEffect(() => {
    if (vendors.length > 0) {
      // Apply filters: only show vendors that are online and within 500m
      const nearbyOnlineVendors = vendors.filter(vendor => 
        vendor.isOnline && 
        (vendor.distance !== undefined && vendor.distance <= 500)
      );
      
      // Update filtered vendors list
      setFilteredVendors(nearbyOnlineVendors);
      
      // Find closest vendor for notification
      if (nearbyOnlineVendors.length > 0 && !showNotification) {
        setNearbyVendor(nearbyOnlineVendors[0]);
        
        // Show notification after 3 seconds
        const timer = setTimeout(() => {
          setShowNotification(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [vendors, showNotification]);

  // Fetch products from all nearby vendors when vendor list changes
  useEffect(() => {
    const fetchAllNearbyProducts = async () => {
      if (filteredVendors.length === 0) return;
      
      try {
        const allProducts: ProductWithVendor[] = [];
        
        // Limit to max 3 vendors to prevent too many requests
        const vendorsToFetch = filteredVendors.slice(0, 3);
        
        for (const vendor of vendorsToFetch) {
          const response = await api.get(`/products/vendor/${vendor._id}`);
          const vendorProducts = response.data.map((product: ProductWithVendor) => ({
            ...product,
            sellerName: vendor.businessName || vendor.name,
            distance: vendor.distance
          }));
          
          allProducts.push(...vendorProducts);
        }
        
        setAllNearbyProducts(allProducts);
      } catch (error) {
        console.error('Error fetching nearby products:', error);
      }
    };
    
    fetchAllNearbyProducts();
  }, [filteredVendors]);

  // Memoize the vendor update handler
  const handleVendorUpdate = useCallback((updatedVendors: Vendor[]) => {
    if (updatedVendors && Array.isArray(updatedVendors)) {
      // Sort vendors by distance
      const sortedVendors = [...updatedVendors].sort((a, b) => 
        (a.distance || 0) - (b.distance || 0)
      );
      
      setVendors(sortedVendors);
      setLoading(false);
      setError(null);
    } else {
      // If no vendors, just set empty array
      setVendors([]);
      setLoading(false);
      setError(null);
    }
  }, []);

  // Initialize location and vendor updates
  const initializeLocation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Initialize socket connection first
      await socketService.connect();

      // Set up vendor updates listener before requesting location
      const cleanup = socketService.onNearbyVendorsUpdate((updatedVendors) => {
        handleVendorUpdate(updatedVendors);
      });

      // Get precision location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Update state with user location
      const location = { lat: latitude, lng: longitude, radius: searchRadius };
      setUserLocation(location);
      
      // Request nearby vendors with initial position
      socketService.requestNearbyVendors(location);
      
      // Set location watch for continued updates
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setUserLocation(prev => ({ ...prev, lat, lng }));
          
          if (socketService.isConnected()) {
            socketService.requestNearbyVendors({
              lat,
              lng,
              radius: searchRadius
            });
          }
        },
        (err) => {
          console.error('Location watch error:', err);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
      
      setLoading(false);

      // Return cleanup function for component unmount
      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        cleanup();
      };
    } catch (error) {
      console.error('Error initializing location:', error);
      setLoading(false);
      
      let message = 'An error occurred while getting your location.';
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location services to find nearby vendors.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try again later.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        }
      }
      
      setError(message);
      return () => {};
    }
  }, [searchRadius, handleVendorUpdate]);

  useEffect(() => {
    const auth = useAuth.getState();
    let mounted = true;
    let cleanupFunction: (() => void) | undefined;

    const initialize = async () => {
      try {
        if (auth.token) {
          cleanupFunction = await initializeLocation();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        setLoading(false);
        setError('Failed to initialize. Please try again.');
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (cleanupFunction) {
        cleanupFunction();
      }
    };
  }, [initializeLocation, retryCount]);

  const handleVendorSelect = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    
    try {
      setVendorProducts([]);
      const response = await api.get(`/products/vendor/${vendor._id}`);
      setVendorProducts(response.data);
      setIsProductsDialogOpen(true);
      
      if (onVendorSelect) {
        onVendorSelect(vendor);
      }
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor products. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: ProductWithVendor) => {
    try {
      addToCart(product as unknown as Product, 1);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  const renderVendorCard = (vendor: Vendor) => {
    // Check if vendor is valid
    if (!vendor || !vendor._id) {
      return null;
    }
    
    // Determine which default image to use
    let defaultImage = '/placeholder.jpg';
    
    return (
      <Card key={vendor._id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={vendor.businessImage || defaultImage}
            alt={vendor.businessName || vendor.name}
            className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = defaultImage;
            }}
          />
          {vendor.isOnline && (
            <Badge className="absolute top-2 right-2 bg-green-500 text-white">Online</Badge>
          )}
        </div>
        <CardHeader className="p-4">
          <CardTitle className="line-clamp-1">{vendor.businessName || vendor.name}</CardTitle>
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-muted-foreground">
                {vendor.distance ? `${(vendor.distance / 1000).toFixed(2)} km away` : 'Distance unknown'}
              </span>
            </div>
            <Badge variant="outline" className="text-xs">
              {vendor.businessType || 'Vendor'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{vendor.averageRating?.toFixed(1) || '0.0'}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {vendor.lastUpdate ? `Updated ${new Date(vendor.lastUpdate).toLocaleDateString()}` : ''}
            </span>
          </div>
          <Button
            className="w-full bg-green-700 hover:bg-green-800 transition-colors"
            onClick={() => handleVendorSelect(vendor)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            View Products
          </Button>
        </CardContent>
      </Card>
    );
  };

  const navItems = [
    { id: 'vendors', label: 'Vendors' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'featured', label: 'Featured Products' },
    { id: 'market', label: 'Market Prices' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section with navigation */}
      <div className="bg-gradient-to-r from-green-900 to-green-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Find Local Vendors</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Discover fresh produce and quality products directly from local vendors in your neighborhood
          </p>
          
          {/* Navigation pills */}
          <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2 max-w-full">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeSection === item.id 
                    ? 'bg-white text-green-800 font-medium' 
                    : 'bg-green-800/40 hover:bg-green-800/60'
                }`}
                onClick={() => {
                  setActiveSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          {/* Search radius control */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white/10 p-1 rounded-full flex items-center">
              <button 
                className={`px-6 py-2 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-white text-green-800' : 'text-white'}`}
                onClick={() => setViewMode('grid')}
              >
                <List className="h-5 w-5 inline mr-2" />
                Grid View
              </button>
              <button 
                className={`px-6 py-2 rounded-full transition-colors ${viewMode === 'map' ? 'bg-white text-green-800' : 'text-white'}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-5 w-5 inline mr-2" />
                Map View
              </button>
            </div>
            
            <div className="flex items-center bg-white/10 rounded-full p-1 pl-4">
              <Label htmlFor="search-radius" className="text-sm whitespace-nowrap mr-2">
                Search Radius:
              </Label>
              <Select 
                value={searchRadius.toString()} 
                onValueChange={(value) => setSearchRadius(parseInt(value))}
              >
                <SelectTrigger className="w-[120px] border-0 bg-white/10 text-white">
                  <SelectValue placeholder="5km" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500m</SelectItem>
                  <SelectItem value="1000">1km</SelectItem>
                  <SelectItem value="2000">2km</SelectItem>
                  <SelectItem value="5000">5km</SelectItem>
                  <SelectItem value="10000">10km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main content section */}
        <section id="vendors" className="mb-16">
          {/* Location error alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={initializeLocation}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* No location alert */}
          {!userLocation && !loading && isAuthenticated && !error && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Location access required</AlertTitle>
              <AlertDescription>
                Please enable location services to find nearby vendors.
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={initializeLocation}
                >
                  Enable Location
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-green-700 mx-auto mb-4" />
                <p className="text-green-800 font-medium">Finding nearby vendors...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Map View */}
              {viewMode === 'map' && (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                  <div className="h-[650px]">
                    {userLocation ? (
                      <NearbyVendorsMap 
                        vendors={vendors} 
                        currentLocation={userLocation} 
                        onMarkerClick={handleVendorSelect}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-100">
                        <div className="text-center p-8">
                          <MapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-xl font-medium text-gray-600">Map view requires location access</h3>
                          <p className="text-gray-500 mt-2 max-w-md">
                            Please enable location services to view nearby vendors on the map
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Featured Products Section */}
        <section id="featured" className="py-16">
          <Suspense fallback={<SectionLoading />}>
            <FeaturedProducts />
          </Suspense>
        </section>

              {/* Grid View */}
              {viewMode === 'grid' && (
                <>
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      {filteredVendors.length > 0 
                        ? 'Nearby Vendors Ready to Serve You' 
                        : 'Find Vendors Near You'}
                    </h2>
                    
                    {filteredVendors.length === 0 ? (
                      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <Store className="h-16 w-16 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-xl font-medium text-gray-700">No nearby vendors found</h3>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                          {isAuthenticated 
                            ? "There are no vendors online within 500m of your location. Try exploring products from all vendors."
                            : "Log in to find vendors near your location, or explore products without logging in."
                          }
                        </p>
                        <div className="mt-6">
                          {!isAuthenticated ? (
                            <Button 
                              className="bg-green-700 hover:bg-green-800"
                              onClick={() => navigate('/login')}
                            >
                              Login to Find Nearby Vendors
                            </Button>
                          ) : (
                            <Button 
                              className="bg-green-700 hover:bg-green-800"
                              onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                              Explore Featured Products
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredVendors.map(renderVendorCard)}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Nearby Products */}
              {!loading && allNearbyProducts.length > 0 && (
                <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">Products Near You</h2>
                  <p className="text-gray-500 mb-6">Fresh products available from vendors in your area</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {allNearbyProducts.slice(0, 8).map(product => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                  {allNearbyProducts.length > 8 && (
                    <div className="mt-6 text-center">
                      <Button 
                        variant="outline" 
                        className="border-green-700 text-green-700 hover:bg-green-50"
                      >
                        View All Products
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
        
        
        {/* Market Prices Section */}
        <section id="market" className="py-16">
          <Suspense fallback={<SectionLoading />}>
            <MarketPrices />
          </Suspense>
        </section>
        
      </div>

      {/* Vendor Products Dialog */}
      <Dialog open={isProductsDialogOpen} onOpenChange={setIsProductsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-green-700" />
              {selectedVendor?.businessName || 'Vendor'} Products
            </DialogTitle>
            <DialogDescription>
              Browse products from {selectedVendor?.businessName || 'this vendor'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 mb-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200">
                <img 
                  src={selectedVendor.businessImage || '/placeholder.jpg'} 
                  alt={selectedVendor.businessName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{selectedVendor.businessName}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{selectedVendor.distance ? `${(selectedVendor.distance / 1000).toFixed(2)}km` : 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span>{selectedVendor.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <Badge className="ml-1">{selectedVendor.businessType}</Badge>
                </div>
              </div>
            </div>
          )}
          
          <div className="py-4">
            {vendorProducts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="h-16 w-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-medium text-gray-700">No products available</h3>
                <p className="mt-2 text-gray-500 max-w-md mx-auto">
                  This vendor does not have any products listed at the moment
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vendorProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Nearby vendor notification */}
      {showNotification && nearbyVendor && (
        <NearbyVendorNotification
          vendor={nearbyVendor}
          onClose={() => setShowNotification(false)}
          onViewProducts={() => {
            setShowNotification(false);
            handleVendorSelect(nearbyVendor);
          }}
        />
      )}
      
      {/* Floating cart button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          size="lg"
          className="rounded-full h-16 w-16 p-0 shadow-lg bg-green-700 hover:bg-green-800"
          onClick={() => navigate('/cart')}
        >
          <ShoppingCart className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default VendorGrid;