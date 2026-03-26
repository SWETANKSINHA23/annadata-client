import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, Area, AreaChart, Cell 
} from 'recharts';
import { Loader2, InfoIcon } from "lucide-react";
import { api } from '@/lib/axios';
import { formatCurrency } from '@/lib/utils';
import ProtectedRoute from "@/components/ProtectedRoute";

// Custom chart colors
const CHART_COLORS = {
  sales: '#4f46e5', // indigo
  revenue: '#10b981', // emerald
  primary: '#6366f1', // indigo-500
  secondary: '#f97316', // orange-500
  background: '#f1f5f9', // slate-100
  grid: '#e2e8f0', // slate-200
  tooltip: 'rgba(255, 255, 255, 0.95)',
  gradient: {
    sales: ['rgba(79, 70, 229, 0.9)', 'rgba(79, 70, 229, 0.1)'],
    revenue: ['rgba(16, 185, 129, 0.9)', 'rgba(16, 185, 129, 0.1)']
  },
  bars: [
    '#6366f1', // indigo-500
    '#f97316', // orange-500
    '#10b981', // emerald-500
    '#f43f5e', // rose-500
    '#8b5cf6', // violet-500
    '#0ea5e9', // sky-500
  ]
};

// Custom tooltip component for sales chart
const SalesChartTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: {
      isSampleData?: boolean;
    };
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const isSampleData = payload[0]?.payload?.isSampleData;
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
        <p className="font-medium text-gray-900 mb-1">{label || 'N/A'}</p>
        {payload.map((entry, index) => {
          const value = typeof entry.value === 'number' ? entry.value : 0;
          return (
            <div key={`item-${index}`} className="flex items-center my-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">
                {entry.name === 'Sales' ? 'Units Sold: ' : 'Revenue: '}
                <span className="font-medium">
                  {entry.name === 'Revenue' ? '₹' : ''}{value.toLocaleString()}
                  {entry.name === 'Sales' ? ' units' : ''}
                </span>
              </span>
            </div>
          );
        })}
        {/* {isSampleData && (
          // <p className="text-xs text-orange-500 mt-2 italic">
          //   *Sample data for visualization
          // </p>
        )} */}
      </div>
    );
  }
  return null;
};

// Custom tooltip component for product chart
const ProductChartTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: {
      fullName: string;
      isSampleData?: boolean;
    };
  }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    const productName = payload[0]?.payload?.fullName || label || 'Unknown Product';
    const isSampleData = payload[0]?.payload?.isSampleData;
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-md">
        <p className="font-medium text-gray-900 mb-1">{productName}</p>
        {payload.map((entry, index) => {
          const value = typeof entry.value === 'number' ? entry.value : 0;
          return (
            <div key={`item-${index}`} className="flex items-center my-1">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-700">
                {entry.name === 'Sales' ? 'Units Sold: ' : 'Revenue: '}
                <span className="font-medium">
                  {entry.name === 'Revenue' ? '₹' : ''}{value.toLocaleString()}
                  {entry.name === 'Sales' ? ' units' : ''}
                </span>
              </span>
            </div>
          );
        })}
        {isSampleData && (
          <p className="text-xs text-orange-500 mt-2 italic">
            *Sample data for visualization
          </p>
        )}
      </div>
    );
  }
  return null;
};

interface ProductAnalytics {
  _id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  averageRating: number;
  totalRatings: number;
  totalSales: number;
  revenue: number;
  totalQuantitySold: number;
  dailySales: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

interface VendorSummary {
  orders: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    pendingOrders: number;
    acceptedOrders: number;
    inTransitOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
  };
  products: {
    totalProducts: number;
    totalInventoryValue: number;
    averageRating: number;
    outOfStockProducts: number;
    lowStockProducts: number;
  };
}

