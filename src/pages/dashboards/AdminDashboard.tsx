import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/axios';
import AdminNav from '@/components/navigation/AdminNav';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  Users
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { format } from 'date-fns';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Analytics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  userDistribution: { _id: string; count: number }[];
  orderDistribution: { _id: string; count: number }[];
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    fetchUsers();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const params: Record<string, string> = {};
      if (dateRange.from) params.startDate = format(dateRange.from, 'yyyy-MM-dd');
      if (dateRange.to) params.endDate = format(dateRange.to, 'yyyy-MM-dd');

      const response = await api.get('/admin/analytics/system', { params });
      setAnalytics(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch analytics',
        variant: 'destructive'
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const params: Record<string, string> = {};
      if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/admin/users', { params });
      setUsers(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch users',
        variant: 'destructive'
      });
    }
  };

  const handleToggleUser = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/toggle`);
      toast({
        title: 'Success',
        description: 'User status updated successfully',
      });
      fetchUsers(); // Refresh the user list
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  const handleSearch = () => {
    fetchUsers();
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    fetchUsers();
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <p className="text-2xl font-bold">₹{analytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics?.userDistribution?.map(item => (
                      <div key={item._id} className="flex justify-between items-center">
                        <span className="capitalize">{item._id || 'Unknown'}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics?.orderDistribution?.map(item => (
                      <div key={item._id} className="flex justify-between items-center">
                        <span className="capitalize">{item._id || 'Unknown'}</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="farmer">Farmers</SelectItem>
                    <SelectItem value="vendor">Vendors</SelectItem>
                    <SelectItem value="consumer">Consumers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="mr-1 h-4 w-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <XCircle className="mr-1 h-4 w-4" /> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUser(user._id)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = `/admin/users/${user._id}`}
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Manage and track customer orders</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All orders</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <DatePickerWithRange className="w-52" />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">ORD-{(100000 + index).toString()}</TableCell>
                        <TableCell>Customer {index + 1}</TableCell>
                        <TableCell>{new Date().toLocaleDateString()}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            index % 4 === 0 ? 'bg-yellow-100 text-yellow-800' : 
                            index % 4 === 1 ? 'bg-blue-100 text-blue-800' : 
                            index % 4 === 2 ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {index % 4 === 0 ? 'Pending' : 
                             index % 4 === 1 ? 'Processing' : 
                             index % 4 === 2 ? 'Completed' : 
                             'Cancelled'}
                          </span>
                        </TableCell>
                        <TableCell>₹{(1000 + index * 500).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-500">
                  Showing 5 of 50 orders
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Platform Analytics</CardTitle>
                    <CardDescription>Overview of system performance</CardDescription>
                  </div>
                  <DatePickerWithRange className="w-52" onRangeChange={handleDateRangeChange} />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Total Revenue</h3>
                      <p className="text-2xl font-bold">₹{analytics?.totalRevenue?.toFixed(2) || '0.00'}</p>
                      <span className="text-xs text-green-500">+5.2% from last month</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Orders</h3>
                      <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
                      <span className="text-xs text-green-500">+12.3% from last month</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Users</h3>
                      <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
                      <span className="text-xs text-green-500">+8.7% from last month</span>
                    </div>
                    
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Conversion Rate</h3>
                      <p className="text-2xl font-bold">24.3%</p>
                      <span className="text-xs text-red-500">-2.1% from last month</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="font-medium mb-2">Order Distribution</h3>
                      <div className="space-y-4">
                        {analytics?.orderDistribution?.map(item => (
                          <div key={item._id} className="flex flex-col">
                            <div className="flex justify-between mb-1">
                              <span className="capitalize">{item._id || 'Unknown'}</span>
                              <span className="font-medium">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  item._id === 'delivered' ? 'bg-green-500' : 
                                  item._id === 'processing' ? 'bg-blue-500' : 
                                  item._id === 'pending' ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${(item.count / (analytics.totalOrders || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="font-medium mb-2">User Distribution</h3>
                      <div className="space-y-4">
                        {analytics?.userDistribution?.map(item => (
                          <div key={item._id} className="flex flex-col">
                            <div className="flex justify-between mb-1">
                              <span className="capitalize">{item._id || 'Unknown'}</span>
                              <span className="font-medium">{item.count}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  item._id === 'farmer' ? 'bg-green-500' : 
                                  item._id === 'vendor' ? 'bg-blue-500' : 
                                  item._id === 'consumer' ? 'bg-purple-500' : 
                                  'bg-gray-500'
                                }`}
                                style={{ width: `${(item.count / (analytics?.totalUsers || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard; 