import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Leaf, Bug, Mountain, Beaker, Calendar } from "lucide-react";
import { CropRecommendationDetails as CropDetails } from "@/services/cropDetailsService";
import { getCropRecommendationDetails } from "@/services/cropDetailsService";

interface CropRecommendationDetailsProps {
  cropName: string;
}

const CropRecommendationDetails: React.FC<CropRecommendationDetailsProps> = ({ cropName }) => {
  const [details, setDetails] = useState<CropDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cropName) {
      const cropDetails = getCropRecommendationDetails(cropName);
      setDetails(cropDetails);
    } else {
      setDetails(null);
    }
    setLoading(false);
  }, [cropName]);

  if (loading) {
    return <div className="animate-pulse bg-gray-100 p-4 rounded-lg h-40"></div>;
  }

  if (!details) {
    return (
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center p-6 text-center text-gray-500">
            <Leaf className="w-10 h-10 mb-3 text-gray-400" />
            <p className="text-sm">
              {cropName 
                ? `No detailed recommendations available for ${cropName}.` 
                : "Select a crop to view recommendations."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Leaf className="w-5 h-5 mr-2 text-green-600" />
          <span className="capitalize">{cropName} Growing Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center text-blue-700 mb-1 font-medium">
              <Droplet className="w-4 h-4 mr-2" />
              Water Requirements
            </div>
            <p className="text-sm">{details.water_requirements}</p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center text-green-700 mb-1 font-medium">
              <Leaf className="w-4 h-4 mr-2" />
              Fertilizer
            </div>
            <p className="text-sm">{details.fertilizer}</p>
          </div>

          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center text-red-700 mb-1 font-medium">
              <Bug className="w-4 h-4 mr-2" />
              Pest Control
            </div>
            <p className="text-sm">{details.pest_control}</p>
          </div>

          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="flex items-center text-amber-700 mb-1 font-medium">
              <Mountain className="w-4 h-4 mr-2" />
              Soil Type
            </div>
            <p className="text-sm">{details.soil_type}</p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center text-purple-700 mb-1 font-medium">
              <Beaker className="w-4 h-4 mr-2" />
              pH Range
            </div>
            <p className="text-sm">{details.ph_range}</p>
          </div>

          <div className="bg-indigo-50 p-3 rounded-lg">
            <div className="flex items-center text-indigo-700 mb-1 font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              Harvest Time
            </div>
            <p className="text-sm">{details.harvest_time}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CropRecommendationDetails; 