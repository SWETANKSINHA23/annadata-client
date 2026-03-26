import React from 'react';
import { Farmer } from '@/services/farmer.service';
import FarmerCard from './FarmerCard';

interface FarmerListProps {
  farmers: Farmer[];
  isLoading?: boolean;
}

export const FarmerList: React.FC<FarmerListProps> = ({ farmers, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array(8).fill(0).map((_, index) => (
          <div 
            key={index} 
            className="h-64 rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (farmers.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No farmers found</h3>
        <p className="text-gray-500 mt-2">Try changing your search criteria or check back later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {farmers.map((farmer) => (
        <FarmerCard key={farmer._id} farmer={farmer} />
      ))}
    </div>
  );
};

export default FarmerList; 