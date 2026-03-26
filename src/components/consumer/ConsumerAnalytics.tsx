import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Download, TrendingUp, ShoppingBag, DollarSign, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyticsService } from '@/services/analytics.service';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: number;
  trendLabel?: string;
}

const AnalyticsCard = ({ title, value, description, icon, trend, trendLabel }: AnalyticsCardProps) => {
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

const COLORS = ['#138808', '#FF9933', '#0000FF', '#8884d8', '#82ca9d'];

const ConsumerAnalytics = () => {
  const [timeRange, setTimeRange] = useState('this-month');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Analytics data states
  const [analyticsData, setAnalyticsData] = useState({
    totalSpent: 0,
    totalOrders: 0,
    totalSavings: 0,
    ordersThisMonth: 0,
    spendingTrend: 5.2,
    ordersTrend: 12.5,
    savingsTrend: 8.3
  });
  
  // Chart data
  const [spendingData, setSpendingData] = useState([
    { name: 'Jan', value: 1200 },
    { name: 'Feb', value: 1900 },
    { name: 'Mar', value: 1400 },
    { name: 'Apr', value: 1600 },
    { name: 'May', value: 2100 },
    { name: 'Jun', value: 1800 }
  ]);
  
  const [categoryData, setCategoryData] = useState([
    { name: 'Vegetables', value: 45 },
    { name: 'Fruits', value: 30 },
    { name: 'Grains', value: 15 },
    { name: 'Dairy', value: 10 }
  ]);
  
  const [orderStatusData, setOrderStatusData] = useState([
    { name: 'Delivered', value: 65 },
    { name: 'In Transit', value: 15 },
    { name: 'Processing', value: 12 },
    { name: 'Cancelled', value: 8 }
  ]);

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // In a production environment with API endpoint ready:
      // const data = await analyticsService.getConsumerAnalytics(timeRange);
      // setAnalyticsData(data.stats);
      // setSpendingData(data.charts.spending);
      // setCategoryData(data.charts.categories);
      // setOrderStatusData(data.charts.orderStatus);
      
      // For demo purposes using mock data:
      setTimeout(() => {
        // Update with fresh mock data based on time range
        if (timeRange === 'this-week') {
          setSpendingData([
            { name: 'Mon', value: 300 },
            { name: 'Tue', value: 450 },
            { name: 'Wed', value: 320 },
            { name: 'Thu', value: 280 },
            { name: 'Fri', value: 390 },
            { name: 'Sat', value: 480 },
            { name: 'Sun', value: 520 }
          ]);
          setAnalyticsData({
            ...analyticsData,
            totalSpent: 2740,
            totalOrders: 7,
            totalSavings: 385,
            ordersThisMonth: 7
          });
        } else if (timeRange === 'this-month') {
          setSpendingData([
            { name: 'Week 1', value: 2100 },
            { name: 'Week 2', value: 1850 },
            { name: 'Week 3', value: 2340 },
            { name: 'Week 4', value: 1980 }
          ]);
          setAnalyticsData({
            ...analyticsData,
            totalSpent: 8270,
            totalOrders: 22,
            totalSavings: 1150,
            ordersThisMonth: 22
          });
        } else if (timeRange === 'this-year') {
          setSpendingData([
            { name: 'Jan', value: 8200 },
            { name: 'Feb', value: 7900 },
            { name: 'Mar', value: 8600 },
            { name: 'Apr', value: 7800 },
            { name: 'May', value: 9100 },
            { name: 'Jun', value: 9500 },
            { name: 'Jul', value: 9800 },
            { name: 'Aug', value: 10200 },
            { name: 'Sep', value: 9700 },
            { name: 'Oct', value: 8900 },
            { name: 'Nov', value: 9300 },
            { name: 'Dec', value: 10500 }
          ]);
          setAnalyticsData({
            ...analyticsData,
            totalSpent: 109500,
            totalOrders: 248,
            totalSavings: 14350,
            ordersThisMonth: 22
          });
        }
        
        setIsLoading(false);
      }, 800);
      
    } catch (error: any) {
      console.error('Error fetching consumer analytics:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch analytics data',
        variant: 'destructive'
      });
      setIsLoading(false);
    }
  };

  // Export reports function
  const handleExportReports = async () => {
    toast({
      title: 'Export Started',
      description: 'Your spending report is being generated and will download shortly.',
    });
    
    try {
      // In a production environment with API endpoint ready:
      // const blob = await analyticsService.exportConsumerReport(timeRange);
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `consumer-spending-report-${timeRange}.csv`);
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
      
      // For demo purposes:
      setTimeout(() => {
        // Mock export functionality
        const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(
          `Time Period,${timeRange}\nTotal Spent,₹${analyticsData.totalSpent}\nTotal Orders,${analyticsData.totalOrders}\nTotal Savings,₹${analyticsData.totalSavings}\n\nCategory,Spending\n` +
          categoryData.map(item => `${item.name},₹${Math.round(item.value * analyticsData.totalSpent / 100)}`).join('\n')
        );
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `consumer-spending-report-${timeRange}.csv`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        toast({
          title: 'Export Complete',
          description: 'Your spending report has been downloaded.',
        });
      }, 1500);
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export report',
        variant: 'destructive'
      });
    }
  };

  // Fetch data when component mounts or time range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Spending Analytics</h2>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReports}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#138808]"></div>
          <span className="ml-3">Loading analytics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              title="Total Spent"
              value={`₹${analyticsData.totalSpent.toLocaleString()}`}
              description="Lifetime spending"
              icon={<DollarSign className="h-4 w-4" />}
              trend={analyticsData.spendingTrend}
              trendLabel="vs last period"
            />
            <AnalyticsCard
              title="Total Orders"
              value={analyticsData.totalOrders}
              description="Orders placed"
              icon={<ShoppingBag className="h-4 w-4" />}
              trend={analyticsData.ordersTrend}
              trendLabel="vs last period"
            />
            <AnalyticsCard
              title="Total Savings"
              value={`₹${analyticsData.totalSavings.toLocaleString()}`}
              description="Money saved"
              icon={<TrendingUp className="h-4 w-4" />}
              trend={analyticsData.savingsTrend}
              trendLabel="vs last period"
            />
            <AnalyticsCard
              title="This Month"
              value={analyticsData.ordersThisMonth}
              description="Orders this month"
              icon={<Leaf className="h-4 w-4" />}
            />
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="spending">Spending</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Overview</CardTitle>
                    <CardDescription>Your spending over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={spendingData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                          <Legend />
                          <Bar dataKey="value" name="Spending" fill="#138808" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                    <CardDescription>Your spending by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
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
                          <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="spending">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Spending Analysis</CardTitle>
                  <CardDescription>Track your spending patterns over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={spendingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Spending" stroke="#138808" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Category Breakdown</CardTitle>
                  <CardDescription>See where your money is going</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData.map(item => ({
                          name: item.name,
                          value: Math.round(item.value * analyticsData.totalSpent / 100)
                        }))}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                        <Legend />
                        <Bar dataKey="value" name="Amount Spent" fill="#FF9933" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Overview of your order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderStatusData.map((entry, index) => (
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
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ConsumerAnalytics; 