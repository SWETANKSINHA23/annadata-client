import { lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Leaf, ShoppingCart, Truck, LineChart, Shield, Globe, MessageCircle, BookOpen, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import MarketPrices from "@/pages/market-prices/MarketPrices";

// Lazy load non-critical components
const Features = lazy(() => import("@/components/Features"));
const HowItWorks = lazy(() => import("@/components/HowItWorks"));
const Reviews = lazy(() => import("@/components/Reviews"));
const Contact = lazy(() => import("@/components/Contact"));
const Footer = lazy(() => import("@/components/Footer"));

// Simple loading component
const SectionLoading = () => (
  <div className="py-16">
    <div className="container mx-auto px-4">
      <div className="h-60 bg-gray-100 animate-pulse rounded-lg"></div>
    </div>
  </div>
);

const UserRoles = [
  {
    title: "Farmer",
    description: "Sell your produce directly to vendors and earn more",
    icon: <Leaf className="h-8 w-8 text-[#138808]" />,
    path: "/dashboard/farmer",
    features: [
      "Manage your product listings",
      "Track orders and payments",
      "Access market analytics",
      "Monitor crop health data"
    ],
    color: "bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200",
    buttonColor: "bg-[#138808] hover:bg-[#138808]/90"
  },
  {
    title: "Vendor",
    description: "Source quality produce directly from farmers",
    icon: <ShoppingCart className="h-8 w-8 text-[#FF9933]" />,
    path: "/dashboard/vendor",
    features: [
      "Discover fresh products",
      "Compare prices and quality",
      "Place bulk orders",
      "Manage your inventory"
    ],
    color: "bg-gradient-to-br from-orange-50 to-amber-100 border-amber-200",
    buttonColor: "bg-[#FF9933] hover:bg-[#FF9933]/90"
  },
  {
    title: "Consumer",
    description: "Buy fresh produce from local vendors near you",
    icon: <Users className="h-8 w-8 text-[#0000FF]" />,
    path: "/dashboard/consumer",
    features: [
      "Find nearby vendors",
      "Compare prices",
      "Track orders in real-time",
      "Save on frequently purchased items"
    ],
    color: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200",
    buttonColor: "bg-[#0000FF] hover:bg-[#0000FF]/90"
  }
];

const PlatformFeatures = [
  {
    title: "Secure Transactions",
    description: "End-to-end encrypted payment processing with multiple options",
    icon: <Shield className="h-6 w-6 text-purple-600" />
  },
  {
    title: "Real-time Analytics",
    description: "Data-driven insights for farmers and vendors to optimize their business",
    icon: <LineChart className="h-6 w-6 text-blue-600" />
  },
  {
    title: "Efficient Logistics",
    description: "Integrated delivery tracking and management system",
    icon: <Truck className="h-6 w-6 text-orange-600" />
  },
  {
    title: "Community Forums",
    description: "Connect with other users to share knowledge and best practices",
    icon: <MessageCircle className="h-6 w-6 text-pink-600" />
  },
  {
    title: "Educational Resources",
    description: "Access to latest farming techniques and market trends",
    icon: <BookOpen className="h-6 w-6 text-indigo-600" />
  }
];

const Homepage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      
      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-2" variant="outline">Choose Your Role</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Select Your Portal</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Annadata offers specialized interfaces for farmers, vendors, and consumers in the agricultural ecosystem.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {UserRoles.map((role, index) => (
              <Card 
                key={index} 
                className={`overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${role.color}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    {role.icon}
                    <Badge variant="outline">{role.title}</Badge>
                  </div>
                  <CardTitle className="text-xl mt-2">{role.title} Portal</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <ul className="space-y-2 mb-6">
                    {role.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-start">
                        <div className="mr-2 mt-1 bg-white rounded-full p-1">
                          <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* <Link to={role.path}>
                    <Button className={`w-full ${role.buttonColor} transition-all duration-300`}>
                      Enter {role.title} Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link> */}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Admin Portal Link */}
          {/* <div className="mt-8 text-center">
            <Link to="/admin-login" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300">
              <Lock className="h-4 w-4 mr-1" />
              <span>Admin Portal</span>
            </Link>
          </div> */}
        </div>
      </section>
      
      <Suspense fallback={<SectionLoading />}>
        <Features />
      </Suspense>
      
      <section className="py-20 px-4 md:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-2" variant="outline">Platform Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for the Agricultural Ecosystem</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform provides a comprehensive set of tools and features designed to connect and empower all participants in the agricultural value chain.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PlatformFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-6 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="rounded-full bg-gray-50 p-3 inline-block mb-4 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="transition-transform duration-300 hover:scale-105">
                Learn How It Works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Suspense fallback={<SectionLoading />}>
        <HowItWorks />
      </Suspense>
    

      <Suspense fallback={<SectionLoading />}>
        <MarketPrices />
        <div className="flex items-center justify-center bg-none"><Link to="/market-prices"><Button>Know More</Button></Link></div>
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <Reviews />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <Contact />
      </Suspense>
      
      <Suspense fallback={<SectionLoading />}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Homepage;
