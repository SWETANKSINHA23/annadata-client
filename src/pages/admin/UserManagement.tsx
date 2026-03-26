import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import AdminNav from '@/components/navigation/AdminNav';
import { CheckCircle, XCircle, Search, RefreshCw, UserPlus } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  phone?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const { toast } = useToast();

  // Log the auth token for debugging
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Auth token available:', !!token);
    if (token) {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token payload:', payload);
          console.log('Token expiry:', new Date(payload.exp * 1000).toLocaleString());
          console.log('Current time:', new Date().toLocaleString());
          console.log('Is token expired:', payload.exp * 1000 < Date.now());
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    }
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page };
      if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;

      console.log('Fetching users with params:', params);
      
      // Try the first endpoint format
      try {
        console.log('Trying endpoint: /admin/users');
        const response = await api.get('/admin/users', { params });
        console.log('Users API response:', response.data);
        
        // Check if the response has a data.users property (paginated response)
        if (response.data && response.data.users) {
          setUsers(response.data.users);
          setTotalPages(response.data.totalPages || 1);
          setTotalUsers(response.data.totalCount || response.data.users.length);
          setLoading(false);
          return; // Successfully got data, exit the function
        } else if (Array.isArray(response.data)) {
          // If response.data is an array, it's likely a direct list of users
          setUsers(response.data);
          setTotalPages(1);
          setTotalUsers(response.data.length);
          setLoading(false);
          return; // Successfully got data, exit the function
        } else {
          console.warn('Unexpected API response format from first endpoint, trying alternative...');
          // Continue to try alternative endpoint
        }
      } catch (error) {
        console.warn('First endpoint attempt failed, trying alternative endpoint...');
        // Continue to try alternative endpoint
      }
      
      // Try alternative endpoint format
      try {
        console.log('Trying alternative endpoint: /users');
        const response = await api.get('/users', { params });
        console.log('Alternative API response:', response.data);
        
        if (response.data && response.data.users) {
          setUsers(response.data.users);
          setTotalPages(response.data.totalPages || 1);
          setTotalUsers(response.data.totalCount || response.data.users.length);
        } else if (Array.isArray(response.data)) {
          setUsers(response.data);
          setTotalPages(1);
          setTotalUsers(response.data.length);
        } else {
          // Fall back to mock data
          toast({
            title: 'Error',
            description: 'Failed to fetch users from both endpoints',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Both API endpoint attempts failed');
        console.error('Error details:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch users from both endpoints',
          variant: 'destructive'
        });
        // Set mock data on error for better user experience
        // setMockData();
      }
    } catch (error: any) {
      console.error('Error in main fetchUsers function:', error);
      console.error('API error details:', error.response?.data);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch users',
        variant: 'destructive'
      });
      // Set mock data on error for better user experience
      // setMockData();
    } finally {
      setLoading(false);
    }
  };

  // Function to set mock data when API fails
  const setMockData = () => {
    console.log('Setting mock user data as fallback');
    const mockUsers = [
      {
        _id: '1',
        name: 'John Farmer',
        email: 'john@example.com',
        role: 'farmer',
        isActive: true,
        createdAt: new Date().toISOString(),
        phone: '9876543210'
      },
      {
        _id: '2',
        name: 'Jane Vendor',
        email: 'jane@example.com',
        role: 'vendor',
        isActive: true,
        createdAt: new Date().toISOString(),
        phone: '9876543211'
      },
      {
        _id: '3',
        name: 'Bob Consumer',
        email: 'bob@example.com',
        role: 'consumer',
        isActive: false,
        createdAt: new Date().toISOString(),
        phone: '9876543212'
      },
      {
        _id: '4',
        name: 'Alice Admin',
        email: 'alice@example.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        phone: '9876543213'
      }
    ];
    
    setUsers(mockUsers);
    setTotalPages(1);
    setTotalUsers(mockUsers.length);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]); // Fetch when page or role filter changes

  const handleSearch = () => {
    setPage(1); // Reset to first page when searching
    fetchUsers();
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1); // Reset to first page when filtering
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      console.log(`Toggling user status for ID: ${userId}, current status: ${currentStatus}`);
      await api.put(`/admin/users/${userId}/toggle`);
      
      // Update local state to reflect the change
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
      
      toast({
        title: 'Success',
        description: `User ${currentStatus ? 'deactivated' : 'activated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update user status',
        variant: 'destructive'
      });
    }
  };

  // Direct API test function
  const testDirectApiCall = async () => {
    try {
      console.log('Testing direct API call to /admin/users');
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token available');
        toast({
          title: 'Error',
          description: 'No auth token available. Please login again.',
          variant: 'destructive'
        });
        return;
      }
      
      // Get the base URL from the environment variables or use default
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = `${baseUrl}/admin/users?page=1`;
      
      console.log('Fetch URL:', url);
      const response = await fetch(url, {
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
        toast({
          title: 'Success',
          description: 'Direct API call successful. Check console for details.',
        });
        
        // Try to update users from the response
        if (data.users) {
          setUsers(data.users);
          setTotalPages(data.totalPages || 1);
          setTotalUsers(data.totalCount || data.users.length);
        } else if (Array.isArray(data)) {
          setUsers(data);
          setTotalPages(1);
          setTotalUsers(data.length);
        }
      } else {
        toast({
          title: 'API Error',
          description: data.message || `Error: ${response.status}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Direct API call error:', error);
      toast({
        title: 'Error',
        description: 'Failed to make direct API call. Check console for details.',
        variant: 'destructive'
      });
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
          <h1 className="text-2xl font-bold">User Management</h1>
          <div className="flex space-x-2">
            <Button onClick={testDirectApiCall} variant="outline">
              Test API
            </Button>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>User Search & Filters</CardTitle>
            <CardDescription>Find users by name, email, or role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All roles</SelectItem>
                    <SelectItem value="farmer">Farmers</SelectItem>
                    <SelectItem value="vendor">Vendors</SelectItem>
                    <SelectItem value="consumer">Consumers</SelectItem>
                    <SelectItem value="admin">Admins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
              <Button variant="outline" onClick={fetchUsers}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading users...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <p className="text-gray-500">No users found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="capitalize">{user.role}</TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="mr-1 h-4 w-4" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600">
                            <XCircle className="mr-1 h-4 w-4" /> Inactive
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant={user.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/users/${user._id}`}>View</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500">
                  Showing page {page} of {totalPages} ({totalUsers} total users)
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserManagement; 