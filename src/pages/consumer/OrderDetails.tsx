import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Map, Calendar, CreditCard, Truck } from 'lucide-react';
import { orderService } from '@/services/order.service';
import { useToast } from '@/hooks/use-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!orderId) return;
    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrder(orderId);
        setOrder(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch order details';
        setError(message);
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, toast]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'in-transit':
        return 'blue';
      case 'accepted':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'destructive';
      case 'refunded':
        return 'blue';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#138808]"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Order not found'}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate('/dashboard/consumer')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['consumer']}>
      <div className="container mx-auto py-10 px-4">
        <Button 
          variant="outline" 
          className="mb-6" 
          onClick={() => navigate('/dashboard/consumer')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <Badge 
            variant={getStatusBadgeVariant(order.status)}
            className="uppercase text-sm"
          >
            {order.status}
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <Truck className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.status === 'delivered' 
                      ? `Delivered on ${new Date(order.actualDeliveryDate || order.updatedAt).toLocaleDateString()}`
                      : order.status === 'cancelled'
                        ? `Cancelled on ${new Date(order.updatedAt).toLocaleDateString()}`
                        : `Last updated on ${new Date(order.updatedAt).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Date */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start">
                <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                <div>
                  <div className="flex items-center">
                    <Badge variant={getPaymentStatusBadgeVariant(order.paymentStatus)} className="mr-2">
                      {order.paymentStatus}
                    </Badge>
                    <span className="capitalize">{order.paymentMethod}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total Amount: ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delivery Address */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start">
              <Map className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.deliveryAddress.customerName}</p>
                <p>{order.deliveryAddress.street}</p>
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
            <CardDescription>
              {order.items.length} {order.items.length === 1 ? 'item' : 'items'} in your order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {item.product.name}
                    </TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit || 'pc'}
                    </TableCell>
                    <TableCell className="text-right">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{order.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {order.status === 'pending' && (
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await orderService.cancelOrder(order._id);
                      toast({
                        title: 'Order Cancelled',
                        description: 'Your order has been cancelled successfully.',
                      });
                      // Refresh the page to show updated status
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                      toast({
                        title: 'Error',
                        description: error instanceof Error ? error.message : 'Failed to cancel order',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  Cancel Order
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default OrderDetails; 