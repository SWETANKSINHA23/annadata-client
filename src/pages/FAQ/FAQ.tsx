import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, Phone, Mail, MessageCircle } from "lucide-react";

// FAQ data
const faqs = [
  {
    category: "General",
    questions: [
      {
        question: "What is Annadata?",
        answer: "Annadata is an integrated digital platform that connects farmers, vendors, and consumers in the agricultural ecosystem. Our mission is to create a transparent, efficient, and fair marketplace for agricultural produce."
      },
      {
        question: "How does Annadata work?",
        answer: "Annadata works by providing specialized interfaces for farmers, vendors, and consumers. Farmers can list their products, vendors can source quality produce directly, and consumers can buy fresh goods from local vendors."
      },
      {
        question: "Is Annadata available throughout India?",
        answer: "We are currently operational in select states including Punjab, Haryana, Uttar Pradesh, Maharashtra, and Karnataka. We're rapidly expanding to cover more regions across India."
      },
      {
        question: "Do I need to download an app to use Annadata?",
        answer: "While our platform is accessible through the web browser, we recommend downloading our mobile app for the best experience, especially for users with intermittent internet connectivity."
      }
    ]
  },
  {
    category: "For Farmers",
    questions: [
      {
        question: "How do I register as a farmer on Annadata?",
        answer: "To register as a farmer, visit our website or app and click on 'Join as Farmer'. You'll need to provide basic details, verification documents, and information about your farm and produce."
      },
      {
        question: "What types of products can I list on Annadata?",
        answer: "You can list all types of agricultural produce including fruits, vegetables, grains, pulses, dairy products, and other farm goods. Each category has specific listing requirements."
      },
      {
        question: "How do I set prices for my products?",
        answer: "You have complete control over your product pricing. Our platform provides market intelligence and price guidance to help you make informed decisions, but the final price is set by you."
      },
      {
        question: "How will I receive payment for my products?",
        answer: "Payments are processed securely through our platform. You can choose to receive payments directly to your bank account, UPI, or other supported payment methods."
      }
    ]
  },
  {
    category: "For Vendors",
    questions: [
      {
        question: "How do I find farmers near me?",
        answer: "After registering as a vendor, you can use our location-based search to find farmers in your area. You can filter by product type, distance, and other criteria to find the right suppliers."
      },
      {
        question: "Can I negotiate prices with farmers?",
        answer: "Yes, our platform allows direct communication between vendors and farmers. You can discuss prices, quantities, and delivery terms before finalizing orders."
      },
      {
        question: "Does Annadata handle logistics and delivery?",
        answer: "We offer integrated logistics solutions that you can opt for during the purchase process. You can also arrange your own transportation if preferred."
      },
      {
        question: "How does quality control work?",
        answer: "Farmers are rated based on product quality and reliability. We also have a verification process for listed products, and our platform allows you to report quality issues."
      }
    ]
  },
  {
    category: "For Consumers",
    questions: [
      {
        question: "How do I find local vendors selling fresh produce?",
        answer: "Use our 'Nearby Vendors' feature to discover vendors in your area. You can filter by product type, distance, and ratings to find the best options."
      },
      {
        question: "Can I track where my food comes from?",
        answer: "Yes, most products on our platform include information about the source farm, farming practices used, and the journey from farm to vendor to you."
      },
      {
        question: "What payment methods are accepted?",
        answer: "We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery for select areas."
      },
      {
        question: "How do I report issues with my order?",
        answer: "You can report issues directly through the order details page in your account. Our customer support team aims to resolve all issues within 24-48 hours."
      }
    ]
  }
];

const FAQPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
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
      <m.div 
        className="max-w-4xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600 mb-8">
          Find answers to the most common questions about Annadata and our services.
        </p>
        <div className="relative max-w-2xl mx-auto">
          <Input
            type="search"
            placeholder="Search for answers..."
            className="pl-10 pr-4 py-3 rounded-full"
          />
          <Search className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
          <Button className="absolute right-1.5 top-1.5 rounded-full bg-[#138808] hover:bg-[#0d6b06] h-8 w-8 p-0">
            <Search className="h-4 w-4 text-white" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
      </m.div>

      {/* FAQ Sections by Category */}
      <m.div 
        className="max-w-4xl mx-auto space-y-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {faqs.map((category, index) => (
          <m.div key={index} variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{category.category}</h2>
            <Accordion type="single" collapsible className="mb-8">
              {category.questions.map((faq, faqIndex) => (
                <AccordionItem key={faqIndex} value={`${index}-${faqIndex}`}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-start">
                      <HelpCircle className="h-5 w-5 text-[#138808] mr-3 mt-0.5 flex-shrink-0" />
                      <span>{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pl-8">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </m.div>
        ))}
      </m.div>

      {/* Contact Cards */}
      <m.div 
        className="max-w-4xl mx-auto mt-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl font-bold mb-8 text-center text-gray-800">Still Have Questions?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="bg-[#138808]/10 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <Phone className="h-5 w-5 text-[#138808]" />
              </div>
              <CardTitle className="text-lg">Phone Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Talk to our dedicated support team</p>
              <p className="font-medium">+91 98765 43210</p>
              <p className="text-sm text-gray-500">Mon-Fri: 9AM - 6PM</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="bg-[#138808]/10 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-[#138808]" />
              </div>
              <CardTitle className="text-lg">Email Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Send us your query anytime</p>
              <p className="font-medium">support@annadataharmony.com</p>
              <p className="text-sm text-gray-500">We respond within 24 hours</p>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="bg-[#138808]/10 w-10 h-10 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-5 w-5 text-[#138808]" />
              </div>
              <CardTitle className="text-lg">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Chat with our support team</p>
              <Button className="bg-[#138808] hover:bg-[#0d6b06] w-full">
                Start Chat
              </Button>
              <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
            </CardContent>
          </Card>
        </div>
      </m.div>
    </div>
  );
};

export default FAQPage;
