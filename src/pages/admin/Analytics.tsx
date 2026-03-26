import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNav from '@/components/navigation/AdminNav';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Download, Calendar, TrendingUp, Users, ShoppingBag, DollarSign, CreditCard, RefreshCw } from 'lucide-react';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend, trendLabel }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend !== undefined && (
            <span className={`flex items-center text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% 
              <span className="ml-1 text-muted-foreground">{trendLabel}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('this-year');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Stats data
  const [statsData, setStatsData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    conversionRate: 0,
    revenueTrend: 0,
    ordersTrend: 0,
    usersTrend: 0,
    conversionTrend: 0
  });
  
  // Chart data
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching analytics data with timeRange:', timeRange);
      const response = await api.get('/admin/analytics', {
        params: { timeRange }
      });
      console.log('Analytics API response:', response.data);
      
      const data = response.data;
      
      // Update stats data
      setStatsData({
        totalRevenue: data.stats.totalRevenue,
        totalOrders: data.stats.totalOrders,
        totalUsers: data.stats.totalUsers,
        conversionRate: data.stats.conversionRate,
        revenueTrend: data.stats.revenueTrend,
        ordersTrend: data.stats.ordersTrend,
        usersTrend: data.stats.usersTrend,
        conversionTrend: data.stats.conversionTrend
      });
      
      // Update chart data
      setSalesData(data.charts.sales);
      setCategoryData(data.charts.categories);
      setUserGrowthData(data.charts.userGrowth);
      setOrdersData(data.charts.orders);
      
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch analytics data',
        variant: 'destructive'
      });
      
      // If API fails, fallback to mock data
      setStatsData({
        totalRevenue: 42350,
        totalOrders: 325,
        totalUsers: 1248,
        conversionRate: 3.2,
        revenueTrend: 12.5,
        ordersTrend: 8.2,
        usersTrend: 24.1,
        conversionTrend: -1.8
      });
      
      // Set mock data for charts (using the existing mock data from before)
      setSalesData([
        { name: 'Jan', value: 1200 },
        { name: 'Feb', value: 1900 },
        { name: 'Mar', value: 2400 },
        { name: 'Apr', value: 1600 },
        { name: 'May', value: 2800 },
        { name: 'Jun', value: 2200 },
        { name: 'Jul', value: 3100 },
        { name: 'Aug', value: 2900 },
        { name: 'Sep', value: 3500 },
        { name: 'Oct', value: 3200 },
        { name: 'Nov', value: 3800 },
        { name: 'Dec', value: 4100 },
      ]);
      
      setCategoryData([
        { name: 'Vegetables', value: 35 },
        { name: 'Fruits', value: 25 },
        { name: 'Grains', value: 20 },
        { name: 'Dairy', value: 15 },
        { name: 'Other', value: 5 },
      ]);
      
      setUserGrowthData([
        { name: 'Jan', farmers: 28, vendors: 12, consumers: 56 },
        { name: 'Feb', farmers: 32, vendors: 15, consumers: 78 },
        { name: 'Mar', farmers: 35, vendors: 18, consumers: 94 },
        { name: 'Apr', farmers: 40, vendors: 23, consumers: 112 },
        { name: 'May', farmers: 45, vendors: 25, consumers: 135 },
        { name: 'Jun', farmers: 50, vendors: 29, consumers: 158 },
      ]);
      
      setOrdersData([
        { name: 'Jan', completed: 65, cancelled: 12, pending: 23 },
        { name: 'Feb', completed: 75, cancelled: 10, pending: 15 },
        { name: 'Mar', completed: 85, cancelled: 8, pending: 12 },
        { name: 'Apr', completed: 78, cancelled: 15, pending: 18 },
        { name: 'May', completed: 90, cancelled: 9, pending: 20 },
        { name: 'Jun', completed: 95, cancelled: 7, pending: 14 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle export reports
  const handleExportReports = async () => {
    try {
      console.log('Exporting analytics report with timeRange:', timeRange);
      const response = await api.get('/admin/analytics/export', {
        params: { timeRange },
        responseType: 'blob'
      });
      
      // Create a download link for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    } catch (error: any) {
      console.error('Error exporting analytics report:', error);
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export reports',
        variant: 'destructive'
      });
    }
  };

  // Fetch data on component mount and when time range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Analytics & Reports</h1>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="this-quarter">This Quarter</SelectItem>
                <SelectItem value="this-year">This Year</SelectItem>
                <SelectItem value="all-time">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportReports}>
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline" onClick={fetchAnalyticsData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <p className="mt-4 text-gray-500">Loading analytics data...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Revenue"
                value={`₹${statsData.totalRevenue.toLocaleString()}`}
                description="Total earnings"
                icon={<DollarSign className="h-4 w-4" />}
                trend={statsData.revenueTrend}
                trendLabel="vs last month"
              />
              <StatCard
                title="Total Orders"
                value={statsData.totalOrders.toLocaleString()}
                description="Completed orders"
                icon={<ShoppingBag className="h-4 w-4" />}
                trend={statsData.ordersTrend}
                trendLabel="vs last month"
              />
              <StatCard
                title="Total Users"
                value={statsData.totalUsers.toLocaleString()}
                description="Active accounts"
                icon={<Users className="h-4 w-4" />}
                trend={statsData.usersTrend}
                trendLabel="vs last month"
              />
              <StatCard
                title="Conversion Rate"
                value={`${statsData.conversionRate.toFixed(1)}%`}
                description="Order completion"
                icon={<TrendingUp className="h-4 w-4" />}
                trend={statsData.conversionTrend}
                trendLabel="vs last month"
              />
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Overview</CardTitle>
                      <CardDescription>Monthly revenue for {new Date().getFullYear()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={salesData}>
                          <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Categories Distribution</CardTitle>
                      <CardDescription>Products by category</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="sales" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Revenue</CardTitle>
                    <CardDescription>Detailed monthly revenue analysis</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                          <Legend />
                          <Bar dataKey="value" name="Revenue" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>Monthly user growth by type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={userGrowthData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="farmers" stroke="#8884d8" name="Farmers" />
                          <Line type="monotone" dataKey="vendors" stroke="#82ca9d" name="Vendors" />
                          <Line type="monotone" dataKey="consumers" stroke="#ffc658" name="Consumers" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Categories</CardTitle>
                    <CardDescription>Distribution of products by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                    <CardDescription>Monthly order status distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={ordersData} barGap={0} barCategoryGap={8}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="completed" name="Completed" fill="#82ca9d" />
                          <Bar dataKey="cancelled" name="Cancelled" fill="#ff8042" />
                          <Bar dataKey="pending" name="Pending" fill="#ffc658" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics; 