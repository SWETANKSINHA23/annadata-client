export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'farmer' | 'vendor' | 'consumer';
  phone?: string;
  profileImage?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
} 