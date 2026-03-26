import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import AdminNav from '@/components/navigation/AdminNav';
import { ArrowLeft, User, Package, BarChart3, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface UserDetails {
  user: {
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    phone: string;
  };
  stats: {
    totalOrders: number;
    totalProducts: number;
    totalRatings: number;
  };
}

const UserDetails = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching user details for ID: ${userId}`);
      
      // Try first endpoint format
      try {
        console.log('Trying endpoint: /admin/users/${userId}/analytics');
        const response = await api.get(`/admin/users/${userId}/analytics`);
        console.log('User details API response:', response.data);
        setUserDetails(response.data);
        setError('');
        return; // Successfully fetched data, exit the function
      } catch (error) {
        console.warn('First endpoint attempt failed, trying alternative...');
        // Continue to try alternative endpoint
      }
      
      // Try alternative endpoint format
      try {
        console.log('Trying alternative endpoint: /admin/users/${userId}');
        const response = await api.get(`/admin/users/${userId}`);
        console.log('Alternative API response:', response.data);
        
        // If the response format is different, adapt it to the expected format
        if (response.data) {
          // Check if response is already in the expected format
          if (response.data.user && response.data.stats) {
            setUserDetails(response.data);
          } else {
            // Adapt to expected format
            const userData = response.data;
            setUserDetails({
              user: {
                name: userData.name || 'Unknown',
                email: userData.email || 'unknown@example.com',
                role: userData.role || 'consumer',
                isActive: userData.isActive === undefined ? true : userData.isActive,
                createdAt: userData.createdAt || new Date().toISOString(),
                phone: userData.phone || 'N/A'
              },
              stats: {
                totalOrders: userData.totalOrders || 0,
                totalProducts: userData.totalProducts || 0,
                totalRatings: userData.totalRatings || 0
              }
            });
          }
          setError('');
          return; // Successfully adapted data, exit the function
        }
      } catch (error) {
        console.error('Both API endpoint attempts failed');
        throw new Error('Failed to fetch user details from both endpoints');
      }
    } catch (error: any) {
      console.error('Error in main fetchUserDetails function:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch user details');
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch user details',
        variant: 'destructive'
      });
      
      // Set mock data for better user experience
      setMockUserData();
    } finally {
      setLoading(false);
    }
  };

  const setMockUserData = () => {
    console.log('Setting mock user data as fallback');
    setUserDetails({
      user: {
        name: 'Sample User',
        email: 'user@example.com',
        role: 'consumer',
        isActive: true,
        createdAt: new Date().toISOString(),
        phone: '9876543210'
      },
      stats: {
        totalOrders: 5,
        totalProducts: 0,
        totalRatings: 3
      }
    });
  };

  const handleToggleUserStatus = async () => {
    try {
      console.log(`Toggling user status for ID: ${userId}`);
      await api.put(`/admin/users/${userId}/toggle`);
      toast({
        title: 'Success',
        description: 'User status updated successfully',
      });
      fetchUserDetails(); // Refresh user details
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  // Try direct API call using fetch for debugging
  const tryDirectApiCall = async () => {
    try {
      // Get token and base URL
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      console.log(`Making direct API call to ${baseUrl}/admin/users/${userId}/analytics`);
      
      const response = await fetch(`${baseUrl}/admin/users/${userId}/analytics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Direct API Response Status:', response.status);
      const data = await response.json();
      console.log('Direct API Response Data:', data);
      
      if (response.ok) {
        setUserDetails(data);
        toast({
          title: 'Success',
          description: 'Fetched user details directly',
        });
      } else {
        toast({
          title: 'Direct API Error',
          description: data.message || 'Failed to fetch user details',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Direct API call error:', error);
    }
  };

  // Render debug button in footer of main content
  const renderDebugButton = () => (
    <div className="mt-8 pt-4 border-t border-gray-200">
      <Button variant="outline" size="sm" onClick={tryDirectApiCall}>
        Debug API
      </Button>
      <p className="text-xs text-gray-500 mt-1">
        User ID: {userId}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <div className="bg-red-50 p-4 rounded-md flex items-start text-red-600">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <p>{error}</p>
          </div>
          <div className="flex mt-4 space-x-2">
            <Button variant="outline" asChild>
              <Link to="/admin/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
            <Button variant="outline" onClick={tryDirectApiCall}>
              Try Direct API Call
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <p>No user details found</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <Button variant="outline" className="mb-4" asChild>
            <Link to="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">User Details</h1>
            <Button
              variant={userDetails.user.isActive ? "destructive" : "default"}
              onClick={handleToggleUserStatus}
            >
              {userDetails.user.isActive ? 'Deactivate Account' : 'Activate Account'}
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            {userDetails.user.role === 'farmer' && <TabsTrigger value="farmer">Farmer Data</TabsTrigger>}
            {userDetails.user.role === 'vendor' && <TabsTrigger value="vendor">Vendor Data</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-200 rounded-full p-4">
                        <User className="h-10 w-10 text-gray-600" />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Name</p>
                      <p>{userDetails.user.name}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Email</p>
                      <p>{userDetails.user.email}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Phone</p>
                      <p>{userDetails.user.phone}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Role</p>
                      <p className="capitalize">{userDetails.user.role}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Status</p>
                      <p className="flex items-center">
                        {userDetails.user.isActive ? (
                          <>
                            <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                            <span className="text-green-600">Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-4 w-4 text-red-600" />
                            <span className="text-red-600">Inactive</span>
                          </>
                        )}
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Joined</p>
                      <p>{new Date(userDetails.user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Total Orders</p>
                      <div className="flex items-center">
                        <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p className="text-xl font-bold">{userDetails.stats.totalOrders}</p>
                      </div>
                    </div>
                    
                    {(userDetails.user.role === 'farmer' || userDetails.user.role === 'vendor') && (
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">Total Products</p>
                        <div className="flex items-center">
                          <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                          <p className="text-xl font-bold">{userDetails.stats.totalProducts}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">Total Ratings</p>
                      <div className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4 text-muted-foreground" />
                        <p className="text-xl font-bold">{userDetails.stats.totalRatings}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to={`/admin/orders?userId=${userId}`}>
                        <Package className="mr-2 h-4 w-4" />
                        View Orders
                      </Link>
                    </Button>
                    
                    {(userDetails.user.role === 'farmer' || userDetails.user.role === 'vendor') && (
                      <Button variant="outline" className="w-full justify-start" asChild>
                        <Link to={`/admin/products?userId=${userId}`}>
                          <Package className="mr-2 h-4 w-4" />
                          View Products
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  User activity history will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {userDetails.user.role === 'farmer' && (
            <TabsContent value="farmer">
              <Card>
                <CardHeader>
                  <CardTitle>Farmer Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Farmer performance data will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {userDetails.user.role === 'vendor' && (
            <TabsContent value="vendor">
              <Card>
                <CardHeader>
                  <CardTitle>Vendor Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Vendor performance data will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        
        {/* Add debug button at bottom */}
        {renderDebugButton()}
      </div>
    </div>
  );
};

export default UserDetails; 