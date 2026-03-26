import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Farmer, FarmerService } from '@/services/farmer.service';

const FarmerDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [farmer, setFarmer] = useState<Farmer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const farmerService = new FarmerService();

  useEffect(() => {
    const fetchFarmerDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const farmerData = await farmerService.getFarmerById(id as string);
        setFarmer(farmerData);
      } catch (error) {
        console.error('Error fetching farmer details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmerDetails();
  }, [id]);

  if (isLoading) {
    return (
      <Container>
        <div className="py-12 flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent"></div>
        </div>
      </Container>
    );
  }

  if (!farmer) {
    return (
      <Container>
        <div className="py-12 text-center">
          <h2 className="text-2xl font-bold">Farmer not found</h2>
          <p className="mt-2 text-gray-500">The farmer you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.push('/farmers')} className="mt-6">
            Back to Farmers
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/farmers')}
          className="mb-6"
        >
          &larr; Back to Farmers
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Farmer Info Card */}
          <Card className="md:col-span-1">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 mb-4">
                  {farmer.profileImage ? (
                    <AvatarImage src={farmer.profileImage} alt={farmer.name} />
                  ) : (
                    <AvatarFallback className="bg-green-100 text-green-800 text-4xl">
                      {farmer.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <h1 className="text-2xl font-bold text-center">{farmer.name}</h1>
                
                <div className="flex items-center mt-2">
                  <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                  <span>{farmer.averageRating.toFixed(1)} Rating</span>
                </div>
                
                <div className="w-full mt-6 space-y-4">
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <span>{farmer.location}</span>
                  </div>
                  
                  {farmer.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3" />
                      <a href={`mailto:${farmer.email}`} className="text-blue-600 hover:underline">
                        {farmer.email}
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <span>Joined {new Date(farmer.joinDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="products" className="flex-1">Products ({farmer.productCount})</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">About {farmer.name}</h2>
                    <p className="text-gray-700">
                      {farmer.bio || 'No information provided by the farmer.'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="products" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Products</h2>
                    <div className="text-center py-12 text-gray-500">
                      Products will be loaded here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
                    <div className="text-center py-12 text-gray-500">
                      Reviews will be loaded here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FarmerDetailPage; 