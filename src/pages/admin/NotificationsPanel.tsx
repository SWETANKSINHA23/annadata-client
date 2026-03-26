import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import AdminNav from '@/components/navigation/AdminNav';
import { 
  Bell, 
  User, 
  Package, 
  ShoppingCart, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Calendar,
  Trash
} from 'lucide-react';

// Mock notification data
const mockNotifications = [
  {
    id: 1,
    type: 'system',
    title: 'System Update Scheduled',
    message: 'A system update is scheduled for tonight at 2 AM. The platform will be offline for approximately 30 minutes.',
    date: '2023-07-15T14:30:00',
    isRead: false,
    priority: 'high'
  },
  {
    id: 2,
    type: 'user',
    title: 'New Administrator Account Created',
    message: 'A new administrator account for "John Doe" has been created and is pending your approval.',
    date: '2023-07-14T10:15:00',
    isRead: true,
    priority: 'medium'
  },
  {
    id: 3,
    type: 'order',
    title: 'Bulk Order Dispute',
    message: 'A dispute has been filed for bulk order #BLK-10234. Please review and take action.',
    date: '2023-07-14T08:45:00',
    isRead: false,
    priority: 'high'
  },
  {
    id: 4,
    type: 'product',
    title: 'New Products Pending Approval',
    message: 'There are 5 new products waiting for your review and approval.',
    date: '2023-07-13T16:20:00',
    isRead: true,
    priority: 'medium'
  },
  {
    id: 5,
    type: 'system',
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected for admin account "superadmin". Consider reviewing security logs.',
    date: '2023-07-13T09:10:00',
    isRead: false,
    priority: 'critical'
  },
  {
    id: 6,
    type: 'order',
    title: 'Payment Processing Error',
    message: 'Orders #ORD-7856 and #ORD-7857 have payment processing errors that require manual review.',
    date: '2023-07-12T15:45:00',
    isRead: true,
    priority: 'high'
  },
  {
    id: 7,
    type: 'user',
    title: 'Vendor Account Verification',
    message: 'Vendor "Green Farms Ltd." has submitted verification documents for review.',
    date: '2023-07-11T11:30:00',
    isRead: true,
    priority: 'medium'
  }
];

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      systemUpdates: true,
      newUsers: true,
      orderIssues: true,
      productApprovals: false,
      securityAlerts: true
    },
    inApp: {
      systemUpdates: true,
      newUsers: true,
      orderIssues: true,
      productApprovals: true,
      securityAlerts: true
    },
    sms: {
      systemUpdates: false,
      newUsers: false,
      orderIssues: false,
      productApprovals: false,
      securityAlerts: true
    }
  });

  // Function to mark a notification as read
  const markAsRead = (id: number) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  // Function to mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Filter notifications based on selected type
  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(notification => !notification.isRead)
      : notifications.filter(notification => notification.type === filter);

  // Function to clear all notifications
  const clearAllNotifications = () => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      setNotifications([]);
    }
  };

  // Function to update notification settings
  const updateSettings = (channel: 'email' | 'inApp' | 'sms', setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [setting]: value
      }
    }));
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'system': return <Info className="h-5 w-5 text-blue-500" />;
      case 'user': return <User className="h-5 w-5 text-green-500" />;
      case 'product': return <Package className="h-5 w-5 text-purple-500" />;
      case 'order': return <ShoppingCart className="h-5 w-5 text-orange-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Notifications</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All as Read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllNotifications} className="text-red-500 border-red-200 hover:bg-red-50">
              <Trash className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilter('all')}>All</TabsTrigger>
              <TabsTrigger value="unread" onClick={() => setFilter('unread')}>Unread</TabsTrigger>
              <TabsTrigger value="system" onClick={() => setFilter('system')}>System</TabsTrigger>
              <TabsTrigger value="user" onClick={() => setFilter('user')}>Users</TabsTrigger>
              <TabsTrigger value="product" onClick={() => setFilter('product')}>Products</TabsTrigger>
              <TabsTrigger value="order" onClick={() => setFilter('order')}>Orders</TabsTrigger>
            </TabsList>
            
            <Select defaultValue="newest">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <TabsContent value="all" className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map(notification => (
                <Card 
                  key={notification.id} 
                  className={`border-l-4 ${!notification.isRead ? 'border-l-blue-500 bg-blue-50' : 'border-l-gray-200'}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium">
                            {notification.title}
                            <span className={`ml-2 inline-block w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></span>
                          </h3>
                          <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <div className="flex justify-end mt-2">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-10">
                <Bell className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                <p className="mt-1 text-sm text-gray-500">You're all caught up! No notifications to display.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Other tab contents will show the same content based on filters */}
          <TabsContent value="unread" className="space-y-4">
            {/* Content is dynamically filtered through the filteredNotifications variable */}
            {filteredNotifications.length === 0 && (
              <div className="text-center py-10">
                <CheckCircle className="mx-auto h-10 w-10 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No unread notifications</h3>
                <p className="mt-1 text-sm text-gray-500">You've read all your notifications!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Email Notifications</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="email-system" 
                          checked={notificationSettings.email.systemUpdates}
                          onCheckedChange={(checked) => 
                            updateSettings('email', 'systemUpdates', checked as boolean)
                          }
                        />
                        <label htmlFor="email-system" className="text-sm">System Updates</label>
                      </div>
                      <span className="text-xs text-gray-500">Maintenance, updates, and downtime alerts</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="email-users" 
                          checked={notificationSettings.email.newUsers}
                          onCheckedChange={(checked) => 
                            updateSettings('email', 'newUsers', checked as boolean)
                          }
                        />
                        <label htmlFor="email-users" className="text-sm">User Management</label>
                      </div>
                      <span className="text-xs text-gray-500">New user registrations and account changes</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="email-orders" 
                          checked={notificationSettings.email.orderIssues}
                          onCheckedChange={(checked) => 
                            updateSettings('email', 'orderIssues', checked as boolean)
                          }
                        />
                        <label htmlFor="email-orders" className="text-sm">Order Issues</label>
                      </div>
                      <span className="text-xs text-gray-500">Disputes, payment failures, and order problems</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-3">In-App Notifications</h3>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm">Enable in-app notifications</span>
                    <Switch checked={true} />
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Control which notifications appear in your notification panel
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="app-system" 
                        checked={notificationSettings.inApp.systemUpdates}
                        onCheckedChange={(checked) => 
                          updateSettings('inApp', 'systemUpdates', checked as boolean)
                        }
                      />
                      <label htmlFor="app-system" className="text-sm">System Updates</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="app-users" 
                        checked={notificationSettings.inApp.newUsers}
                        onCheckedChange={(checked) => 
                          updateSettings('inApp', 'newUsers', checked as boolean)
                        }
                      />
                      <label htmlFor="app-users" className="text-sm">User Management</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="app-orders" 
                        checked={notificationSettings.inApp.orderIssues}
                        onCheckedChange={(checked) => 
                          updateSettings('inApp', 'orderIssues', checked as boolean)
                        }
                      />
                      <label htmlFor="app-orders" className="text-sm">Order Issues</label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="app-products" 
                        checked={notificationSettings.inApp.productApprovals}
                        onCheckedChange={(checked) => 
                          updateSettings('inApp', 'productApprovals', checked as boolean)
                        }
                      />
                      <label htmlFor="app-products" className="text-sm">Product Approvals</label>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-3">
                    <h3 className="text-sm font-medium">Critical Alerts</h3>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Always Enabled</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Critical security alerts cannot be disabled and will be sent through all channels
                  </p>
                </div>
                
                <Button className="w-full bg-[#138808] hover:bg-[#138808]/90">
                  Save Notification Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotificationsPanel; 