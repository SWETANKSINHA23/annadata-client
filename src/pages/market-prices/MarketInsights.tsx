
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, LineChart, ArrowUpRight, ArrowDownRight, BarChart3 } from "lucide-react";
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Sample data for the market trends
const marketTrendsData = [
  { month: "Jan", rice: 32, wheat: 25, potatoes: 20, tomatoes: 30, onions: 18 },
  { month: "Feb", rice: 34, wheat: 27, potatoes: 19, tomatoes: 29, onions: 17 },
  { month: "Mar", rice: 35, wheat: 28, potatoes: 21, tomatoes: 28, onions: 19 },
  { month: "Apr", rice: 33, wheat: 27, potatoes: 20, tomatoes: 32, onions: 22 },
  { month: "May", rice: 37, wheat: 30, potatoes: 22, tomatoes: 35, onions: 24 },
  { month: "Jun", rice: 38, wheat: 32, potatoes: 24, tomatoes: 37, onions: 26 },
];

// Sample data for market volume
const volumeData = [
  { name: "Rice", current: 1200, previous: 1000 },
  { name: "Wheat", current: 900, previous: 850 },
  { name: "Potatoes", current: 700, previous: 600 },
  { name: "Tomatoes", current: 500, previous: 450 },
  { name: "Onions", current: 300, previous: 280 },
];

// Sample insights data
const insightsData = [
  {
    title: "Rice",
    trend: "up",
    percentage: "+8.2%",
    description: "Prices rising due to decreased production in key regions",
  },
  {
    title: "Wheat",
    trend: "up",
    percentage: "+4.5%",
    description: "Global demand increase affecting local prices",
  },
  {
    title: "Potatoes",
    trend: "down",
    percentage: "-2.1%",
    description: "Bumper harvest in northern states driving prices down",
  },
  {
    title: "Tomatoes",
    trend: "up",
    percentage: "+12.4%",
    description: "Seasonal shortages due to weather conditions",
  },
];

const MarketInsights = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <Badge className="mb-2" variant="outline">Market Analytics</Badge>
          <h2 className="text-3xl font-bold mb-4">Detailed Market Insights</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Comprehensive analytics and trends for agricultural commodities to help you make informed decisions.
          </p>
        </div>
        
        {/* Market Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {insightsData.map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <div className={`flex items-center ${
                    item.trend === 'up' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {item.trend === 'up' ? (
                      <ArrowUpRight className="h-5 w-5" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5" />
                    )}
                    <span className="font-semibold">{item.percentage}</span>
                  </div>
                </div>
                <CardDescription className="mt-2">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        
        {/* Market Trends Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Price Trends</CardTitle>
                  <CardDescription>6-month price movement of major commodities</CardDescription>
                </div>
                <LineChart className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLine data={marketTrendsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rice" 
                      stroke="#0088FE" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wheat" 
                      stroke="#00C49F" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="potatoes" 
                      stroke="#FFBB28" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="tomatoes" 
                      stroke="#FF8042" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="onions" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      dot={{ r: 3 }} 
                      activeDot={{ r: 5 }}
                    />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trading Volume</CardTitle>
                  <CardDescription>Current vs Previous month comparison</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="previous" name="Previous Month" fill="#8884d8" />
                    <Bar dataKey="current" name="Current Month" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Insights */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Market Analysis</CardTitle>
            <CardDescription>Key insights for agricultural commodities in the current market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                The agricultural commodities market has shown significant fluctuations in the past quarter. Rice prices 
                continue their upward trend due to lower production yields in key growing regions, coupled with 
                increased export demand from neighboring countries. Wheat prices have stabilized after initial volatility, 
                with analysts expecting modest growth in the coming months.
              </p>
              <p className="text-gray-600 mt-4">
                Vegetable commodities display seasonal patterns, with tomatoes showing a sharp increase in price 
                due to unseasonal rainfall in major growing areas. Onion prices are expected to stabilize as 
                new harvests reach the market in the next few weeks. Potatoes have seen a decline in price due to 
                increased production and efficient supply chain management.
              </p>
              <p className="text-gray-600 mt-4">
                Market experts recommend diversification of crops and careful timing of sales to maximize profits 
                in the current market conditions. Farmers should also consider value-added products and direct-to-consumer 
                sales channels to improve margins.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MarketInsights;