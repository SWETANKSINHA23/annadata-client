
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import LocationMap from "../components/maps/LocationMap"; 

const ContactPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

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
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-800">Contact Us</h1>
        <p className="text-lg text-gray-600">
          Have a question or feedback? We're here to help. Reach out to our tea
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Get In Touch</h2>
            <p className="text-gray-600 mb-8">
              Our team is ready to assist you with any questions about our platform, services, or how to get started.
            </p>
          </div>
          
          <div variants={itemVariants}>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="bg-[#138808]/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-[#138808]" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Office Location</h3>
                    <p className="text-gray-600">123 Agricultural Zone, New Delhi, 110001, India</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div variants={itemVariants}>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="bg-[#138808]/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-[#138808]" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Phone Number</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-gray-600">+91 12345 67890 (Support)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div variants={itemVariants}>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="bg-[#138808]/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-[#138808]" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email Address</h3>
                    <p className="text-gray-600">info@annadataharmony.com</p>
                    <p className="text-gray-600">support@annadataharmony.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div variants={itemVariants}>
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="flex space-x-4">
                  <div className="bg-[#138808]/10 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-[#138808]" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Working Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Your Name</label>
                    <Input 
                      id="name"
                      name="name"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                    <Input 
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                    <Input 
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input 
                      id="subject"
                      name="subject"
                      placeholder="What is this regarding?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Your Message</label>
                  <Textarea 
                    id="message"
                    name="message"
                    placeholder="Write your message here..."
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#138808] hover:bg-[#0d6b06]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Message...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-4 w-4" /> Send Message
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Map Section */}
      <div className="mt-20">
        <h2 
          className="text-2xl font-bold mb-6 text-center text-gray-800"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Find Us on the Map
        </h2>
        <div 
          className="aspect-[16/9] max-h-[400px] rounded-xl overflow-hidden shadow-md"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* <LocationMap 
            title="Our Office Location" 
            description="Visit us at our Delhi headquarters"
          /> */}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;