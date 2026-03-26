import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  BarChart,
  Settings,
  LogOut,
  Bell,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const AdminNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === `/admin${path}`;
  };

  return (
    <nav className="flex flex-col space-y-1">
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-500 px-3 py-2">MAIN</p>
        <Link to="/admin/dashboard">
          <Button 
            variant={isActive('/dashboard') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              isActive('/dashboard') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>
      </div>
      
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-500 px-3 py-2">MANAGEMENT</p>
        <Link to="/admin/users">
          <Button 
            variant={isActive('/users') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start mb-1",
              isActive('/users') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <Users className="mr-2 h-4 w-4" />
            User Management
          </Button>
        </Link>
        
        <Link to="/admin/products">
          <Button 
            variant={isActive('/products') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start mb-1",
              isActive('/products') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <Package className="mr-2 h-4 w-4" />
            Products
          </Button>
        </Link>
        
        <Link to="/admin/orders">
          <Button 
            variant={isActive('/orders') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              isActive('/orders') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Orders
            <Badge className="ml-auto bg-red-500 hover:bg-red-600">5</Badge>
          </Button>
        </Link>
      </div>
      
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-500 px-3 py-2">REPORTS</p>
        <Link to="/admin/analytics">
          <Button 
            variant={isActive('/analytics') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start",
              isActive('/analytics') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </Link>
      </div>
      
      <div className="mb-2">
        <p className="text-xs font-semibold text-gray-500 px-3 py-2">SYSTEM</p>
        <Link to="/admin/notifications">
          <Button 
            variant={isActive('/notifications') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start mb-1",
              isActive('/notifications') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
            <Badge className="ml-auto">3</Badge>
          </Button>
        </Link>
        
        <Link to="/admin/settings">
          <Button 
            variant={isActive('/settings') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start mb-1",
              isActive('/settings') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </Link>
        
        <Link to="/admin/help">
          <Button 
            variant={isActive('/help') ? "default" : "ghost"} 
            className={cn(
              "w-full justify-start mb-1",
              isActive('/help') ? "bg-[#138808]/10 text-[#138808] hover:bg-[#138808]/20 hover:text-[#138808]" : ""
            )}
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
        </Link>
      </div>
      
      <div className="mt-auto pt-4">
        <Separator className="my-4" />
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default AdminNav; 