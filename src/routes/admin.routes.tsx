import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminDashboard from '@/pages/dashboards/AdminDashboard';
import UserDetails from '@/pages/admin/UserDetails';
import UserManagement from '@/pages/admin/UserManagement';
import ProductManagement from '@/pages/admin/ProductManagement';
import ProductDetails from '@/pages/admin/ProductDetails';
import OrderManagement from '@/pages/admin/OrderManagement';
import OrderDetails from '@/pages/admin/OrderDetails';
import AnalyticsPage from '@/pages/admin/Analytics';
import AdminLogin from '@/pages/auth/AdminLogin';
import AdminSettings from '@/pages/admin/Settings';
import HelpSupport from '@/pages/admin/HelpSupport';
import { lazy } from 'react';

// Lazy load notifications as it's not critical on first load
const NotificationsPanel = lazy(() => import('@/pages/admin/NotificationsPanel'));

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users/:userId" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/products" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProductManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/products/:productId" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProductDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/orders" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <OrderManagement />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/orders/:orderId" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <OrderDetails />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/analytics" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AnalyticsPage />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <NotificationsPanel />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminSettings />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/help" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <HelpSupport />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AdminRoutes; 