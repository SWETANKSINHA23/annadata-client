import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MapPin, Store, ShoppingBag } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface NearbyVendorNotificationProps {
  vendor: {
    _id: string;
    name: string;
    businessName?: string;
    businessType?: string;
    distance?: number;
  };
  onClose: () => void;
}

const NearbyVendorNotification = ({ vendor, onClose }: NearbyVendorNotificationProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    // Play notification sound when component mounts
    playNotificationSound();
    
    // Auto-close notification after 15 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow animation to complete
    }, 15000);
    
    // Add attention-grabbing pulse effect
    const pulseInterval = setInterval(() => {
      setIsHighlighted(prev => !prev);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(pulseInterval);
    };
  }, [onClose]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/vendor-notification.mp3');
      // Fallback to a more common notification sound if the custom one doesn't exist
      audio.onerror = () => {
        const fallbackAudio = new Audio('/notification.mp3');
        fallbackAudio.play().catch(err => console.error('Error playing fallback sound:', err));
      };
      audio.play().catch(err => console.error('Error playing notification sound:', err));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const handleViewVendor = () => {
    navigate(`/consumer/nearby-vendors?vendorId=${vendor._id}`);
    onClose();
  };

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${isHighlighted ? 'scale-105' : 'scale-100'}`}
    >
      <Card className={`w-80 shadow-lg ${isHighlighted ? 'border-2 border-[#138808]' : 'border-2 border-[#138808]/20'}`}>
        <CardHeader className="pb-2 bg-gradient-to-r from-[#138808]/10 to-[#138808]/5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Store className="h-5 w-5 mr-2 text-[#138808]" />
              <span>Nearby Vendor!</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-base">{vendor.businessName || vendor.name}</h3>
              {vendor.businessType && (
                <div className="text-sm text-muted-foreground mb-1">
                  <ShoppingBag className="h-3.5 w-3.5 inline mr-1" />
                  <span>{vendor.businessType}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>
                  {vendor.distance 
                    ? vendor.distance < 1000 
                      ? `${vendor.distance} meters away` 
                      : `${(vendor.distance / 1000).toFixed(2)} km away` 
                    : 'Nearby'}
                </span>
              </div>
              <p className="text-sm mt-2 text-[#138808]">Fresh products available nearby!</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                className="bg-[#138808] hover:bg-[#138808]/90"
                onClick={handleViewVendor}
              >
                View Vendor
              </Button>
              <Button 
                variant="outline" 
                className="border-[#138808] text-[#138808] hover:bg-[#138808]/10"
                onClick={onClose}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NearbyVendorNotification; 