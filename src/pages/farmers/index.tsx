import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Farmer, getFarmers } from '@/services/farmer.service';
import FarmerList from '@/components/farmers/FarmerList';
import { SearchIcon } from '@heroicons/react/24/outline';

const FarmersPage: NextPage = () => {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [filteredFarmers, setFilteredFarmers] = useState<Farmer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      setIsLoading(true);
      try {
        const data = await getFarmers();
        setFarmers(data);
        setFilteredFarmers(data);
      } catch (error) {
        console.error('Error fetching farmers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const handleSearch = () => {
    const filtered = farmers.filter(farmer => 
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFarmers(filtered);
  };

  return (
    <Container>
      <div className="py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Browse Farmers</h1>
          <p className="text-gray-500 mt-2">
            Discover local farmers and their fresh produce
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by farmer name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10"
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>

        <FarmerList farmers={filteredFarmers} isLoading={isLoading} />
      </div>
    </Container>
  );
};

export default FarmersPage; 