// Add a utility function to safely format dates and numbers
const formatChartData = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map(item => {
    // Create a new object with all properties of the original item
    const formattedItem = { ...item };
    
    // Ensure all numeric fields are actual numbers
    if (formattedItem.sales !== undefined) {
      formattedItem.sales = Number(formattedItem.sales) || 0;
    }
    
    if (formattedItem.revenue !== undefined) {
      formattedItem.revenue = Number(formattedItem.revenue) || 0;
    }
    
    if (formattedItem.date && typeof formattedItem.date === 'string') {
      try {
        // Try to ensure date is formatted consistently
        const date = new Date(formattedItem.date);
        if (!isNaN(date.getTime())) {
          formattedItem.date = date.toLocaleDateString();
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }
    
    return formattedItem;
  });
};

// Add a function to generate sample data when all values are zero
const generateSampleData = (originalData, isTimeData = false) => {
  // If data already has non-zero values, return it as is
  const hasNonZeroValues = originalData.some(item => 
    (item.sales && item.sales > 0) || (item.revenue && item.revenue > 0)
  );
  
  if (hasNonZeroValues) {
    return originalData;
  }
  
  console.log('Generating sample data for visualization purposes');
  
  // Generate sample data based on the original data structure
  if (isTimeData) {
    // For time series data (sales chart)
    return originalData.map((item, index) => {
      const dayMultiplier = (index % 7) + 1; // Create a weekly pattern
      const randomFactor = Math.random() * 0.5 + 0.5; // Random factor between 0.5 and 1
      
      return {
        ...item,
        sales: Math.floor(dayMultiplier * 5 * randomFactor), // Sample sales data
        revenue: Math.floor(dayMultiplier * 100 * randomFactor), // Sample revenue data
        isSampleData: true // Mark as sample data
      };
    });
  } else {
    // For product comparison data (bar chart)
    return originalData.map((item, index) => {
      const randomFactor = Math.random() * 0.5 + 0.5; // Random factor between 0.5 and 1
      
      return {
        ...item,
        sales: Math.floor((index + 1) * 8 * randomFactor), // Sample sales data
        revenue: Math.floor((index + 1) * 150 * randomFactor), // Sample revenue data
        isSampleData: true // Mark as sample data
      };
    });
  }
};

const VendorAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics[]>([]);
  const [summary, setSummary] = useState<VendorSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products/vendor/own');
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setApiError(null);  // Reset error state on each fetch
      
      // Default data structure for analytics to prevent UI errors
      const defaultAnalytics = [];
      const defaultSummary = {
        orders: {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0,
          pendingOrders: 0,
          acceptedOrders: 0,
          inTransitOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0
        },
        products: {
          totalProducts: 0,
          totalInventoryValue: 0,
          averageRating: 0,
          outOfStockProducts: 0,
          lowStockProducts: 0
        }
      };
      
      try {
        // Fetch product analytics
        const productUrl = selectedProduct === 'all' 
          ? `/products/vendor/analytics?timeRange=${timeRange}`
          : `/products/vendor/analytics/${selectedProduct}?timeRange=${timeRange}`;
        
        // Fetch vendor summary data
        const summaryUrl = `/analytics/vendor/summary?timeRange=${timeRange}`;
        
        // Try to get both, but continue if one fails
        try {
          const productResponse = await api.get(productUrl);
          console.log('Product Analytics API Response:', productResponse.data);
          
          // Ensure the response data is valid and has the expected structure
          if (Array.isArray(productResponse.data)) {
            // Ensure each product has properly formatted dailySales data
            const processedData = productResponse.data.map(product => {
              // Make sure dailySales is an array
              let dailySales = Array.isArray(product.dailySales) ? product.dailySales : [];
              
              // Ensure each daily sales entry has the correct format
              dailySales = dailySales.map(day => ({
                date: day.date,
                sales: Number(day.sales) || 0,
                revenue: Number(day.revenue) || 0
              }));
              
              // Return the processed product data
              return {
                ...product,
                totalSales: Number(product.totalSales) || 0,
                revenue: Number(product.revenue) || 0,
                averageRating: Number(product.averageRating) || 0,
                dailySales: dailySales
              };
            });
            
            console.log('Processed product data:', processedData);
            setAnalytics(processedData);
          } else {
            console.error('Invalid product analytics response format:', productResponse.data);
            setAnalytics(defaultAnalytics);
            setApiError('Product data has an unexpected format');
          }
        } catch (productError) {
          console.error('Error fetching product analytics:', productError);
          // Set empty fallback data
          setAnalytics(defaultAnalytics);
          
          if (productError.response) {
            const errorMsg = `Product Analytics Error (${productError.response.status}): ${productError.response.data.message || 'Unknown error'}`;
            setApiError(errorMsg);
          } else {
            setApiError(`Product Analytics Error: ${productError.message || 'Failed to fetch product data'}`);
          }
        }
        
        try {
          const summaryResponse = await api.get(summaryUrl);
          console.log('Vendor Summary API Response:', summaryResponse.data);
          
          // Ensure the summary data has the expected structure
          if (summaryResponse.data && 
              typeof summaryResponse.data === 'object' && 
              summaryResponse.data.orders && 
              summaryResponse.data.products) {
            setSummary(summaryResponse.data);
          } else {
            console.error('Invalid summary response format:', summaryResponse.data);
            setSummary(defaultSummary);
            setApiError(prev => prev ? `${prev}; Summary data has an unexpected format` : 'Summary data has an unexpected format');
          }
        } catch (summaryError) {
          console.error('Error fetching vendor summary:', summaryError);
          // Set fallback data if the API fails
          setSummary(defaultSummary);
          
          if (summaryError.response) {
            const errorMsg = `Vendor Summary Error (${summaryError.response.status}): ${summaryError.response.data.message || 'Unknown error'}`;
            setApiError(prev => prev ? `${prev}; ${errorMsg}` : errorMsg);
          } else {
            setApiError(prev => prev ? `${prev}; Vendor Summary Error: ${summaryError.message || 'Failed to fetch summary data'}` : `Vendor Summary Error: ${summaryError.message || 'Failed to fetch summary data'}`);
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        setAnalytics(defaultAnalytics);
        setSummary(defaultSummary);
        
        if (error.response) {
          console.error('API Response Status:', error.response.status);
          console.error('API Response Data:', error.response.data);
          setApiError(`API Error (${error.response.status}): ${error.response.data.message || 'Unknown error'}`);
        } else {
          setApiError(`Network Error: ${error.message || 'Failed to connect to server'}`);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange, selectedProduct]);

  // Calculate overall metrics from product data as fallback
  const productMetrics = {
    totalRevenue: analytics.reduce((sum, product) => sum + product.revenue, 0),
    totalSales: analytics.reduce((sum, product) => sum + product.totalSales, 0),
    averageRating: analytics.reduce((sum, product) => sum + product.averageRating, 0) / analytics.length || 0,
    totalProducts: analytics.length
  };

  // Update the useMemo hooks to potentially include sample data
  const dailySalesData = useMemo(() => {
    console.log('Analytics data for chart:', analytics);
    if (!analytics.length || !analytics[0]?.dailySales?.length) {
      console.log('No valid analytics data for chart');
      return [];
    }
    
    // Log raw data from first product to help debugging
    console.log('First product dailySales raw data:', analytics[0].dailySales);
    
    const chartData = analytics[0].dailySales.map(day => {
      // Accumulate sales and revenue from all products for this day
      const daySales = analytics.reduce((sum, product) => {
        const productDay = product.dailySales.find(d => d.date === day.date);
      return sum + (productDay?.sales || 0);
      }, 0);
      
      const dayRevenue = analytics.reduce((sum, product) => {
        const productDay = product.dailySales.find(d => d.date === day.date);
        return sum + (productDay?.revenue || 0);
      }, 0);
      
      // Create a formatted date string that will work consistently
      const formattedDate = new Date(day.date).toLocaleDateString();
      
      return {
        date: formattedDate,
        rawDate: day.date,
        sales: daySales,
        revenue: dayRevenue
      };
    });
    
    console.log('Processed chart data:', chartData);
    // Format and potentially add sample data
    const formattedData = formatChartData(chartData);
    return generateSampleData(formattedData, true);
  }, [analytics]);

  // Update product comparison data as well
  const productComparisonData = useMemo(() => {
    console.log('Analytics data for bar chart:', analytics);
    if (!analytics.length) {
      console.log('No valid analytics data for bar chart');
      return [];
    }
    
    const chartData = analytics.map(product => ({
      name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
      fullName: product.name,
      sales: product.totalSales || 0,
      revenue: product.revenue || 0,
      rating: product.averageRating || 0
    }));
    
    console.log('Processed bar chart data:', chartData);
    // Format and potentially add sample data
    const formattedData = formatChartData(chartData);
    return generateSampleData(formattedData);
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Vendor Analytics</h1>
        <p className="text-muted-foreground">
          Track your product performance and sales metrics
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-md text-red-800">
          <p className="font-medium">Error fetching analytics data:</p>
          <p>{apiError}</p>
          <p className="text-sm mt-1">Please try again later or contact support if the issue persists.</p>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products</SelectItem>
            {products.map(product => (
              <SelectItem key={product._id} value={product._id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
            <CardDescription>Overall earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary?.orders?.totalRevenue || productMetrics.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
            <CardDescription>Number of orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.orders?.totalOrders || productMetrics.totalSales}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Order Value</CardTitle>
            <CardDescription>Per order earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(summary?.orders?.averageOrderValue || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Products</CardTitle>
            <CardDescription>Total products</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary?.products?.totalProducts || productMetrics.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sales">Sales Trends</TabsTrigger>
          <TabsTrigger value="products">Product Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">Daily Sales Trend</CardTitle>
              <CardDescription>Track your daily sales performance over time</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Loading sales data...</p>
                </div>
              ) : dailySalesData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                  <p>No sales data available for the selected time period</p>
                </div>
              ) : (
                <div className="h-[400px] px-2">
                  {/* {dailySalesData.some(item => item.isSampleData) && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-l-4 border-amber-500 text-amber-700 mb-4">
                      <InfoIcon className="h-4 w-4" />
                      <p className="text-sm">Showing sample data for visualization purposes. You'll see real data once orders start coming in.</p>
                    </div>
                  )} */}
                  <ResponsiveContainer width="100%" height="100%" key={`sales-chart-${dailySalesData.length}`}>
                    <AreaChart 
                      data={dailySalesData}
                      margin={{ top: 10, right: 30, left: 30, bottom: 30 }}
                    >
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.gradient.sales[0]} stopOpacity={0.9}/>
                          <stop offset="95%" stopColor={CHART_COLORS.gradient.sales[1]} stopOpacity={0.9}/>
                        </linearGradient>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.gradient.revenue[0]} stopOpacity={0.9}/>
                          <stop offset="95%" stopColor={CHART_COLORS.gradient.revenue[1]} stopOpacity={0.9}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke={CHART_COLORS.grid} 
                      />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        padding={{ left: 10, right: 10 }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        tickFormatter={(value) => value.toLocaleString()}
                        domain={[0, 'dataMax + 5']}
                        allowDecimals={false}
                        minTickGap={5}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                        domain={[0, 'dataMax + 100']}
                        allowDecimals={false}
                        minTickGap={5}
                      />
                      <Tooltip content={<SalesChartTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingTop: '10px' }}
                      />
                      <Area 
                        yAxisId="left" 
                        type="monotone" 
                        dataKey="sales" 
                        name="Sales" 
                        stroke={CHART_COLORS.sales}
                        fillOpacity={1}
                        fill="url(#salesGradient)"
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 1, fill: 'white', stroke: CHART_COLORS.sales }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: CHART_COLORS.sales }}
                        isAnimationActive={true}
                      />
                      <Area 
                        yAxisId="right" 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Revenue" 
                        stroke={CHART_COLORS.revenue}
                        fillOpacity={1}
                        fill="url(#revenueGradient)"
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 1, fill: 'white', stroke: CHART_COLORS.revenue }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: CHART_COLORS.revenue }}
                        isAnimationActive={true}
                      />
                    </AreaChart>
                </ResponsiveContainer>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">Product Performance</CardTitle>
              <CardDescription>Compare performance metrics across your products</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Loading product data...</p>
                </div>
              ) : productComparisonData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
                  <p>No product data available for the selected time period</p>
                </div>
              ) : (
                <div className="h-[400px] px-2">
                  {productComparisonData.some(item => item.isSampleData) && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-l-4 border-amber-500 text-amber-700 mb-4">
                      <InfoIcon className="h-4 w-4" />
                      <p className="text-sm">Showing sample data for visualization purposes. You'll see real data once orders start coming in.</p>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%" key={`product-chart-${productComparisonData.length}`}>
                    <BarChart 
                      data={productComparisonData} 
                      margin={{ top: 10, right: 30, left: 30, bottom: 50 }}
                      barGap={10}
                      barSize={20}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={CHART_COLORS.grid}
                      />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        tickFormatter={(value) => value.toLocaleString()}
                        domain={[0, 'dataMax + 5']}
                        allowDecimals={false}
                        minTickGap={5}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickLine={{ stroke: '#94a3b8' }}
                        axisLine={{ stroke: '#94a3b8' }}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                        domain={[0, 'dataMax + 100']}
                        allowDecimals={false}
                        minTickGap={5}
                      />
                      <Tooltip content={<ProductChartTooltip />} />
                      <Legend 
                        verticalAlign="top" 
                        height={36}
                        iconType="circle"
                        iconSize={10}
                        wrapperStyle={{ paddingTop: '10px' }}
                      />
                      <Bar 
                        yAxisId="left" 
                        dataKey="sales" 
                        name="Sales" 
                        fill={CHART_COLORS.sales}
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={true}
                      >
                        {productComparisonData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CHART_COLORS.bars[index % CHART_COLORS.bars.length]} 
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                      <Bar 
                        yAxisId="right" 
                        dataKey="revenue" 
                        name="Revenue" 
                        fill={CHART_COLORS.revenue}
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={true}
                      />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Individual product performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {analytics.map(product => (
                <Card key={product._id}>
                  <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                    <CardDescription>{product.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span className="font-bold">{formatCurrency(product.revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sales:</span>
                        <span className="font-bold">{product.totalSales}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rating:</span>
                        <span className="font-bold">{product.averageRating.toFixed(1)} ⭐</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-bold">{formatCurrency(product.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock:</span>
                        <span className="font-bold">{product.stock}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProtectedVendorAnalytics = () => {
  return (
    <ProtectedRoute allowedRoles={['vendor']}>
      <VendorAnalytics />
    </ProtectedRoute>
  );
};

export default ProtectedVendorAnalytics; 