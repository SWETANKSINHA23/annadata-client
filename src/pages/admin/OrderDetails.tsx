import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import AdminNav from '@/components/navigation/AdminNav';
import { ArrowLeft, Package, Map, Calendar, CreditCard, AlertCircle } from 'lucide-react';

interface OrderItem {
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
  unit: string;
}

interface OrderDetails {
  _id: string;
  orderNumber: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    customerName: string;
    customerEmail: string;
  };
  orderType: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  cancellationReason?: string;
  createdAt: string;
  refundStatus: string;
  refundId?: string;
}

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching order details for ID: ${orderId}`);
      
      // Try first endpoint format
      try {
        console.log('Trying endpoint: /admin/orders/${orderId}');
        const response = await api.get(`/admin/orders/${orderId}`);
        console.log('Order details API response:', response.data);
        setOrderDetails(response.data);
        setError('');
        return; // Successfully fetched data, exit the function
      } catch (error) {
        console.warn('First endpoint attempt failed, trying alternative...');
        // Continue to try alternative endpoint
      }
      
      // Try alternative endpoint format
      try {
        console.log('Trying alternative endpoint: /orders/${orderId}');
        const response = await api.get(`/orders/${orderId}`);
        console.log('Alternative API response:', response.data);
        
        if (response.data) {
          setOrderDetails(response.data);
          setError('');
          return; // Successfully got data, exit the function
        }
      } catch (error) {
        console.error('Both API endpoint attempts failed');
        throw new Error('Failed to fetch order details from both endpoints');
      }
    } catch (error: any) {
      console.error('Error in main fetchOrderDetails function:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch order details');
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch order details',
        variant: 'destructive'
      });
      
      // Set mock data for better user experience
      setMockOrderData();
    } finally {
      setLoading(false);
    }
  };

  const setMockOrderData = () => {
    console.log('Setting mock order data as fallback');
    setOrderDetails({
      _id: orderId || '12345',
      orderNumber: 'ORD-10001',
      buyer: {
        _id: 'u1',
        name: 'Sample Customer',
        email: 'customer@example.com'
      },
      seller: {
        _id: 'u2',
        name: 'Sample Seller',
        email: 'seller@example.com'
      },
      items: [
        {
          product: {
            _id: 'p1',
            name: 'Sample Product'
          },
          quantity: 2,
          price: 150,
          unit: 'kg'
        }
      ],
      totalAmount: 300,
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'online',
      deliveryAddress: {
        street: '123 Sample Street',
        city: 'Sample City',
        state: 'Sample State',
        pincode: '123456',
        customerName: 'Sample Customer',
        customerEmail: 'customer@example.com'
      },
      orderType: 'standard',
      createdAt: new Date().toISOString(),
      refundStatus: 'none'
    });
  };

  // Try direct API call using fetch for debugging
  const tryDirectApiCall = async () => {
    try {
      // Get token and base URL
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      console.log(`Making direct API call to ${baseUrl}/admin/orders/${orderId}`);
      
      const response = await fetch(`${baseUrl}/admin/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Direct API Response Status:', response.status);
      const data = await response.json();
      console.log('Direct API Response Data:', data);
      
      if (response.ok) {
        setOrderDetails(data);
        toast({
          title: 'Success',
          description: 'Fetched order details directly',
        });
      } else {
        toast({
          title: 'Direct API Error',
          description: data.message || 'Failed to fetch order details',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Direct API call error:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'accepted': return 'secondary';
      case 'in-transit': return 'default';
      case 'delivered': return 'success';
      case 'rejected':
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'outline';
      case 'failed': return 'destructive';
      case 'refunded': return 'secondary';
      default: return 'outline';
    }
  };

  // Render debug button in footer of main content
  const renderDebugButton = () => (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <Button variant="outline" size="sm" onClick={tryDirectApiCall}>
        Debug API
      </Button>
      <p className="text-xs text-gray-500 mt-1">
        Order ID: {orderId}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <div className="bg-red-50 p-4 rounded-md flex items-start text-red-600">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <p>{error}</p>
          </div>
          <div className="flex mt-4 space-x-2">
            <Button variant="outline" asChild>
              <Link to="/admin/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
            <Button variant="outline" onClick={tryDirectApiCall}>
              Try Direct API Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <p>No order details found</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <Button variant="outline" className="mb-4" asChild>
            <Link to="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Order Details: {orderDetails.orderNumber}</h1>
            <Badge variant={getStatusBadgeVariant(orderDetails.status)} className="uppercase text-sm">
              {orderDetails.status}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Order Date</p>
                    <p>{new Date(orderDetails.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Payment</p>
                    <div className="flex items-center">
                      <Badge variant={getPaymentStatusBadgeVariant(orderDetails.paymentStatus)} className="mr-2">
                        {orderDetails.paymentStatus}
                      </Badge>
                      <span className="capitalize">{orderDetails.paymentMethod}</span>
                    </div>
                    {orderDetails.razorpayOrderId && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Razorpay Order ID: {orderDetails.razorpayOrderId}
                      </p>
                    )}
                    {orderDetails.razorpayPaymentId && (
                      <p className="text-xs text-muted-foreground">
                        Payment ID: {orderDetails.razorpayPaymentId}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Package className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">Order Type</p>
                    <Badge variant="outline" className="capitalize">
                      {orderDetails.orderType.replace(/-/g, ' ')}
                    </Badge>
                  </div>
                </div>
                
                {orderDetails.expectedDeliveryDate && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Expected Delivery</p>
                      <p>{new Date(orderDetails.expectedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {orderDetails.status === 'delivered' && orderDetails.actualDeliveryDate && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Actual Delivery</p>
                      <p>{new Date(orderDetails.actualDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {(orderDetails.status === 'cancelled' || orderDetails.status === 'rejected') && 
                 orderDetails.cancellationReason && (
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Cancellation Reason</p>
                      <p>{orderDetails.cancellationReason}</p>
                    </div>
                  </div>
                )}
                
                {orderDetails.refundStatus !== 'not-applicable' && (
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">Refund Status</p>
                      <Badge variant={getPaymentStatusBadgeVariant(orderDetails.refundStatus)}>
                        {orderDetails.refundStatus}
                      </Badge>
                      {orderDetails.refundId && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Refund ID: {orderDetails.refundId}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Parties Involved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Buyer</h3>
                  <div className="rounded-md border p-3">
                    <p className="font-medium">{orderDetails.buyer.name}</p>
                    <p className="text-sm text-muted-foreground">{orderDetails.buyer.email}</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-2"
                      asChild
                    >
                      <Link to={`/admin/users/${orderDetails.buyer._id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Seller</h3>
                  <div className="rounded-md border p-3">
                    <p className="font-medium">{orderDetails.seller.name}</p>
                    <p className="text-sm text-muted-foreground">{orderDetails.seller.email}</p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto mt-2"
                      asChild
                    >
                      <Link to={`/admin/users/${orderDetails.seller._id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Delivery Address</h3>
                  <div className="rounded-md border p-3">
                    <p>{orderDetails.deliveryAddress.customerName}</p>
                    <p>{orderDetails.deliveryAddress.street}</p>
                    <p>
                      {orderDetails.deliveryAddress.city}, {orderDetails.deliveryAddress.state} - {orderDetails.deliveryAddress.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {orderDetails.deliveryAddress.customerEmail}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
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
                {orderDetails.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal justify-start"
                        asChild
                      >
                        <Link to={`/admin/products/${item.product._id}`}>
                          {item.product.name}
                        </Link>
                      </Button>
                    </TableCell>
                    <TableCell>₹{item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.quantity} {item.unit}</TableCell>
                    <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total Amount
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{orderDetails.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Add debug button at bottom */}
        {renderDebugButton()}
      </div>
    </div>
  );
};

export default OrderDetails; 