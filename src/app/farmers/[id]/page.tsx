import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Container } from '@/components/ui/container';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeftIcon, StarIcon, MapPinIcon, EnvelopeIcon, CalendarIcon } from '@/components/icons';
import { getFarmerById } from '@/services/farmer.service';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const farmer = await getFarmerById(params.id);
  
  if (!farmer) {
    return {
      title: 'Farmer Not Found | Annadata',
    };
  }
  
  return {
    title: `${farmer.name} | Annadata Farmer`,
    description: farmer.bio || `View ${farmer.name}'s profile and products on Annadata`,
  };
}

export default async function FarmerDetailPage({ params }: { params: { id: string } }) {
  const farmer = await getFarmerById(params.id);
  
  if (!farmer) {
    notFound();
  }
  
  return (
    <Container>
      <div className="py-8">
        <Link href="/farmers" className="inline-flex items-center text-sm font-medium mb-6 hover:underline">
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Back to Farmers
        </Link>

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
            <Tabs defaultValue="overview">
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
} 