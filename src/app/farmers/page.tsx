import React from 'react';
import { getFarmers } from '@/services/farmer.service';
import { Container } from '@/components/ui/container';
import FarmerList from '@/components/farmers/FarmerList';

export const metadata = {
  title: 'Browse Farmers | Annadata',
  description: 'Discover local farmers and their fresh produce',
}

export default async function FarmersPage() {
  const farmers = await getFarmers();
  
  return (
    <Container>
      <div className="py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Farmers</h1>
          <p className="text-gray-500 mt-2">
            Discover local farmers and their fresh produce
          </p>
        </div>
        
        <FarmerList farmers={farmers} />
      </div>
    </Container>
  );
} 