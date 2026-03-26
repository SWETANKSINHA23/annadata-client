import { Suspense, lazy, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import AppNavbar from "./components/AppNavbar";
import EnhancedFooter from "./components/EnhancedFooter";
import KrishiMitra from "./components/KrishiMitra";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorProducts from "./pages/vendor/VendorProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import axios from 'axios';
import Chatbox from "./components/chatbot/Chatbot";
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import FarmerDashboard from '@/pages/dashboards/FarmerDashboard';
import VendorDashboard from '@/pages/dashboards/VendorDashboard';
import ConsumerDashboard from '@/pages/dashboards/ConsumerDashboard';
import AdminRoutes from '@/routes/admin.routes';
import { useAuth } from '@/hooks/use-auth';
import VendorProximityNotifier from "@/components/notifications/VendorProximityNotifier";
import OrderNotifier from "@/components/notifications/OrderNotifier";
import Homepage from "./components/homepage/home";
import MarketAnalysis from "./pages/market-prices/MarketAnalysis";
import AgricultureDashboard from './pages/agriculture'
import OrderDetails from "./pages/consumer/OrderDetails";
import About from "./pages/about/About";
import ContactPage from "./pages/contact/Contact";
import FAQPage from "./pages/FAQ/FAQ";

// Lazy load pages to improve initial load time
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const MarketAnalytics = lazy(() => import("./pages/dashboards/MarketAnalytics"));
const ManageProducts = lazy(() => import("./pages/farmer/ManageProducts"));
const Marketplace = lazy(() => import("./pages/vendor/Marketplace"));
const NearbyVendors = lazy(() => import("./pages/consumer/NearbyVendors"));
const Checkout = lazy(() => import("./pages/checkout/Checkout"));
const CropHealthDashboard = lazy(() => import("./pages/agriculture/CropHealthDashboard"));
const FeaturedProducts = lazy(() => import("./components/featured/FeaturedProducts"));
const VendorGrid = lazy(() => import("./components/featured/VendorGrid"));
const VendorExport = lazy(() => import("./pages/vendor/VendorExport"));
const FarmerMarketplace = lazy(() => import("./pages/vendor/FarmerMarketplace"));
const VendorOrders = lazy(() => import("./pages/vendor/VendorOrders"));

// Add a loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#138808] border-t-transparent"></div>
  </div>
);

// Layout component to handle logic for showing/hiding navbar and footer
const AppLayout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // Simulate checking if resources are loaded
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Determine if the current route is an auth page to hide navbar/footer
  const isAuthRoute = location.pathname === "/login" || 
                     location.pathname === "/register" || 
                     location.pathname === "/forgot-password";
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Check if user is a consumer to show vendor notifications
  const isConsumer = user?.role === 'consumer';
  // Check if user is a vendor to show order notifications
  const isVendor = user?.role === 'vendor';
  
  return (
    <div className="bg-[#F2FCE2] min-h-screen">
      {!isAuthRoute && <AppNavbar />}
      <main>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Homepage/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/contact" element={<ContactPage/>} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/market-prices" element={<MarketAnalysis/>} />
            <Route path="/explore" element={<VendorGrid/>}/>
            <Route path="/featured" element={<FeaturedProducts />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard/farmer" element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/vendor" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/consumer" element={
              <ProtectedRoute allowedRoles={["consumer"]}>
                <ConsumerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={<MarketAnalytics />} />
            <Route path="/dashboard/agriculture" element={<AgricultureDashboard />} />
            <Route path="/agriculture/crop-health" element={<AgricultureDashboard />} />
            <Route path="/farmer/products" element={
              <ProtectedRoute allowedRoles={["farmer"]}>
                <ManageProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/products" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/products/:id" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <ManageProducts />
              </ProtectedRoute>
            } />
            <Route path="/vendor/marketplace" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <FarmerMarketplace />
              </ProtectedRoute>
            } />
            <Route path="/vendor/dashboard" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/vendor/analytics" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/vendor/export" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorExport />
              </ProtectedRoute>
            } />
            <Route path="/vendor/orders" element={
              <ProtectedRoute allowedRoles={["vendor"]}>
                <VendorOrders />
              </ProtectedRoute>
            } />
            <Route path="/consumer/nearby-vendors" element={<NearbyVendors />} />
            <Route path="/checkout" element={
              <ProtectedRoute allowedRoles={["consumer"]}>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/admin/*" element={<AdminRoutes />} />
            <Route path="/orders/:orderId" element={
              <ProtectedRoute allowedRoles={["consumer"]}>
                <OrderDetails />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAuthRoute && <EnhancedFooter />}
      <KrishiMitra />
      
      {/* Conditionally render notification components based on user role */}
      {isAuthenticated && isConsumer && <VendorProximityNotifier />}
      {isAuthenticated && isVendor && <OrderNotifier />}
    </div>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // Cache data for 1 minute
      refetchOnWindowFocus: false, // Disable automatic refetch on window focus
      retry: 1, // Reduce retry attempts
    },
  },
});

const App = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
