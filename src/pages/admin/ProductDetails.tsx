import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';
import AdminNav from '@/components/navigation/AdminNav';
import { ArrowLeft, Package, Star, User, AlertCircle, Tag, TrendingUp } from 'lucide-react';

interface ProductDetails {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  images: Array<{ url: string }>;
  seller: {
    _id: string;
    name: string;
    email: string;
  };
  sellerType: string;
  averageRating: number;
  totalRatings: number;
  isActive: boolean;
  createdAt: string;
  marginPercentage?: number;
  basePrice?: number;
}

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      console.log(`Fetching product details for ID: ${productId}`);
      const response = await api.get(`/admin/products/${productId}`);
      console.log('Product API response:', response.data);
      setProduct(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching product details:', error);
      setError(error.response?.data?.message || 'Failed to fetch product details');
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch product details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProductStatus = async () => {
    try {
      await api.put(`/admin/products/${productId}/toggle`);
      toast({
        title: 'Success',
        description: 'Product status updated successfully',
      });
      fetchProductDetails(); // Refresh product details
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update product status',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <p>Loading product details...</p>
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
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="w-64 border-r bg-white p-4">
          <h2 className="text-xl font-bold mb-6">Admin Portal</h2>
          <AdminNav />
        </div>
        <div className="flex-1 p-6">
          <p>No product details found</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
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
            <Link to="/admin/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <Button
              variant={product.isActive ? "destructive" : "default"}
              onClick={handleToggleProductStatus}
            >
              {product.isActive ? 'Deactivate Product' : 'Activate Product'}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0].url} 
                        alt={product.name} 
                        className="w-full h-64 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Description</p>
                      <p className="mt-1">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Badge variant="outline" className="capitalize">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2 text-amber-500" />
                      <span>{product.averageRating.toFixed(1)} ({product.totalRatings} ratings)</span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pricing Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">Current Price</p>
                    <p className="text-xl font-bold">₹{product.price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">per {product.unit}</p>
                  </div>
                  
                  {product.sellerType === 'vendor' && product.basePrice && (
                    <>
                      <div>
                        <p className="text-sm font-medium">Base Price</p>
                        <p className="text-xl font-bold">₹{product.basePrice.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">per {product.unit}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium">Margin</p>
                        <p className="text-xl font-bold">{product.marginPercentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{(product.price - product.basePrice).toFixed(2)} profit per {product.unit}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Current Stock</p>
                    <p className="text-xl font-bold">{product.stock} {product.unit}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Stock Status</p>
                    <Badge variant={product.stock > 0 ? "success" : "destructive"}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="bg-gray-200 rounded-full p-4">
                      <User className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Name</p>
                    <p>{product.seller.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p>{product.seller.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Seller Type</p>
                    <Badge variant="outline" className="capitalize">
                      {product.sellerType}
                    </Badge>
                  </div>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/admin/users/${product.seller._id}`}>
                      View Seller Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 