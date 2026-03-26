import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Leaf, Package, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/axios";
import { Product } from "@/types/product";
import { productService } from "@/services/product.service";
import { Switch } from "@/components/ui/switch";

interface BulkProductFormData {
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  unit: string;
  minQuantity: number;
  isActive: boolean;
  isBulkOnly: boolean;
}

const CATEGORIES = ['vegetables', 'fruits', 'crops', 'dairy', 'groceries', 'snacks', 'beverages', 'other'];
const UNITS = ['kg', 'gram', 'piece', 'dozen', 'liter', 'packet', 'box', 'carton'];

const FarmerBulkProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formData, setFormData] = useState<BulkProductFormData>({
    name: "",
    description: "",
    category: "",
    price: 0,
    stock: 0,
    unit: "",
    minQuantity: 10,
    isActive: true,
    isBulkOnly: true
  });
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/products/farmer/bulk');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching bulk products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bulk products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' || name === 'minQuantity' ? Number(value) : value
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        stock: formData.stock,
        unit: formData.unit,
        minQuantity: formData.minQuantity,
        isActive: formData.isActive,
        isBulkOnly: formData.isBulkOnly,
        sellerType: 'farmer'
      };
      
      if (editMode && editProductId) {
        await api.put(`/products/farmer/bulk/${editProductId}`, productData);
        toast({
          title: "Success",
          description: "Bulk product updated successfully",
        });
      } else {
        await api.post('/products/farmer/bulk', productData);
        toast({
          title: "Success",
          description: "Bulk product added successfully",
        });
      }
      
      // Reset form and refresh products
      resetForm();
      fetchProducts();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving bulk product:', error);
      toast({
        title: "Error",
        description: "Failed to save bulk product",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      minQuantity: product.minQuantity || 10,
      isActive: product.isActive,
      isBulkOnly: product.isBulkOnly || true
    });
    setEditMode(true);
    setEditProductId(product._id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this bulk product?")) {
      try {
        await api.delete(`/products/farmer/bulk/${id}`);
        toast({
          title: "Success",
          description: "Bulk product deleted successfully",
        });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting bulk product:', error);
        toast({
          title: "Error",
          description: "Failed to delete bulk product",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      price: 0,
      stock: 0,
      unit: "",
      minQuantity: 10,
      isActive: true,
      isBulkOnly: true
    });
    setEditMode(false);
    setEditProductId(null);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  const getFilteredProducts = () => {
    let filtered = [...products];
    
    if (filterCategory !== "all") {
      filtered = filtered.filter(product => product.category === filterCategory);
    }
    
    return filtered.sort((a, b) => {
      if (sortField === "price") {
        return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
      } else if (sortField === "stock") {
        return sortOrder === "asc" ? a.stock - b.stock : b.stock - a.stock;
      } else if (sortField === "name") {
        return sortOrder === "asc" 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        // Sort by createdAt
        return sortOrder === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bulk Products</h2>
          <p className="text-muted-foreground">Manage your bulk products for vendor purchases</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select 
            value={filterCategory} 
            onValueChange={setFilterCategory}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={viewMode} 
            onValueChange={(value: "grid" | "list") => setViewMode(value)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddNew}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bulk Product
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getFilteredProducts().map(product => (
                <Card key={product._id}>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={product.isActive ? "default" : "secondary"}
                        className={product.isActive ? "bg-green-500" : "bg-gray-400"}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="mt-2">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          className="w-full h-32 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">{formatPrice(product.price)}/{product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stock:</span>
                        <span className="font-medium">{product.stock} {product.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min. Quantity:</span>
                        <span className="font-medium">{product.minQuantity || 10} {product.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(product)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(product._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => {
                            setSortField("price");
                            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                          }}
                        >
                          Price
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div 
                          className="flex items-center cursor-pointer"
                          onClick={() => {
                            setSortField("stock");
                            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                          }}
                        >
                          Stock
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead>Min. Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredProducts().map(product => (
                      <TableRow key={product._id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                        </TableCell>
                        <TableCell>{formatPrice(product.price)}/{product.unit}</TableCell>
                        <TableCell>{product.stock} {product.unit}</TableCell>
                        <TableCell>{product.minQuantity || 10} {product.unit}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={product.isActive ? "default" : "secondary"}
                            className={product.isActive ? "bg-green-500" : "bg-gray-400"}
                          >
                            {product.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(product._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Bulk Product" : "Add Bulk Product"}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Update your bulk product details below" 
                : "Add a new bulk product for vendors to purchase"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleInputChange({
                      target: { name: 'category', value }
                    } as React.ChangeEvent<HTMLSelectElement>)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={formData.unit} 
                    onValueChange={(value) => handleInputChange({
                      target: { name: 'unit', value }
                    } as React.ChangeEvent<HTMLSelectElement>)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) per {formData.unit}</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Available Stock ({formData.unit})</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minQuantity">Minimum Order Quantity ({formData.unit})</Label>
                <Input
                  id="minQuantity"
                  name="minQuantity"
                  type="number"
                  min="1"
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleSwitchChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Product is active and visible to vendors</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="isBulkOnly"
                  checked={formData.isBulkOnly}
                  onCheckedChange={(checked) => handleSwitchChange('isBulkOnly', checked)}
                />
                <Label htmlFor="isBulkOnly">Available for bulk orders only</Label>
              </div>
            </div>
            
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    {editMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>{editMode ? "Update" : "Add"} Product</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerBulkProducts; 