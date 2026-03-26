export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
  farmerId: string;
  images: Array<{
    url: string;
    public_id: string;
  }>;
  ratings?: number[];
  averageRating?: number;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  isBulkOnly?: boolean;
  minQuantity?: number; // Minimum quantity that can be ordered (for bulk)
} 