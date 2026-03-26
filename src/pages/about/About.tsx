
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, TrendingUp, ShieldCheck, Users, Heart } from "lucide-react";
import { Link } from 'react-router-dom';

const About = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div 
        className="max-w-4xl mx-auto text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">About Annadata</h1>
        <p className="text-lg text-gray-600 mb-8">
          Transforming the agricultural ecosystem through technology-driven integration and empowerment.
        </p>
        <div className="relative h-80 rounded-xl overflow-hidden mb-8">
          <img 
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=1470&auto=format&fit=crop" 
            alt="Farmers in a field" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
            <div className="p-8 text-white">
              <p className="font-medium text-xl">Building bridges between farm and table</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Mission */}
      <section 
        className="mb-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Our Mission</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div variants={itemVariants}>
            <h3 className="text-2xl font-semibold mb-4 text-[#138808]">Empowering Farmers</h3>
            <p className="text-gray-600 mb-6">
              Our mission is to transform the agricultural landscape by empowering farmers with technology, 
              fair market access, and sustainable practices. We're committed to increasing farmer incomes 
              and improving livelihoods across rural India.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-[#138808]/10 p-2 rounded-full mr-4">
                  <TrendingUp className="h-5 w-5 text-[#138808]" />
                </div>
                <div>
                  <h4 className="font-medium">Increased Income</h4>
                  <p className="text-sm text-gray-600">Enabling farmers to get better prices through direct market access</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#138808]/10 p-2 rounded-full mr-4">
                  <Award className="h-5 w-5 text-[#138808]" />
                </div>
                <div>
                  <h4 className="font-medium">Quality Recognition</h4>
                  <p className="text-sm text-gray-600">Highlighting quality produce and sustainable farming practices</p>
                </div>
              </div>
            </div>
          </div>
          <div variants={itemVariants} className="rounded-xl overflow-hidden shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1620656798579-1984d5ed7d97?q=80&w=1470&auto=format&fit=crop" 
              alt="Farmer with crops" 
              className="w-full h-64 object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Our Vision */}
      <section 
        className="mb-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Our Vision</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div variants={itemVariants} className="rounded-xl overflow-hidden shadow-lg order-2 md:order-1">
            <img 
              src="https://images.unsplash.com/photo-1621844761088-9ed6095be7d0?q=80&w=1528&auto=format&fit=crop" 
              alt="Modern agriculture" 
              className="w-full h-64 object-cover"
              loading="lazy"
            />
          </div>
          <div variants={itemVariants} className="order-1 md:order-2">
            <h3 className="text-2xl font-semibold mb-4 text-[#138808]">A Self-Sustaining Ecosystem</h3>
            <p className="text-gray-600 mb-6">
              We envision a future where the agricultural ecosystem is transparent, efficient, and equitable. 
              Where technology bridges gaps, enhances productivity, and creates value for all stakeholders - 
              from farmers to end consumers.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-[#138808]/10 p-2 rounded-full mr-4">
                  <ShieldCheck className="h-5 w-5 text-[#138808]" />
                </div>
                <div>
                  <h4 className="font-medium">Transparent Supply Chain</h4>
                  <p className="text-sm text-gray-600">Full traceability from farm to table</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-[#138808]/10 p-2 rounded-full mr-4">
                  <Users className="h-5 w-5 text-[#138808]" />
                </div>
                <div>
                  <h4 className="font-medium">Community Building</h4>
                  <p className="text-sm text-gray-600">Creating networks of support and knowledge sharing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section 
        className="py-16 bg-[#138808]/5 rounded-xl mb-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Impact</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Since our inception, we've made significant strides in transforming agricultural communities across India.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div variants={itemVariants} className="text-center">
            <p className="text-4xl font-bold text-[#138808]">50,000+</p>
            <p className="text-gray-600 mt-2">Farmers Connected</p>
          </div>
          <div variants={itemVariants} className="text-center">
            <p className="text-4xl font-bold text-[#138808]">5,000+</p>
            <p className="text-gray-600 mt-2">Vendors Onboarded</p>
          </div>
          <div variants={itemVariants} className="text-center">
            <p className="text-4xl font-bold text-[#138808]">200+</p>
            <p className="text-gray-600 mt-2">Districts Covered</p>
          </div>
          <div variants={itemVariants} className="text-center">
            <p className="text-4xl font-bold text-[#138808]">35%</p>
            <p className="text-gray-600 mt-2">Average Income Increase</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section 
        className="mb-20"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div variants={itemVariants} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Our Core Values</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            These principles guide everything we do at Annadata.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="bg-[#138808]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-[#138808]" />
                </div>
                <CardTitle>Empathy</CardTitle>
                <CardDescription>Understanding and addressing the unique challenges faced by our stakeholders</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We put ourselves in the shoes of farmers, vendors, and consumers to create solutions that truly matter.
                </p>
              </CardContent>
            </Card>
          </div>
          <div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="bg-[#138808]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6 text-[#138808]" />
                </div>
                <CardTitle>Integrity</CardTitle>
                <CardDescription>Being transparent and fair in all our dealings</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We maintain the highest standards of honesty, fairness, and ethical conduct in everything we do.
                </p>
              </CardContent>
            </Card>
          </div>
          <div variants={itemVariants}>
            <Card>
              <CardHeader>
                <div className="bg-[#138808]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-[#138808]" />
                </div>
                <CardTitle>Innovation</CardTitle>
                <CardDescription>Constantly evolving to create better solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We continuously seek new ways to solve problems and enhance the agricultural ecosyste
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section 
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Join Our Movement</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Be part of the revolution transforming agriculture in India. Together, we can create a more sustainable and prosperous future.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-[#138808] hover:bg-[#0d6b06]">
              <Link to="/register" className="flex items-center">
                Join Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline">
              <Link to="/contact" className="flex items-center">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;