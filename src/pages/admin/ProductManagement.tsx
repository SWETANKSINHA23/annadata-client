import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import AdminNav from '@/components/navigation/AdminNav';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Package, Eye, ThumbsUp } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  sellerType: string;
  seller: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sellerTypeFilter, setSellerTypeFilter] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter && categoryFilter !== 'all') params.category = categoryFilter;
      if (sellerTypeFilter && sellerTypeFilter !== 'all') params.sellerType = sellerTypeFilter;
      
      console.log('Fetching products with params:', params);
      const response = await api.get('/admin/products', { params });
      console.log('Products API response:', response.data);
      setProducts(response.data);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch products',
        variant: 'destructive'
      });
      // Set empty products array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductStatus = async (productId: string) => {
    try {
      console.log(`Toggling product status for ID: ${productId}`);
      await api.put(`/admin/products/${productId}/toggle`);
      toast({
        title: 'Success',
        description: 'Product status updated successfully',
      });
      fetchProducts(); // Refresh the product list
    } catch (error: any) {
      console.error('Error toggling product status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update product status',
        variant: 'destructive'
      });
    }
  };

  const handleSearch = () => {
    fetchProducts();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 border-r bg-white p-4">
        <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
        <AdminNav />
      </div>
      
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="crops">Crops</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="groceries">Groceries</SelectItem>
                    <SelectItem value="snacks">Snacks</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full md:w-48">
                <Select value={sellerTypeFilter} onValueChange={setSellerTypeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seller Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="farmer">Farmer</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleSearch}>
                <Filter className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <p>Loading products...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="capitalize">{product.category}</TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="flex flex-col">
                      <span>{product.seller.name}</span>
                      <Badge variant="outline" className="w-fit capitalize mt-1">
                        {product.sellerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{product.averageRating.toFixed(1)} ({product.totalRatings})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleProductStatus(product._id)}
                        >
                          {product.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/products/${product._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default ProductManagement; 