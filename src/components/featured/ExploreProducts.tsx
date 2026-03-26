import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useConsumerCart } from "@/hooks/use-consumer-cart";
import { Store, MapPin, Star, ShoppingCart, Package } from "lucide-react";
import type { Product } from "@/types/product";

interface ExploreProductsProps {
  products: ProductWithVendor[];
  onAddToCart?: (product: ProductWithVendor) => void;
}

export interface ProductWithVendor {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  images: Array<{ url: string; public_id: string }>;
  averageRating: number;
  totalRatings: number;
  seller: string;
  sellerName?: string;
  distance?: number;
}

const ExploreProducts = ({ products, onAddToCart }: ExploreProductsProps) => {
  const { addToCart } = useConsumerCart();

  const handleAddToCart = (product: ProductWithVendor) => {
    try {
      addToCart(product as unknown as Product, 1);

      if (onAddToCart) {
        onAddToCart(product);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-4">Explore Products from Nearby Vendors</h3>
      {products.length === 0 ? (
        <div className="text-center py-10">
          <Package className="h-12 w-12 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No products found</h3>
          <p className="mt-1 text-sm text-gray-500">No nearby vendors with products available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <Card key={product._id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={product.images[0]?.url || '/placeholder.png'}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.averageRating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="font-semibold">₹{product.price}</div>
                  </div>
                  
                  {product.sellerName && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Store className="h-3 w-3" />
                      <span>{product.sellerName}</span>
                    </div>
                  )}
                  
                  {product.distance !== undefined && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{(product.distance / 1000).toFixed(2)} km away</span>
                    </div>
                  )}
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreProducts; 