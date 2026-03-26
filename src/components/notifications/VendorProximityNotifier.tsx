import { useState, useEffect } from 'react';
import { socketService } from '@/services/socket.service';
import NearbyVendorNotification from '@/components/vendor/NearbyVendorNotification';
import { useAuth } from '@/hooks/use-auth';

interface NearbyVendor {
  vendorId: string;
  vendorName: string;
  distance: number;
  businessType?: string;
  coordinates: [number, number];
}

/**
 * Component to handle real-time vendor proximity notifications
 * This component has no UI of its own but renders NearbyVendorNotification
 * when a vendor is detected nearby
 */
const VendorProximityNotifier = () => {
  const [nearbyVendor, setNearbyVendor] = useState<NearbyVendor | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const { isAuthenticated, isConsumer } = useAuth();

  useEffect(() => {
    // Only set up for authenticated consumers
    if (!isAuthenticated || !isConsumer) {
      console.log('VendorProximityNotifier: User is not an authenticated consumer');
      return;
    }
    
    console.log('VendorProximityNotifier: Setting up vendor nearby alert listener');
    
    // Register for vendor nearby alerts
    const cleanup = socketService.onVendorNearbyAlert((data) => {
      console.log('VendorProximityNotifier: Received vendor nearby alert:', data);
      
      // Create vendor object from alert data
      const vendor: NearbyVendor = {
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        distance: data.distance,
        businessType: data.businessType,
        coordinates: data.coordinates
      };
      
      // Set vendor data and show notification
      setNearbyVendor(vendor);
      setShowNotification(true);
    });
    
    // Clean up when component unmounts
    return () => {
      console.log('VendorProximityNotifier: Cleaning up vendor nearby alert listener');
      cleanup();
    };
  }, [isAuthenticated, isConsumer]);
  
  const handleCloseNotification = () => {
    setShowNotification(false);
  };
  
  // If no notification to show, render nothing
  if (!showNotification || !nearbyVendor) {
    return null;
  }
  
  // Render notification with vendor data
  return (
    <NearbyVendorNotification 
      vendor={{
        _id: nearbyVendor.vendorId,
        name: nearbyVendor.vendorName,
        distance: nearbyVendor.distance
      }}
      onClose={handleCloseNotification}
    />
  );
};

export default VendorProximityNotifier; 