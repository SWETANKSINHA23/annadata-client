import { Vendor } from '@/types/vendor';
import { formatDistance } from '@/utils/format';
import { Store, MapPin, Star, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface VendorCardProps {
  vendor: Vendor;
  onClick?: () => void;
}

const VendorCard = ({ vendor, onClick }: VendorCardProps) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <div className="relative h-32 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="absolute -bottom-8 left-4 h-16 w-16 rounded-full bg-white shadow-md flex items-center justify-center border-2 border-white">
          <Store className="h-8 w-8 text-[#138808]" />
        </div>
        {vendor.isOnline && (
          <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
            Online
          </Badge>
        )}
      </div>
      
      <div className="pt-10 p-4">
        <h3 className="text-lg font-semibold">{vendor.businessName}</h3>
        <p className="text-gray-600 text-sm">{vendor.businessType}</p>
        
        <div className="mt-3 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
            <span className="truncate">{vendor.businessLocation?.address}</span>
          </div>
          
          {vendor.distance !== undefined && (
            <p className="flex items-center text-sm text-[#138808]">
              <Badge variant="outline" className="font-normal border-[#138808]/20 text-[#138808]">
                {formatDistance(vendor.distance)}
              </Badge>
            </p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-amber-400 mr-1" />
            <span className="font-medium">{vendor.averageRating?.toFixed(1) || 'N/A'}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Package className="h-4 w-4 mr-1 text-gray-500" />
            <span>{vendor.products?.length || 0} products</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCard; 