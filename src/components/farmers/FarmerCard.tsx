import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Farmer } from '@/services/farmer.service';

interface FarmerCardProps {
  farmer: Farmer;
}

export const FarmerCard: React.FC<FarmerCardProps> = ({ farmer }) => {
  const { _id, name, profileImage, location, averageRating, productCount } = farmer;

  return (
    <Link href={`/farmers/${_id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-green-300">
        <CardContent className="p-4">
          <div className="flex flex-col items-center space-y-3">
            <Avatar className="h-24 w-24">
              {profileImage ? (
                <AvatarImage src={profileImage} alt={name} />
              ) : (
                <AvatarFallback className="bg-green-100 text-green-800 text-xl">
                  {name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-lg">{name}</h3>
              <div className="flex items-center justify-center text-sm text-gray-500 mt-1">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{location}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-3 flex items-center justify-between">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm">{averageRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center">
            <ShoppingBagIcon className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-sm">{productCount} products</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default FarmerCard; 