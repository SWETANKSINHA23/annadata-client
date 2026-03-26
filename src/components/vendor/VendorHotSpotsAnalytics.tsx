import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Area } from 'recharts';
import { MapPin, TrendingUp, Package, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from '@/lib/axios';
import { toast } from '@/hooks/use-toast';

// Type definitions
interface HotSellingProduct {
  _id: string;
  name: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averageRating: number;
  salesTrend: number; // percentage increase/decrease
}

interface HotSellingArea {
  _id: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  totalOrders: number;
  totalRevenue: number;
  popularProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
  }>;
  coordinates: [number, number];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF5733', '#C70039', '#900C3F', '#581845'];

const VendorHotSpotsAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [hotProducts, setHotProducts] = useState<HotSellingProduct[]>([]);
  const [hotAreas, setHotAreas] = useState<HotSellingArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch hot selling products
      const productsResponse = await api.get(`/analytics/vendor/hot-products?timeRange=${timeRange}`);
      
      // Fetch hot selling areas
      const areasResponse = await api.get(`/analytics/vendor/hot-areas?timeRange=${timeRange}`);
      
      setHotProducts(productsResponse.data || []);
      setHotAreas(areasResponse.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data if backend API isn't ready yet
  useEffect(() => {
    if (!hotProducts.length) {
      // Sample hot products data
      const sampleProducts: HotSellingProduct[] = [
        { _id: '1', name: 'Rice (Basmati)', category: 'Grains', totalQuantitySold: 750, totalRevenue: 45000, averageRating: 4.7, salesTrend: 12 },
        { _id: '2', name: 'Wheat Flour', category: 'Grains', totalQuantitySold: 620, totalRevenue: 31000, averageRating: 4.5, salesTrend: 8 },
        { _id: '3', name: 'Tomatoes', category: 'Vegetables', totalQuantitySold: 450, totalRevenue: 18000, averageRating: 4.2, salesTrend: -3 },
        { _id: '4', name: 'Potatoes', category: 'Vegetables', totalQuantitySold: 380, totalRevenue: 15200, averageRating: 4.0, salesTrend: 5 },
        { _id: '5', name: 'Mangoes', category: 'Fruits', totalQuantitySold: 320, totalRevenue: 28800, averageRating: 4.8, salesTrend: 15 },
      ];
      setHotProducts(sampleProducts);
    }

    if (!hotAreas.length) {
      // Sample hot areas data
      const sampleAreas: HotSellingArea[] = [
        { 
          _id: '1', 
          area: 'Indiranagar', 
          city: 'Bangalore', 
          state: 'Karnataka', 
          pincode: '560038', 
          totalOrders: 320, 
          totalRevenue: 96000,
          popularProducts: [
            { productId: '1', name: 'Rice (Basmati)', quantity: 150 },
            { productId: '5', name: 'Mangoes', quantity: 120 },
          ],
          coordinates: [77.6399, 12.9784]
        },
        { 
          _id: '2', 
          area: 'Koramangala', 
          city: 'Bangalore', 
          state: 'Karnataka', 
          pincode: '560034', 
          totalOrders: 280, 
          totalRevenue: 84000,
          popularProducts: [
            { productId: '2', name: 'Wheat Flour', quantity: 130 },
            { productId: '3', name: 'Tomatoes', quantity: 100 },
          ],
          coordinates: [77.6245, 12.9279]
        },
        { 
          _id: '3', 
          area: 'Whitefield', 
          city: 'Bangalore', 
          state: 'Karnataka', 
          pincode: '560066', 
          totalOrders: 240, 
          totalRevenue: 72000,
          popularProducts: [
            { productId: '4', name: 'Potatoes', quantity: 90 },
            { productId: '5', name: 'Mangoes', quantity: 80 },
          ],
          coordinates: [77.7506, 12.9698]
        },
        { 
          _id: '4', 
          area: 'Jayanagar', 
          city: 'Bangalore', 
          state: 'Karnataka', 
          pincode: '560011', 
          totalOrders: 190, 
          totalRevenue: 57000,
          popularProducts: [
            { productId: '1', name: 'Rice (Basmati)', quantity: 70 },
            { productId: '2', name: 'Wheat Flour', quantity: 65 },
          ],
          coordinates: [77.5938, 12.9252]
        },
      ];
      setHotAreas(sampleAreas);
    }
  }, [hotProducts.length, hotAreas.length]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#138808]" />
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const productSalesData = hotProducts.map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    revenue: product.totalRevenue,
    quantity: product.totalQuantitySold,
    rating: product.averageRating,
    trend: product.salesTrend
  }));

  const areaSalesData = hotAreas.map(area => ({
    name: `${area.area}, ${area.city}`,
    shortName: area.area,
    revenue: area.totalRevenue,
    orders: area.totalOrders
  }));

  const productCategoryData = hotProducts.reduce((acc, product) => {
    const existingCategory = acc.find(item => item.name === product.category);
    if (existingCategory) {
      existingCategory.value += product.totalQuantitySold;
    } else {
      acc.push({ name: product.category, value: product.totalQuantitySold });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#138808]" />
              Hot Selling Areas & Products
            </CardTitle>
            <CardDescription>
              Analyze your top performing products and high-demand areas
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="products" className="flex-1">Hot Products</TabsTrigger>
            <TabsTrigger value="areas" className="flex-1">Hot Areas</TabsTrigger>
            <TabsTrigger value="trends" className="flex-1">Sales Trends</TabsTrigger>
          </TabsList>
          
          {/* Hot Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Products Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productSalesData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
                        <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Product Categories Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Product Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={productCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {productCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} units`, 'Quantity Sold']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left">Product</th>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-right">Units Sold</th>
                        <th className="p-2 text-right">Revenue</th>
                        <th className="p-2 text-right">Rating</th>
                        <th className="p-2 text-right">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotProducts.map((product) => (
                        <tr key={product._id} className="border-b">
                          <td className="p-2 font-medium">{product.name}</td>
                          <td className="p-2">{product.category}</td>
                          <td className="p-2 text-right">{product.totalQuantitySold}</td>
                          <td className="p-2 text-right">₹{product.totalRevenue.toLocaleString()}</td>
                          <td className="p-2 text-right">{product.averageRating.toFixed(1)} ⭐</td>
                          <td className="p-2 text-right">
                            <Badge 
                              variant="outline" 
                              className={
                                product.salesTrend > 0 ? "bg-green-50 text-green-600 border-green-200" :
                                product.salesTrend < 0 ? "bg-red-50 text-red-600 border-red-200" :
                                "bg-gray-50 text-gray-600 border-gray-200"
                              }
                            >
                              {product.salesTrend > 0 ? `+${product.salesTrend}%` : `${product.salesTrend}%`}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Hot Areas Tab */}
          <TabsContent value="areas" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Areas Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top Selling Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={areaSalesData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="shortName" type="category" width={130} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="orders" fill="#8884d8" name="Orders" />
                        <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (₹)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Areas Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Revenue Distribution by Area</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={areaSalesData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="revenue"
                          nameKey="shortName"
                          label={({ shortName, percent }) => `${shortName}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {areaSalesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Areas Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Area Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left">Area</th>
                        <th className="p-2 text-left">City</th>
                        <th className="p-2 text-left">Pincode</th>
                        <th className="p-2 text-right">Orders</th>
                        <th className="p-2 text-right">Revenue</th>
                        <th className="p-2 text-left">Popular Products</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotAreas.map((area) => (
                        <tr key={area._id} className="border-b">
                          <td className="p-2 font-medium">{area.area}</td>
                          <td className="p-2">{area.city}</td>
                          <td className="p-2">{area.pincode}</td>
                          <td className="p-2 text-right">{area.totalOrders}</td>
                          <td className="p-2 text-right">₹{area.totalRevenue.toLocaleString()}</td>
                          <td className="p-2">
                            <div className="flex flex-wrap gap-1">
                              {area.popularProducts.map((product, idx) => (
                                <Badge key={idx} variant="secondary" className="whitespace-nowrap">
                                  {product.name}
                                </Badge>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Sales Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Sales Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Product Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={
                          // Generate sample daily data
                          Array.from({ length: parseInt(timeRange) }, (_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (parseInt(timeRange) - i - 1));
                            return {
                              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                              rice: Math.floor(Math.random() * 50) + 20,
                              wheat: Math.floor(Math.random() * 40) + 15,
                              tomatoes: Math.floor(Math.random() * 30) + 10,
                              potatoes: Math.floor(Math.random() * 25) + 8,
                              mangoes: Math.floor(Math.random() * 35) + 12,
                            };
                          })
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="rice" stroke="#8884d8" name="Rice" />
                        <Line type="monotone" dataKey="wheat" stroke="#82ca9d" name="Wheat" />
                        <Line type="monotone" dataKey="tomatoes" stroke="#ff7300" name="Tomatoes" />
                        <Line type="monotone" dataKey="potatoes" stroke="#0088fe" name="Potatoes" />
                        <Line type="monotone" dataKey="mangoes" stroke="#ff8042" name="Mangoes" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Area Sales Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Area Sales Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={
                          // Generate sample weekly data
                          Array.from({ length: Math.ceil(parseInt(timeRange)/7) }, (_, i) => {
                            const weekNumber = i + 1;
                            return {
                              week: `Week ${weekNumber}`,
                              indiranagar: Math.floor(Math.random() * 15000) + 20000,
                              koramangala: Math.floor(Math.random() * 12000) + 15000,
                              whitefield: Math.floor(Math.random() * 10000) + 12000,
                              jayanagar: Math.floor(Math.random() * 8000) + 10000,
                              totalOrders: Math.floor(Math.random() * 100) + 50,
                            };
                          })
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="indiranagar" fill="#8884d8" stroke="#8884d8" name="Indiranagar" yAxisId="left" />
                        <Area type="monotone" dataKey="koramangala" fill="#82ca9d" stroke="#82ca9d" name="Koramangala" yAxisId="left" />
                        <Area type="monotone" dataKey="whitefield" fill="#ffc658" stroke="#ffc658" name="Whitefield" yAxisId="left" />
                        <Area type="monotone" dataKey="jayanagar" fill="#ff7300" stroke="#ff7300" name="Jayanagar" yAxisId="left" />
                        <Line type="monotone" dataKey="totalOrders" stroke="#ff0000" name="Total Orders" yAxisId="right" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trend Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <TrendingUp className="h-5 w-5" />
                      <h3 className="font-medium">Growing Products</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Mangoes (+15%) and Rice (+12%) are showing strong growth trends. Consider increasing inventory for these items.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <MapPin className="h-5 w-5" />
                      <h3 className="font-medium">Hot Areas</h3>
                    </div>
                    <p className="text-sm text-blue-700">
                      Indiranagar and Koramangala are your strongest markets. Focus delivery optimization for these areas.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                      <Clock className="h-5 w-5" />
                      <h3 className="font-medium">Time Patterns</h3>
                    </div>
                    <p className="text-sm text-amber-700">
                      Weekend sales are 25% higher than weekdays. Consider special weekend promotions to capitalize on this trend.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VendorHotSpotsAnalytics; 