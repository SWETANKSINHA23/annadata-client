import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import AdminNav from '@/components/navigation/AdminNav';
import { HelpCircle, Mail, MessageSquare, Phone, BookOpen } from 'lucide-react';

const HelpSupport = () => {
  const handleSupportRequest = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Support Request Sent",
      description: "Our team will get back to you shortly.",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Help & Support</h1>
        
        <Tabs defaultValue="documentation" className="space-y-6">
          <TabsList>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documentation">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-[#138808]" />
                    Admin Guide
                  </CardTitle>
                  <CardDescription>Master the admin dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-blue-600 hover:underline cursor-pointer">Getting Started</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">User Management</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Product Moderation</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Order Processing</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Analytics & Reports</li>
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    View Full Documentation
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <HelpCircle className="h-5 w-5 mr-2 text-[#138808]" />
                    Tutorials
                  </CardTitle>
                  <CardDescription>Step-by-step visual guides</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-blue-600 hover:underline cursor-pointer">Setting Up User Roles</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Managing Product Categories</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Running Reports</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Platform Configuration</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Managing Bulk Orders</li>
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    Browse Tutorials
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-[#138808]" />
                    Community
                  </CardTitle>
                  <CardDescription>Connect with other administrators</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="text-blue-600 hover:underline cursor-pointer">Admin Forums</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Feature Requests</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Bug Reports</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Knowledge Base</li>
                    <li className="text-blue-600 hover:underline cursor-pointer">Release Notes</li>
                  </ul>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    Join Community
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find answers to common questions about the admin portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I add a new administrator?</AccordionTrigger>
                    <AccordionContent>
                      To add a new administrator, go to Users Management, click "Add New User", fill in the user details, 
                      and select "Admin" as the user role. New administrators will receive an email invitation 
                      with instructions to set up their account.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>How do I approve or reject products?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to the Products section, where you'll see a list of products pending approval. 
                      Click on any product to view its details, then use the "Approve" or "Reject" buttons. 
                      If rejecting, you can provide a reason that will be sent to the seller.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I generate custom reports?</AccordionTrigger>
                    <AccordionContent>
                      Go to the Analytics section and click on "Custom Reports". From there you can select 
                      date ranges, metrics, dimensions, and filtering criteria to build your custom report. 
                      Reports can be exported as CSV, Excel, or PDF files.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4">
                    <AccordionTrigger>How do I resolve disputes between vendors and consumers?</AccordionTrigger>
                    <AccordionContent>
                      Navigate to the Orders section and filter by "Disputed" status. Click on the order to view 
                      details of the dispute. You can review communications, order details, and evidence provided 
                      by both parties. Use the "Resolve Dispute" button to make a determination and notify both parties.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I configure notification settings?</AccordionTrigger>
                    <AccordionContent>
                      Go to Settings, then select the "Notifications" tab. Here you can configure which events trigger 
                      notifications, who receives them, and through which channels (email, in-app, SMS). You can also 
                      set up automated notification rules based on system events.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Need personalized assistance? Reach out to our dedicated support team.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center p-4 border rounded-lg">
                    <Phone className="h-10 w-10 text-[#138808] mr-4" />
                    <div>
                      <h3 className="font-medium">Phone Support</h3>
                      <p className="text-sm text-gray-500">Available 24/7</p>
                      <p className="text-sm font-medium">+91 1234567890</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-lg">
                    <Mail className="h-10 w-10 text-[#138808] mr-4" />
                    <div>
                      <h3 className="font-medium">Email Support</h3>
                      <p className="text-sm text-gray-500">Response within 24 hours</p>
                      <p className="text-sm font-medium">admin-support@annadata.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 border rounded-lg">
                    <MessageSquare className="h-10 w-10 text-[#138808] mr-4" />
                    <div>
                      <h3 className="font-medium">Live Chat</h3>
                      <p className="text-sm text-gray-500">Available 9 AM - 9 PM</p>
                      <Button variant="outline" size="sm" className="mt-1">
                        Start Chat
                      </Button>
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleSupportRequest} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                    <Input id="subject" placeholder="Brief description of your issue" />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <Textarea id="message" placeholder="Please describe your issue in detail" rows={6} />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="attachments" className="text-sm font-medium">Attachments (optional)</label>
                    <Input id="attachments" type="file" multiple />
                  </div>
                  
                  <Button type="submit" className="bg-[#138808] hover:bg-[#138808]/90">
                    Submit Support Request
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HelpSupport; 