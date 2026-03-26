import { useState, useEffect } from 'react';
import { socketService } from '@/services/socket.service';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Package, DollarSign } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface Order {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  items: any[];
  customerName: string;
  timestamp: number;
}

/**
 * Component to handle real-time order notifications for vendors
 * This component listens for new orders and displays a notification
 */
const OrderNotifier = () => {
  const [newOrder, setNewOrder] = useState<Order | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only set up for authenticated vendors
    if (!isAuthenticated || user?.role !== 'vendor') {
      console.log('OrderNotifier: User is not an authenticated vendor');
      return;
    }
    
    console.log('OrderNotifier: Setting up new order listener');
    
    // Register for new order notifications
    const cleanup = socketService.onNewOrder((orderData) => {
      console.log('OrderNotifier: Received new order:', orderData);
      
      // Play sound notification
      playOrderSound();
      
      // Show toast notification
      toast({
        title: 'New Order Received!',
        description: `Order #${orderData.orderNumber || 'New'} - ₹${orderData.totalAmount || 0}`,
      });
      
      // Set order data and show notification
      setNewOrder(orderData);
      setShowNotification(true);
      
      // Auto-hide after 15 seconds
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 15000);
      
      return () => clearTimeout(timer);
    });
    
    // Clean up when component unmounts
    return () => {
      console.log('OrderNotifier: Cleaning up new order listener');
      cleanup();
    };
  }, [isAuthenticated, user?.role]);
  
  const playOrderSound = () => {
    try {
      const audio = new Audio('/order-notification.mp3');
      audio.play().catch(err => console.error('Error playing notification sound:', err));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  const handleViewOrder = () => {
    if (newOrder) {
      navigate(`/vendor/orders?orderId=${newOrder.orderId}`);
      setShowNotification(false);
    }
  };
  
  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  
  // If no notification to show, render nothing
  if (!showNotification || !newOrder) {
    return null;
  }
  
  // Render notification with order data
  return (
    <div className="fixed top-4 right-4 z-50 transition-all duration-300 opacity-100 translate-y-0">
      <Card className="w-80 shadow-lg border-2 border-[#FF9933]/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2 text-[#FF9933]" />
              <span>New Order!</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseNotification}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-base">Order #{newOrder.orderNumber}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <DollarSign className="h-3.5 w-3.5 mr-1" />
                <span>₹{newOrder.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="text-sm mt-1">
                From: {newOrder.customerName}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {newOrder.items?.length || 0} items
              </div>
            </div>
            <Button 
              className="w-full bg-[#FF9933] hover:bg-[#FF9933]/90"
              onClick={handleViewOrder}
            >
              View Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderNotifier; 