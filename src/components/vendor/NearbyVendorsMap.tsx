import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import L from 'leaflet';

// Fix Leaflet marker icon issue with absolute URLs
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `${window.location.origin}/marker-icon-2x.png`,
  iconUrl: `${window.location.origin}/marker-icon.png`,
  shadowUrl: `${window.location.origin}/marker-shadow.png`,
});

// Create custom icons with absolute URLs
const vendorIcon = new L.Icon({
  iconUrl: `${window.location.origin}/vendor-marker.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: `${window.location.origin}/user-marker.png`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface Vendor {
  _id: string;
  name: string;
  businessName?: string;
  businessType?: string;
  businessLocation?: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  distance?: number;
  averageRating?: number;
  isOnline?: boolean;
}

interface NearbyVendorsMapProps {
  vendors: Vendor[];
  currentLocation?: { lat: number; lng: number };
  onMarkerClick?: (vendor: Vendor) => void;
}

const NearbyVendorsMap = ({ vendors, currentLocation, onMarkerClick }: NearbyVendorsMapProps) => {
  const defaultLocation: [number, number] = [31.2447532, 75.7022453]; // Default to Phagwara
  const mapCenter: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng]
    : defaultLocation;
  
  const [loading, setLoading] = useState(false);
  
  // Filter vendors to show only those within 500m and online
  const nearbyOnlineVendors = vendors.filter(
    vendor => vendor.isOnline && vendor.distance !== undefined && vendor.distance <= 500
  );

  // Log received vendors for debugging
  useEffect(() => {
    console.log(`NearbyVendorsMap received ${vendors.length} vendors, ${nearbyOnlineVendors.length} nearby and online`);
    nearbyOnlineVendors.forEach((vendor, index) => {
      console.log(`Map vendor ${index + 1}:`, vendor._id, vendor.name, 'distance:', vendor.distance, 'online:', vendor.isOnline);
      if (vendor.businessLocation) {
        console.log(`Map vendor ${index + 1} location:`, 
          vendor.businessLocation.coordinates,
          vendor.businessLocation.type);
      } else {
        console.warn(`Map vendor ${index + 1} has no location data`);
      }
    });
  }, [vendors, nearbyOnlineVendors]);

  // Function to format distance with proper units
  const formatDistance = (meters: number | undefined): string => {
    if (meters === undefined) return 'Distance unknown';
    
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    
    // Convert to kilometers with 2 decimal places for better accuracy
    return `${(meters / 1000).toFixed(2)}km away`;
  };

  // Create map content as a regular component to avoid Context issues
  const MapContent = () => {
    console.log('Rendering MapContent with vendors:', nearbyOnlineVendors.length);
    const validVendors = nearbyOnlineVendors.filter(v => 
      v.businessLocation && 
      Array.isArray(v.businessLocation.coordinates) && 
      v.businessLocation.coordinates.length === 2
    );
    console.log(`Found ${validVendors.length} valid vendors with coordinates`);
    
    return (
      <>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold">Your Location</h3>
                <p className="text-xs text-gray-600">{currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Add a 500m radius circle around user location */}
        {currentLocation && (
          <Circle 
            center={[currentLocation.lat, currentLocation.lng]}
            radius={500}
            pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1, weight: 1 }}
          />
        )}
        
        {/* Vendor markers */}
        {validVendors.map((vendor) => {
          console.log(`Adding marker for vendor ${vendor._id} at position:`, vendor.businessLocation!.coordinates);
          // Ensure coordinates are in the right order [lat, lng] for Leaflet
          const coordinates = vendor.businessLocation!.coordinates;
          const position: [number, number] = [coordinates[1], coordinates[0]]; // Convert from [lng, lat] to [lat, lng]
          
          return (
            <Marker
              key={vendor._id}
              position={position}
              icon={vendorIcon}
              eventHandlers={{
                click: () => {
                  console.log('Vendor marker clicked:', vendor._id);
                  if (onMarkerClick) onMarkerClick(vendor);
                },
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{vendor.businessName || vendor.name}</h3>
                  <p className="text-sm">{vendor.businessType}</p>
                  <div className="flex flex-col gap-1 mt-1">
                    <p className="text-sm text-gray-600">
                      {formatDistance(vendor.distance)}
                    </p>
                    {vendor.isOnline && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        Online
                      </span>
                    )}
                    <p className="text-xs text-gray-500">
                      {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#138808]" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Vendors</CardTitle>
        <CardDescription>
          Online vendors within 500m of your location
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[400px] relative">
          {typeof window !== 'undefined' && (
            <MapContainer
              center={mapCenter}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <MapContent />
            </MapContainer>
          )}
          
          {/* Legend */}
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-md text-xs">
            <div className="flex items-center mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span>Online Vendors</span>
            </div>
          </div>

          {/* No nearby vendors message */}
          {nearbyOnlineVendors.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
              <div className="bg-white p-4 rounded-md shadow-md">
                <p className="text-center font-medium">No online vendors nearby</p>
                <p className="text-center text-sm text-gray-600 mt-1">
                  There are no vendors online within 500m of your location
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NearbyVendorsMap;
