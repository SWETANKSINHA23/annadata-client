import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import AdminNav from '@/components/navigation/AdminNav';
import { Search, RefreshCw, FileDown, ShoppingCart, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface Order {
  _id: string;
  orderId: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  items: {
    product: {
      _id: string;
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page };
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      if (dateRange.from) params.startDate = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange.to) params.endDate = format(dateRange.to, 'yyyy-MM-dd');

      console.log('Fetching orders with params:', params);
      const response = await api.get('/admin/orders', { params });
      console.log('Orders API response:', response.data);
      
      // Check if the response has orders property (paginated response)
      if (response.data.orders) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages || 1);
        setTotalOrders(response.data.totalCount || response.data.orders.length);
      } else {
        // Fallback for non-paginated response
        setOrders(response.data);
        setTotalPages(1);
        setTotalOrders(response.data.length);
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch orders',
        variant: 'destructive'
      });
      // Set empty orders array on error
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, dateRange]);

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchOrders();
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setPage(1); // Reset to first page when changing date range
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      
      // Update local state to reflect the change
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: status as any } : order
      ));
      
      toast({
        title: 'Success',
        description: `Order status updated to ${status}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update order status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Pending</span>;
      case 'processing':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Processing</span>;
      case 'shipped':
        return <span className="px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleExportOrders = async () => {
    try {
      const params: Record<string, string | number> = {};
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      if (dateRange.from) params.startDate = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange.to) params.endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      console.log('Exporting orders with params:', params);
      const response = await api.get('/admin/orders/export', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Orders exported successfully',
      });
    } catch (error: any) {
      console.error('Error exporting orders:', error);
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export orders',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Order Management</h1>
          <Button variant="outline" onClick={handleExportOrders}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Orders
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Order Search & Filters</CardTitle>
            <CardDescription>Find orders by ID, customer, status, or date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by order ID or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-auto">
                <DatePickerWithRange 
                  className="w-[300px]" 
                  onChange={handleDateRangeChange}
                  value={dateRange}
                />
              </div>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={fetchOrders}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading orders...</p>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="flex justify-center">
                        <ShoppingCart className="h-12 w-12 text-gray-300" />
                      </div>
                      <p className="mt-2 text-gray-500">No orders found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.orderId}</TableCell>
                      <TableCell>{order.buyer.name}</TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          {getPaymentStatusIcon(order.paymentStatus)}
                          <span className="ml-1 capitalize text-sm">{order.paymentStatus}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select 
                            onValueChange={(value) => handleUpdateOrderStatus(order._id, value)}
                            defaultValue={order.status}
                          >
                            <SelectTrigger className="w-[110px] h-8">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/orders/${order._id}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing page {page} of {totalPages} ({totalOrders} total orders)
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderManagement; 