import { mockFarmers } from '@/mock/farmers';

export interface Farmer {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  location: string;
  joinDate: string;
  averageRating: number;
  productCount: number;
  bio?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  farmerId: string;
  images: string[];
  category: string;
}

export interface FarmerWithProducts extends Farmer {
  products: Product[];
}

// Mock implementation of the FarmerService using local data
export class FarmerService {
  async getAllFarmers(): Promise<Farmer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...mockFarmers];
  }

  async getFarmerById(id: string): Promise<Farmer> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    const farmer = mockFarmers.find(f => f._id === id);
    
    if (!farmer) {
      throw new Error(`Farmer with id ${id} not found`);
    }
    
    return { ...farmer };
  }

  async searchFarmers(query: string): Promise<Farmer[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const searchTerm = query.toLowerCase();
    return mockFarmers.filter(farmer => 
      farmer.name.toLowerCase().includes(searchTerm) ||
      farmer.location.toLowerCase().includes(searchTerm) ||
      (farmer.bio && farmer.bio.toLowerCase().includes(searchTerm))
    );
  }

  async getFarmerProducts(farmerId: string): Promise<Product[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock implementation - in a real app this would fetch products from the API
    return [];
  }
}

// Standalone functions for simpler use cases
export const getFarmers = async (): Promise<Farmer[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...mockFarmers];
};

export const getFarmerById = async (id: string): Promise<Farmer | null> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const farmer = mockFarmers.find(f => f._id === id);
  return farmer ? { ...farmer } : null;
};

export const getFarmersByLocation = async (location: string): Promise<Farmer[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const locationLower = location.toLowerCase();
  return mockFarmers.filter(farmer => 
    farmer.location.toLowerCase().includes(locationLower)
  );
};

export default {
  getFarmers,
  getFarmerById,
  getFarmersByLocation,
}; 