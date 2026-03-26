import { toast } from "@/hooks/use-toast";
import { api } from '@/lib/axios';

export interface BulkPurchaseItem {
  productId: string;
  quantity: number;
}

export interface BulkPurchaseAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface BulkPurchaseInput {
  farmerId: string;
  items: BulkPurchaseItem[];
  deliveryAddress: BulkPurchaseAddress;
  deliveryDate: string;
}

export interface BulkOrder {
  _id: string;
  vendorId: string;
  farmerId: string;
  buyer: { name: string; _id: string; };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    unit: string;
  }>;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'processing' | 'ready-for-delivery' | 'in-transit' | 'delivered' | 'rejected' | 'cancelled';
  deliveryAddress: BulkPurchaseAddress;
  deliveryDate: string;
  expectedDeliveryDate: string;
  placedAt: string;
  updatedAt: string;
}

class BulkOrderService {
  // Create a bulk purchase order (vendor buying from farmer)
  async createBulkPurchase(data: BulkPurchaseInput): Promise<BulkOrder> {
    try {
      // Use the correct endpoint based on the backend routes
      const response = await api.post('/bulk/farmer-purchase', data);
      toast({
        title: "Success",
        description: "Bulk purchase order created successfully",
      });
      return response.data.order;
    } catch (error: any) {
      console.error('Error creating bulk purchase:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create bulk purchase",
        variant: "destructive",
      });
      throw error;
    }
  }
  
  // Get bulk orders for farmers (as seller)
  async getFarmerBulkOrders(): Promise<BulkOrder[]> {
    try {
      console.log('Fetching farmer bulk orders...');
      const response = await api.get('/bulk-orders/farmer');
      console.log('Farmer bulk orders response:', response.data);
      return response.data.orders || [];
    } catch (error) {
      console.error('Error fetching farmer bulk orders:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bulk orders",
        variant: "destructive",
      });
      return [];
    }
  }
  
  // Get bulk orders for vendors (as buyer)
  async getVendorBulkOrders(): Promise<BulkOrder[]> {
    try {
      const response = await api.get('/bulk-orders/vendor');
      return response.data.orders || [];
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch bulk orders",
        variant: "destructive",
      });
      return [];
    }
  }
  
  // Update bulk order status
  async updateBulkOrderStatus(orderId: string, status: string): Promise<BulkOrder> {
    try {
      // Use the correct endpoint based on the backend routes
      const response = await api.patch(`/bulk-orders/${orderId}/status`, { status });
      
      const successMessages = {
        'accepted': 'Order accepted successfully',
        'processing': 'Order is now being processed',
        'ready-for-delivery': 'Order is marked as ready for delivery',
        'in-transit': 'Order is now in transit',
        'delivered': 'Order has been marked as delivered',
        'rejected': 'Order has been rejected',
        'cancelled': 'Order has been cancelled'
      };
      
      toast({
        title: "Success",
        description: successMessages[status] || `Order status updated to ${status}`,
      });
      return response.data.order || response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status",
        variant: "destructive",
      });
      throw error;
    }
  }

  async getBulkOrderDetails(orderId: string): Promise<BulkOrder> {
    try {
      const response = await api.get(`/bulk-orders/${orderId}`);
      return response.data;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch order details",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export const bulkOrderService = new BulkOrderService(); 