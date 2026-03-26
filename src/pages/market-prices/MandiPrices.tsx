
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, MapPin, Calendar, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for mandi prices
const mandiData = [
  {
    state: "Uttar Pradesh",
    mandis: [
      {
        name: "Azadpur Mandi",
        location: "Lucknow",
        prices: [
          { commodity: "Rice", price: 34, prevPrice: 30, unit: "kg" },
          { commodity: "Wheat", price: 27, prevPrice: 25, unit: "kg" },
          { commodity: "Potatoes", price: 18, prevPrice: 20, unit: "kg" },
          { commodity: "Tomatoes", price: 35, prevPrice: 30, unit: "kg" }
        ]
      },
      {
        name: "Sadar Mandi",
        location: "Kanpur",
        prices: [
          { commodity: "Rice", price: 32, prevPrice: 30, unit: "kg" },
          { commodity: "Wheat", price: 25, prevPrice: 25, unit: "kg" },
          { commodity: "Potatoes", price: 17, prevPrice: 19, unit: "kg" },
          { commodity: "Tomatoes", price: 34, prevPrice: 29, unit: "kg" }
        ]
      }
    ]
  },
  {
    state: "Punjab",
    mandis: [
      {
        name: "Khanna Mandi",
        location: "Ludhiana",
        prices: [
          { commodity: "Rice", price: 36, prevPrice: 32, unit: "kg" },
          { commodity: "Wheat", price: 28, prevPrice: 27, unit: "kg" },
          { commodity: "Potatoes", price: 19, prevPrice: 20, unit: "kg" },
          { commodity: "Tomatoes", price: 37, prevPrice: 32, unit: "kg" }
        ]
      },
      {
        name: "Amritsar Mandi",
        location: "Amritsar",
        prices: [
          { commodity: "Rice", price: 35, prevPrice: 33, unit: "kg" },
          { commodity: "Wheat", price: 29, prevPrice: 26, unit: "kg" },
          { commodity: "Potatoes", price: 18, prevPrice: 19, unit: "kg" },
          { commodity: "Tomatoes", price: 36, prevPrice: 31, unit: "kg" }
        ]
      }
    ]
  },
  {
    state: "Maharashtra",
    mandis: [
      {
        name: "Vashi Mandi",
        location: "Mumbai",
        prices: [
          { commodity: "Rice", price: 38, prevPrice: 35, unit: "kg" },
          { commodity: "Wheat", price: 30, prevPrice: 29, unit: "kg" },
          { commodity: "Potatoes", price: 21, prevPrice: 20, unit: "kg" },
          { commodity: "Tomatoes", price: 40, prevPrice: 35, unit: "kg" }
        ]
      },
      {
        name: "Pune Market",
        location: "Pune",
        prices: [
          { commodity: "Rice", price: 37, prevPrice: 34, unit: "kg" },
          { commodity: "Wheat", price: 29, prevPrice: 28, unit: "kg" },
          { commodity: "Potatoes", price: 20, prevPrice: 19, unit: "kg" },
          { commodity: "Tomatoes", price: 39, prevPrice: 36, unit: "kg" }
        ]
      }
    ]
  }
];

// Helper function to calculate percentage change
const calculateChange = (current: number, previous: number) => {
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change).toFixed(1),
    trend: change >= 0 ? "up" : "down"
  };
};

const MandiPrices = () => {
  const [selectedState, setSelectedState] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("all");

  // Filter mandis based on state selection and search query
  const filteredMandis = mandiData
    .filter(stateData => selectedState === "all" || stateData.state === selectedState)
    .flatMap(stateData => 
      stateData.mandis.filter(mandi => 
        mandi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mandi.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mandi.prices.some(p => p.commodity.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-white to-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <Badge className="mb-2" variant="outline">Price Information</Badge>
          <h2 className="text-3xl font-bold mb-4">Mandi Prices</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Real-time agricultural commodity prices from mandis across India. Plan your sales for maximum profit.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input 
              placeholder="Search mandis, locations, or commodities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full"
            />
          </div>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {mandiData.map((state, idx) => (
                <SelectItem key={idx} value={state.state}>{state.state}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="flex gap-2 bg-[#138808] hover:bg-[#138808]/90">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>

        {/* Tabs for commodity type */}
        <Tabs defaultValue="all" className="mb-8" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="w-full md:w-fit">
            <TabsTrigger value="all">All Commodities</TabsTrigger>
            <TabsTrigger value="rice">Rice</TabsTrigger>
            <TabsTrigger value="wheat">Wheat</TabsTrigger>
            <TabsTrigger value="vegetables">Vegetables</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Mandi Price Cards */}
        <div className="grid gap-6">
          {filteredMandis.length > 0 ? filteredMandis.map((mandi, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-duration-300">
              <CardHeader className="bg-gray-50 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">{mandi.name}</CardTitle>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{mandi.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mandi.prices
                    .filter(price => selectedTab === "all" || 
                      (selectedTab === "rice" && price.commodity === "Rice") ||
                      (selectedTab === "wheat" && price.commodity === "Wheat") ||
                      (selectedTab === "vegetables" && (price.commodity === "Potatoes" || price.commodity === "Tomatoes"))
                    )
                    .map((price, idx) => {
                      const change = calculateChange(price.price, price.prevPrice);
                      return (
                        <div key={idx} className="bg-white p-4 rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{price.commodity}</h3>
                            <div className={`flex items-center ${change.trend === "up" ? "text-red-500" : "text-green-500"}`}>
                              {change.trend === "up" ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="text-xs ml-1">{change.value}%</span>
                            </div>
                          </div>
                          <p className="text-2xl font-bold mt-2">₹{price.price}/{price.unit}</p>
                          <p className="text-xs text-gray-500 mt-1">Previous: ₹{price.prevPrice}/{price.unit}</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No mandis found matching your criteria.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSelectedState("all");
                  setSearchQuery("");
                  setSelectedTab("all");
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>

        {/* Information Box */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle>Profit Analysis Guidelines</CardTitle>
            <CardDescription>Maximize your margins by understanding market trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-600">
                To maximize your profits as a farmer or vendor, consider the following strategies:
              </p>
              <ul className="text-gray-600 mt-2">
                <li>Compare prices across different mandis to find the best selling opportunities</li>
                <li>Monitor price trends over time to identify optimal selling periods</li>
                <li>Consider transportation costs when evaluating different mandis</li>
                <li>Explore direct-to-consumer opportunities to bypass intermediaries</li>
                <li>Build relationships with regular buyers to secure stable prices</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Our mandi price dashboard is updated daily to provide you with the most accurate information for your decision-making process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MandiPrices;