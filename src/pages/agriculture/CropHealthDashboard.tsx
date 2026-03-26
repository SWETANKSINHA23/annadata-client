import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  BarChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Droplet, 
  Thermometer, 
  Leaf, 
  Wind, 
  Combine, 
  Calendar, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  LayoutDashboard,
  ArrowLeft,
  Info
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { 
  useLatestSensorData, 
  useCropHealth, 
  useIrrigationRecommendation, 
  useFertilizerPlan, 
  useYieldPrediction
} from "@/services/agricultureApi";
import axios from "axios";
import { api } from "@/lib/axios";
import cropRecommendationApi, { CropPredictionResponse } from "@/services/cropRecommendationApi";
import CropRecommendationChart from "@/components/CropRecommendationChart";
import CropRecommendationDetails from "@/components/CropRecommendationDetails";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ErrorFallback } from '@/components/ErrorFallback';

// Interface for the plant disease prediction response
interface PlantDiseasePrediction {
  predictions: {
    class_name: string;
    confidence: number;
    health_score: number;
    prevention_tip: string;
  }[];
  message: string;
}

// Interface for soil parameters
interface SoilParameters {
  _id?: string;
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
  recommendedCrop: string | null;
  createdAt?: string;
  updatedAt?: string;
  confidence?: number;
  alternativeRecommendations?: Record<string, number>;
}

// Add this near your other interfaces
interface CropGuidesData {
  [key: string]: string;
}

const getCropHealthColor = (score: number) => {
  if (score >= 80) return "#4CAF50"; // Green
  if (score >= 60) return "#8BC34A"; // Light Green
  if (score >= 40) return "#FFC107"; // Amber
  if (score >= 20) return "#FF9800"; // Orange
  return "#F44336"; // Red
};

const getMoistureColor = (moisture: number, optimal: number) => {
  const diff = Math.abs(moisture - optimal);
  const percentage = diff / optimal;
  
  if (percentage <= 0.1) return "#4CAF50"; // Green - within 10%
  if (percentage <= 0.2) return "#8BC34A"; // Light Green - within 20%
  if (percentage <= 0.3) return "#FFC107"; // Amber - within 30%
  if (percentage <= 0.4) return "#FF9800"; // Orange - within 40%
  return "#F44336"; // Red - more than 40% off
};

const LoadingCard = () => (
  <div className="flex justify-center items-center h-full min-h-[200px]">
    <RefreshCw className="animate-spin text-primary h-8 w-8" />
  </div>
);

const ErrorCard = ({ message }: { message: string }) => (
  <div className="flex flex-col justify-center items-center h-full min-h-[200px] text-destructive">
    <AlertCircle className="h-10 w-10 mb-3" />
    <p className="text-sm">{message}</p>
  </div>
);

const CropHealthDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { data: sensorData, isLoading: isLoadingSensor, error: sensorError } = useLatestSensorData();
  const { data: healthData, isLoading: isLoadingHealth, error: healthError } = useCropHealth();
  const { data: irrigationData, isLoading: isLoadingIrrigation, error: irrigationError } = useIrrigationRecommendation();
  const { data: fertilizerData, isLoading: isLoadingFertilizer, error: fertilizerError } = useFertilizerPlan();
  const { data: yieldData, isLoading: isLoadingYield, error: yieldError } = useYieldPrediction();
  
  // State for plant disease prediction
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PlantDiseasePrediction | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // State for crop recommendation
  const [soilParameters, setSoilParameters] = useState<SoilParameters>({
    N: 0,
    P: 0,
    K: 0,
    temperature: 0,
    humidity: 0,
    ph: 0,
    rainfall: 0,
    recommendedCrop: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cropRecommendation, setCropRecommendation] = useState<string | null>(null);
  const [parameterHistory, setParameterHistory] = useState<SoilParameters[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [apiHealth, setApiHealth] = useState<{ status: string; modelsLoaded: boolean } | null>(null);
  const [selectedCropGuide, setSelectedCropGuide] = useState<string | null>(null);
  
  // Add crop guide data
  const cropGuides: CropGuidesData = {
    'rice': `*Soil Type:* Clayey or silty loam soil with good water retention  
*pH Range:* 5.5 - 7.0  
*Watering:* Requires standing water or heavy irrigation, especially during the early stages  
*Fertilizers:* Urea, DAP, and Potash; apply in split doses  
*Pest Control:* Use carbofuran granules or neem-based pesticides to control stem borers and leaf folders`,

    'maize': `*Soil Type:* Well-drained fertile loamy soil  
*pH Range:* 5.5 - 7.0  
*Watering:* Moderate, avoid waterlogging  
*Fertilizers:* NPK (Nitrogen-Phosphorus-Potassium) in 2:1:1 ratio  
*Pest Control:* Use chlorpyrifos or neem extract to control borers and armyworms`,

    'chickpea': `*Soil Type:* Well-drained sandy loam  
*pH Range:* 6.0 - 7.5  
*Watering:* Requires minimal irrigation; overwatering causes root rot  
*Fertilizers:* Apply organic manure + phosphate fertilizers  
*Pest Control:* Apply malathion or neem oil to control pod borers`,

    'kidneybeans': `*Soil Type:* Loose, well-drained loamy soil  
*pH Range:* 6.0 - 7.5  
*Watering:* Requires consistent moisture but avoid waterlogging  
*Fertilizers:* Use compost + nitrogen-based fertilizers  
*Pest Control:* Monitor for aphids and use insecticidal soap`,

    'pigeonpeas': `*Soil Type:* Loamy soil with moderate fertility  
*pH Range:* 5.0 - 7.0  
*Watering:* Moderate, avoid standing water  
*Fertilizers:* Apply well-rotted FYM + phosphorus fertilizer  
*Pest Control:* Use biological control like Trichogramma for pod borers`,

    'mothbeans': `*Soil Type:* Sandy or loamy soil  
*pH Range:* 6.0 - 7.0  
*Watering:* Drought-tolerant; 1–2 irrigations needed  
*Fertilizers:* Use light dose of nitrogen and phosphorus  
*Pest Control:* Spray neem oil to control sucking pests`,

    'mungbean': `*Soil Type:* Sandy loam or loam soil  
*pH Range:* 6.2 - 7.5  
*Watering:* Needs 3-4 irrigations during flowering and pod filling  
*Fertilizers:* Apply Rhizobium inoculation + phosphorus  
*Pest Control:* Control thrips and whiteflies using imidacloprid`,

    'blackgram': `*Soil Type:* Loamy to clay loam soils  
*pH Range:* 6.0 - 7.5  
*Watering:* 2-3 irrigations, especially at flowering stage  
*Fertilizers:* Organic manure + light dose of nitrogen and phosphorus  
*Pest Control:* Neem seed kernel extract for controlling pests`,

    'lentil': `*Soil Type:* Deep, well-drained loamy soil  
*pH Range:* 6.0 - 7.5  
*Watering:* Avoid heavy irrigation; needs watering at pod formation  
*Fertilizers:* Apply single super phosphate  
*Pest Control:* Apply Bacillus thuringiensis or neem extracts`,

    'pomegranate': `*Soil Type:* Loamy soil with good drainage  
*pH Range:* 5.5 - 7.2  
*Watering:* Deep irrigation every 10–15 days  
*Fertilizers:* Apply FYM + nitrogen and potash  
*Pest Control:* Use dimethoate for fruit borers`,

    'banana': `*Soil Type:* Rich, loamy soil with high organic matter  
*pH Range:* 6.0 - 7.5  
*Watering:* Requires frequent watering; avoid water stagnation  
*Fertilizers:* Apply nitrogen and potash monthly  
*Pest Control:* Use chlorpyrifos for root borers and mites`,

    'mango': `*Soil Type:* Alluvial, loamy or sandy loam  
*pH Range:* 5.5 - 7.5  
*Watering:* Once in 2 weeks during dry season  
*Fertilizers:* FYM + NPK in 3:2:2 ratio  
*Pest Control:* Copper oxychloride for anthracnose and malathion for hoppers`,

    'grapes': `*Soil Type:* Sandy loam or loamy soil  
*pH Range:* 6.5 - 7.5  
*Watering:* Frequent watering during fruiting season  
*Fertilizers:* Apply potassium nitrate and micronutrients  
*Pest Control:* Use sulfur spray for powdery mildew`,

    'watermelon': `*Soil Type:* Sandy loam soil  
*pH Range:* 6.0 - 7.0  
*Watering:* Water heavily during flowering, then taper  
*Fertilizers:* NPK + zinc sulfate  
*Pest Control:* Neem oil for aphids and beetles`,

    'muskmelon': `*Soil Type:* Light sandy loam  
*pH Range:* 6.0 - 7.0  
*Watering:* Irrigate every 7–10 days during fruiting  
*Fertilizers:* Nitrogen and potash fertilizers  
*Pest Control:* Use neem spray for fruit fly`,

    'apple': `*Soil Type:* Well-drained loamy soil  
*pH Range:* 6.0 - 7.0  
*Watering:* Regular irrigation during dry season  
*Fertilizers:* FYM + urea and potash  
*Pest Control:* Use fungicides for scab and insecticides for borers`,

    'orange': `*Soil Type:* Light loam with good drainage  
*pH Range:* 5.5 - 6.5  
*Watering:* Irrigate weekly during fruiting  
*Fertilizers:* NPK + micronutrients (zinc, iron)  
*Pest Control:* Imidacloprid for aphids and mealy bugs`,

    'papaya': `*Soil Type:* Light, porous, well-drained soil  
*pH Range:* 5.5 - 7.0  
*Watering:* Frequent irrigation during flowering  
*Fertilizers:* NPK + magnesium  
*Pest Control:* Copper oxychloride spray to avoid fungal rot`,

    'coconut': `*Soil Type:* Sandy loam or red soil  
*pH Range:* 5.0 - 8.0  
*Watering:* Every 5–7 days in summer  
*Fertilizers:* Apply 1 kg of potash + compost  
*Pest Control:* Neem cake + malathion for beetles`,

    'cotton': `*Soil Type:* Black soil (regur) or loamy soil  
*pH Range:* 6.0 - 7.5  
*Watering:* Moderate, especially during flowering  
*Fertilizers:* Nitrogen, potash, and phosphorus  
*Pest Control:* Bt sprays and pheromone traps for bollworms`,

    'jute': `*Soil Type:* Loamy alluvial soil  
*pH Range:* 6.0 - 7.5  
*Watering:* Requires high humidity and rainfall  
*Fertilizers:* Urea and SSP  
*Pest Control:* Quinalphos spray to control stem weevils`,

    'coffee': `*Soil Type:* Rich, well-drained loamy soil  
*pH Range:* 6.0 - 6.5  
*Watering:* Requires high humidity and consistent rain  
*Fertilizers:* Nitrogen + compost + zinc  
*Pest Control:* Use Bordeaux mixture and copper fungicides for rust`
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      try {
        setIsAnalyzing(true);
        setError(null);
        
        // Display the selected image preview
        const imageUrl = URL.createObjectURL(files[0]);
        setSelectedImage(imageUrl);
        
        // Prepare form data
        const formData = new FormData();
        formData.append('file', files[0]);
        
        // Send to API
        const response = await axios.post('http://localhost:8000/predict', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setPredictionResult(response.data);
        toast({
          title: "Analysis Complete",
          description: "Plant disease prediction completed successfully.",
        });
      } catch (err) {
        console.error('Error analyzing image:', err);
        setError('Failed to analyze image. Please try again.');
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the image. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };
  
  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Update the npkData to use soil parameters if available
  const npkData = [
    {
      name: 'Nitrogen',
      value: soilParameters.N > 0 ? soilParameters.N : (sensorData?.data?.npk.nitrogen || 0),
      color: '#FF9933', // Orange from Indian flag
      source: soilParameters.N > 0 ? 'saved' : 'sensor'
    },
    {
      name: 'Phosphorus',
      value: soilParameters.P > 0 ? soilParameters.P : (sensorData?.data?.npk.phosphorus || 0),
      color: '#FFFFFF', // White from Indian flag
      source: soilParameters.P > 0 ? 'saved' : 'sensor'
    },
    {
      name: 'Potassium',
      value: soilParameters.K > 0 ? soilParameters.K : (sensorData?.data?.npk.potassium || 0),
      color: '#138808', // Green from Indian flag
      source: soilParameters.K > 0 ? 'saved' : 'sensor'
    },
  ];
  
  // Format disease name for display (replace underscores with spaces)
  const formatDiseaseName = (name: string) => {
    return name.replace(/_/g, ' ').replace(/___/g, ' - ');
  };
  
  // Fetch the latest soil parameters
  const fetchSoilParameters = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/soil/parameters');
      setSoilParameters(response.data);
      setCropRecommendation(response.data.recommendedCrop);
    } catch (error) {
      console.error('Error fetching soil parameters:', error);
      // If no parameters found, keep the default values
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch soil parameters history
  const fetchParameterHistory = async () => {
    try {
      const response = await api.get('/soil/parameters/history');
      setParameterHistory(response.data);
    } catch (error) {
      console.error('Error fetching parameter history:', error);
    }
  };
  
  // Load soil parameters on component mount
  useEffect(() => {
    fetchSoilParameters();
    fetchParameterHistory();
  }, []);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSoilParameters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Save soil parameters
  const handleSaveParameters = async () => {
    try {
      setIsSaving(true);
      
      let response;
      if (isEditing && soilParameters._id) {
        // Update existing parameters
        response = await api.put(`/soil/parameters/${soilParameters._id}`, soilParameters);
      } else {
        // Create new parameters
        response = await api.post('/soil/parameters', soilParameters);
      }
      
      setSoilParameters(response.data);
      setCropRecommendation(response.data.recommendedCrop);
      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Soil parameters saved successfully.",
      });
      
      // Refresh parameter history
      fetchParameterHistory();
    } catch (error) {
      console.error('Error saving soil parameters:', error);
      toast({
        title: "Error",
        description: "Failed to save soil parameters.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Load parameters from history
  const handleLoadParameters = (parameters: SoilParameters) => {
    setSoilParameters(parameters);
    setCropRecommendation(parameters.recommendedCrop);
    setIsEditing(true);
  };
  
  // Reset form
  const handleResetForm = () => {
    setSoilParameters({
      N: 0,
      P: 0,
      K: 0,
      temperature: 0,
      humidity: 0,
      ph: 0,
      rainfall: 0,
      recommendedCrop: null
    });
    setCropRecommendation(null);
    setIsEditing(false);
  };
  
  const handleGetPrediction = async () => {
    try {
      // Validate that all required fields have values
      const requiredFields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'];
      const missingFields = requiredFields.filter(field => 
        soilParameters[field as keyof SoilParameters] === 0 || 
        soilParameters[field as keyof SoilParameters] === null || 
        soilParameters[field as keyof SoilParameters] === undefined
      );
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Parameters",
          description: `Please fill in all required soil parameters: ${missingFields.join(', ')}`,
          variant: "destructive",
        });
        return;
      }
      
      setIsPredicting(true);
      setError(null);
      
      console.log('Sending soil parameters to ML API:', JSON.stringify(soilParameters, null, 2));
      
      try {
        // Use the cropRecommendationApi service to make the prediction
        const response = await cropRecommendationApi.predictCrop({
          N: soilParameters.N,
          P: soilParameters.P,
          K: soilParameters.K,
          temperature: soilParameters.temperature,
          humidity: soilParameters.humidity,
          ph: soilParameters.ph,
          rainfall: soilParameters.rainfall
        });
        
        console.log('ML API Response:', JSON.stringify(response, null, 2));
        
        // Update the soil parameters with the response
        setSoilParameters({
          ...soilParameters,
          recommendedCrop: response.recommended_crop,
          confidence: response.confidence,
          alternativeRecommendations: response.alternative_recommendations
        });
        
        // Update the crop recommendation
        setCropRecommendation(response.recommended_crop);
        
        toast({
          title: "Prediction Complete",
          description: "Crop recommendation generated successfully.",
        });
      } catch (apiError: any) {
        console.error('API error details:', {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        });
        throw apiError;
      }
    } catch (error) {
      console.error('Error getting crop recommendation:', error);
      setError('Failed to get crop recommendation. Please try again.');
      toast({
        title: "Prediction Failed",
        description: "Could not generate a crop recommendation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link 
                  to="/dashboard/farmer" 
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Farmer Dashboard</span>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">Crop Health Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Real-time insights and recommendations for optimal crop management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/dashboard/farmer">
                <Button variant="outline" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Farmer Dashboard
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Last updated: {sensorData?.data?.timestamp ? new Date(sensorData.data.timestamp).toLocaleString() : 'Loading...'}
              </p>
            </div>
          </div>
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="soil-analysis">Soil Analysis</TabsTrigger>
              <TabsTrigger value="pest-detection">Disease Detection</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              
              <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <Card className="col-span-1 md:col-span-1 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-3 border-b bg-gray-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-[#138808]" />
                      Crop Health Score
                    </CardTitle>
                    <CardDescription>
                      Overall assessment of your crop's health
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoadingHealth ? (
                      <LoadingCard />
                    ) : healthError ? (
                      <ErrorCard message="Failed to load crop health data" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <div className="relative h-36 w-36 flex items-center justify-center rounded-full border-8"
                          style={{ borderColor: getCropHealthColor(healthData?.data?.score || 0) }}>
                          <span className="text-4xl font-bold">{healthData?.data?.score || 0}</span>
                          <span className="text-xs absolute bottom-3">out of 100</span>
                        </div>
                        <div className="mt-4 text-center">
                          <p className="text-lg font-semibold" 
                            style={{ color: getCropHealthColor(healthData?.data?.score || 0) }}>
                            {healthData?.data?.status || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="mt-2 pt-2 border-t">
                          <p className="text-sm font-medium mb-2">NPK Values (from saved parameters)</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <p className="text-xs text-muted-foreground">Nitrogen (N)</p>
                              <p className="font-medium">{soilParameters.N > 0 ? soilParameters.N : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <p className="text-xs text-muted-foreground">Phosphorus (P)</p>
                              <p className="font-medium">{soilParameters.P > 0 ? soilParameters.P : 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 p-2 rounded text-center">
                              <p className="text-xs text-muted-foreground">Potassium (K)</p>
                              <p className="font-medium">{soilParameters.K > 0 ? soilParameters.K : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="mt-2 bg-gray-50 p-2 rounded text-center">
                            <p className="text-xs text-muted-foreground">Rainfall (mm)</p>
                            <p className="font-medium">{soilParameters.rainfall > 0 ? soilParameters.rainfall : 'N/A'}</p>
                          </div>
                        </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-1 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-3 border-b bg-gray-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-[#FF9933]" />
                      Current Conditions
                    </CardTitle>
                    <CardDescription>
                      Soil and environmental parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoadingSensor || isLoading ? (
                      <LoadingCard />
                    ) : sensorError ? (
                      <ErrorCard message="Failed to load sensor data" />
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Droplet className="h-4 w-4 text-blue-600" />
                              <p className="text-sm text-blue-600">Moisture</p>
                            </div>
                            <p className="text-2xl font-semibold">{sensorData?.data?.moisture}%</p>
                          </div>
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Thermometer className="h-4 w-4 text-orange-600" />
                              <p className="text-sm text-orange-600">Temperature</p>
                            </div>
                            <p className="text-2xl font-semibold">
                              {soilParameters.temperature > 0 ? soilParameters.temperature : sensorData?.data?.temperature}°C
                            </p>
                            {soilParameters.temperature > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">From saved parameters</p>
                            )}
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Wind className="h-4 w-4 text-green-600" />
                              <p className="text-sm text-green-600">Humidity</p>
                            </div>
                            <p className="text-2xl font-semibold">
                              {soilParameters.humidity > 0 ? soilParameters.humidity : sensorData?.data?.humidity}%
                            </p>
                            {soilParameters.humidity > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">From saved parameters</p>
                            )}
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <Combine className="h-4 w-4 text-purple-600" />
                              <p className="text-sm text-purple-600">pH Level</p>
                            </div>
                            <p className="text-2xl font-semibold">
                              {soilParameters.ph > 0 ? soilParameters.ph : sensorData?.data?.pH.toFixed(1)}
                            </p>
                            {soilParameters.ph > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">From saved parameters</p>
                            )}
                          </div>
                        </div>
                        
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="col-span-1 md:col-span-1 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="pb-3 border-b bg-gray-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Combine className="h-5 w-5 text-[#138808]" />
                      Crop Recommendation
                    </CardTitle>
                    <CardDescription>
                      AI-powered crop suggestion
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoading ? (
                      <LoadingCard />
                    ) : cropRecommendation ? (
                      <div className="flex flex-col items-center">
                        <div className="relative h-36 w-36 flex items-center justify-center rounded-full border-8 border-green-600 mb-4">
                          <Leaf className="h-16 w-16 text-green-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-1">Recommended Crop</p>
                          <p className="text-xl font-bold text-green-700 capitalize">
                            {cropRecommendation}
                          </p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="mt-2 text-xs"
                            onClick={() => setActiveTab("recommendations")}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                        <Combine className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-center text-sm text-muted-foreground mb-2">
                          No crop recommendation yet
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab("recommendations")}
                        >
                          Get Recommendation
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      NPK Levels
                    </CardTitle>
                    <CardDescription>
                      Current soil nutrient status
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-[350px] pt-6">
                    {isLoadingSensor || isLoading ? (
                      <LoadingCard />
                    ) : sensorError ? (
                      <ErrorCard message="Failed to load NPK data" />
                    ) : (
                      <>
                        <ResponsiveContainer width="100%" height="85%">
                          <BarChart data={npkData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                            <YAxis domain={[0, 100]} stroke="#888" tickLine={false} axisLine={false} />
                            <Tooltip
                              contentStyle={{ 
                                borderRadius: '8px', 
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                                border: 'none'
                              }}
                              formatter={(value, name, props) => {
                                return [`${value} ${props.payload.source === 'saved' ? '(from saved parameters)' : ''}`, name];
                              }}
                            />
                            <Bar dataKey="value">
                              {npkData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="text-xs text-center text-muted-foreground mt-2">
                          {npkData.some(item => item.source === 'saved') ? 
                            "Some values are from your saved soil parameters" : 
                            "Values from sensor data"}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <CardHeader className="border-b bg-gray-50">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Combine className="h-5 w-5 text-[#138808]" />
                      Yield Prediction
                    </CardTitle>
                    <CardDescription>
                      Estimated harvest outcomes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {isLoadingYield ? (
                      <LoadingCard />
                    ) : yieldError ? (
                      <ErrorCard message="Failed to load yield prediction data" />
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center py-4">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-[#138808]">
                              {yieldData?.data?.estimatedYield}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {yieldData?.data?.unit}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            {yieldData?.data?.comparisonToAverage && yieldData.data.comparisonToAverage > 0 ? (
                              <div className="text-green-600 font-medium flex items-center">
                                <span className="mr-1">+{yieldData.data.comparisonToAverage}%</span> 
                                above average
                              </div>
                            ) : (
                              <div className="text-red-600 font-medium flex items-center">
                                <span className="mr-1">{yieldData?.data?.comparisonToAverage}%</span> 
                                below average
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Improvement Suggestions:</h4>
                          <ul className="space-y-1">
                            {yieldData?.data?.improvementSuggestions.map((suggestion, index) => (
                              <li key={index} className="text-sm flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="border-b bg-gray-50">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-600" />
                    Irrigation Status
                  </CardTitle>
                  <CardDescription>
                    Water recommendations based on soil conditions
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoadingIrrigation || isLoading ? (
                    <LoadingCard />
                  ) : irrigationError ? (
                    <ErrorCard message="Failed to load irrigation data" />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-4">
                        {/* Use saved rainfall data if available */}
                        {soilParameters.rainfall > 0 && (
                          <div className="bg-blue-50 p-3 rounded-lg mb-3 w-full">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Droplet className="h-5 w-5 text-blue-600" />
                                <p className="font-medium">Rainfall Data</p>
                              </div>
                              <p className="text-lg font-semibold">{soilParameters.rainfall} mm</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">From saved parameters</p>
                          </div>
                        )}
                        
                        {irrigationData?.data?.currentMoisture < irrigationData?.data?.optimalMoisture ? (
                          <AlertTriangle className="h-8 w-8 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-8 w-8 text-green-600" />
                        )}
                        <div>
                          <h4 className="font-semibold">
                            {irrigationData?.data?.currentMoisture < irrigationData?.data?.optimalMoisture 
                              ? "Irrigation Needed" 
                              : "Adequate Moisture"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Current: {irrigationData?.data?.currentMoisture}% | 
                            Optimal: {irrigationData?.data?.optimalMoisture}%
                          </p>
                        </div>
                      </div>
                      
                      <div className="h-3 rounded-full overflow-hidden bg-gray-200">
                        <div 
                          className="h-full rounded-full transition-all" 
                          style={{ 
                            width: `${Math.min(100, (irrigationData?.data?.currentMoisture / irrigationData?.data?.optimalMoisture) * 100)}%`,
                            backgroundColor: getMoistureColor(
                              irrigationData?.data?.currentMoisture || 0,
                              irrigationData?.data?.optimalMoisture || 50
                            )
                          }}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm mt-4">
                        <Clock className="h-4 w-4" />
                        <span>Next irrigation: {irrigationData?.data?.nextIrrigation 
                          ? new Date(irrigationData.data.nextIrrigation).toLocaleString() 
                          : 'Not scheduled'}</span>
                      </div>
                      
                      {/* Add irrigation recommendation based on saved parameters */}
                      {soilParameters.rainfall > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <h4 className="font-medium mb-2">Recommendation Based on Your Data</h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm">
                              {soilParameters.rainfall < 100 
                                ? "Based on your rainfall data, additional irrigation may be needed for optimal growth." 
                                : soilParameters.rainfall < 200
                                  ? "Your rainfall levels are moderate. Monitor soil moisture regularly."
                                  : "Your rainfall levels are high. Ensure proper drainage to prevent waterlogging."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="soil-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Soil Analysis</CardTitle>
                  <CardDescription>
                    Comprehensive breakdown of soil composition and properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingSensor ? (
                    <LoadingCard />
                  ) : sensorError ? (
                    <ErrorCard message="Failed to load soil data" />
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">NPK Composition</h3>
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm text-[#FF9933]">Nitrogen (N)</Label>
                                <span className="text-sm font-semibold">{sensorData?.data?.npk.nitrogen}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#FF9933]" 
                                  style={{ width: `${sensorData?.data?.npk.nitrogen}%` }} 
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm text-gray-500">Phosphorus (P)</Label>
                                <span className="text-sm font-semibold">{sensorData?.data?.npk.phosphorus}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gray-500" 
                                  style={{ width: `${sensorData?.data?.npk.phosphorus}%` }} 
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <Label className="text-sm text-[#138808]">Potassium (K)</Label>
                                <span className="text-sm font-semibold">{sensorData?.data?.npk.potassium}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#138808]" 
                                  style={{ width: `${sensorData?.data?.npk.potassium}%` }} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Soil Properties</h3>
                          
                          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div>
                              <Label className="text-sm">pH Level</Label>
                              <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold">{sensorData?.data?.pH.toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground mb-1">
                                  {sensorData?.data?.pH < 6 ? 'Acidic' : sensorData?.data?.pH > 7.5 ? 'Alkaline' : 'Neutral'}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Moisture Content</Label>
                              <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold">{sensorData?.data?.moisture}%</span>
                                <span className="text-sm text-muted-foreground mb-1">
                                  {sensorData?.data?.moisture < 30 ? 'Low' : sensorData?.data?.moisture > 60 ? 'High' : 'Optimal'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">Environmental Factors</h3>
                          
                          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                            <div>
                              <Label className="text-sm">Temperature</Label>
                              <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold">{sensorData?.data?.temperature}°C</span>
                                <span className="text-sm text-muted-foreground mb-1">
                                  {sensorData?.data?.temperature < 15 ? 'Cool' : sensorData?.data?.temperature > 30 ? 'Hot' : 'Moderate'}
                                </span>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm">Humidity</Label>
                              <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold">{sensorData?.data?.humidity}%</span>
                                <span className="text-sm text-muted-foreground mb-1">
                                  {sensorData?.data?.humidity < 40 ? 'Low' : sensorData?.data?.humidity > 70 ? 'High' : 'Moderate'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pest-detection" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Plant Disease Detection</CardTitle>
                  <CardDescription>
                    Upload an image of your crop to detect diseases and get treatment recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors"
                        onClick={handleClickUpload}
                        style={{ cursor: 'pointer' }}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        
                        {selectedImage ? (
                          <div className="flex flex-col items-center">
                            <div className="mb-4 relative">
                              <img 
                                src={selectedImage} 
                                alt="Selected crop" 
                                className="max-h-48 rounded-md object-contain"
                              />
                            </div>
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClickUpload();
                              }}
                              disabled={isAnalyzing}
                            >
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="font-medium text-lg mb-2">Upload Image</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                              Take a clear photo of the affected plant part and upload it here
                            </p>
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClickUpload();
                              }}
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4 mr-2" />
                                  Select Image
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm space-y-1 text-muted-foreground">
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Upload a close-up image of the affected area
                        </p>
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Ensure good lighting for accurate detection
                        </p>
                        <p className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Include visible symptoms for better diagnosis
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {isAnalyzing ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center h-full">
                          <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
                          <h3 className="font-medium text-center mb-2">Analyzing Image</h3>
                          <p className="text-sm text-center text-muted-foreground">
                            Our AI is analyzing your crop image for diseases...
                          </p>
                        </div>
                      ) : error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center h-full">
                          <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
                          <h3 className="font-medium text-center mb-2">Analysis Error</h3>
                          <p className="text-sm text-center text-muted-foreground">
                            {error}
                          </p>
                        </div>
                      ) : predictionResult ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          {predictionResult.predictions.map((prediction, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                              <div className="flex items-center gap-3 mb-3">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ 
                                    backgroundColor: getCropHealthColor(prediction.health_score * 10) 
                                  }}
                                ></div>
                                <h3 className="font-semibold text-lg">
                                  {formatDiseaseName(prediction.class_name)}
                                </h3>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500">Confidence</p>
                                    <p className="font-medium">{(prediction.confidence * 100).toFixed(1)}%</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500">Health Score</p>
                                    <p className="font-medium">{prediction.health_score}/10</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Prevention & Treatment</p>
                                  <div className="text-sm p-3 bg-white rounded border">
                                    {prediction.prevention_tip}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center h-full">
                          <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-medium text-center mb-2">No Analysis Available</h3>
                          <p className="text-sm text-center text-muted-foreground">
                            Upload an image of your crop to receive AI-powered disease detection results
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-6">
            <Card>
                <CardHeader>
                  <CardTitle>Crop Recommendation</CardTitle>
                  <CardDescription>
                    Get AI-powered crop recommendations based on soil and weather parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Soil & Weather Parameters</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="N" className="flex justify-between">
                            <span>Nitrogen (N)</span>
                            <span className="text-xs text-muted-foreground">Range: 0-140 kg/ha</span>
                          </Label>
                          <Input
                            id="N"
                            name="N"
                            type="number"
                            value={soilParameters.N}
                            onChange={handleInputChange}
                            placeholder="0-140"
                            className={soilParameters.N < 0 || soilParameters.N > 140 ? "border-red-300 focus:border-red-300" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="P" className="flex justify-between">
                            <span>Phosphorus (P)</span>
                            <span className="text-xs text-muted-foreground">Range: 5-145 kg/ha</span>
                          </Label>
                          <Input
                            id="P"
                            name="P"
                            type="number"
                            value={soilParameters.P}
                            onChange={handleInputChange}
                            placeholder="5-145"
                            className={soilParameters.P < 5 || soilParameters.P > 145 ? "border-red-300 focus:border-red-300" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="K" className="flex justify-between">
                            <span>Potassium (K)</span>
                            <span className="text-xs text-muted-foreground">Range: 5-205 kg/ha</span>
                          </Label>
                          <Input
                            id="K"
                            name="K"
                            type="number"
                            value={soilParameters.K}
                            onChange={handleInputChange}
                            placeholder="5-205"
                            className={soilParameters.K < 5 || soilParameters.K > 205 ? "border-red-300 focus:border-red-300" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="temperature" className="flex justify-between">
                            <span>Temperature (°C)</span>
                            <span className="text-xs text-muted-foreground">Range: 8-44°C</span>
                          </Label>
                          <Input
                            id="temperature"
                            name="temperature"
                            type="number"
                            step="0.01"
                            value={soilParameters.temperature}
                            onChange={handleInputChange}
                            placeholder="8-44"
                            className={soilParameters.temperature < 8 || soilParameters.temperature > 44 ? "border-red-300 focus:border-red-300" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="humidity" className="flex justify-between">
                            <span>Humidity (%)</span>
                            <span className="text-xs text-muted-foreground">Range: 14-100%</span>
                          </Label>
                          <Input
                            id="humidity"
                            name="humidity"
                            type="number"
                            step="0.01"
                            value={soilParameters.humidity}
                            onChange={handleInputChange}
                            placeholder="14-100"
                            className={soilParameters.humidity < 14 || soilParameters.humidity > 100 ? "border-red-300 focus:border-red-300" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ph" className="flex justify-between">
                            <span>pH Level</span>
                            <span className="text-xs text-muted-foreground">Range: 3.5-10</span>
                          </Label>
                          <Input
                            id="ph"
                            name="ph"
                            type="number"
                            step="0.1"
                            value={soilParameters.ph}
                            onChange={handleInputChange}
                            placeholder="3.5-10"
                            className={soilParameters.ph < 3.5 || soilParameters.ph > 10 ? "border-red-300 focus:border-red-300" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rainfall" className="flex justify-between">
                            <span>Rainfall (mm)</span>
                            <span className="text-xs text-muted-foreground">Range: 20-300 mm</span>
                          </Label>
                          <Input
                            id="rainfall"
                            name="rainfall"
                            type="number"
                            step="0.01"
                            value={soilParameters.rainfall}
                            onChange={handleInputChange}
                            placeholder="20-300"
                            className={soilParameters.rainfall < 20 || soilParameters.rainfall > 300 ? "border-red-300 focus:border-red-300" : ""}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg mt-4 text-sm">
                        <p className="flex items-center text-blue-800 font-medium mb-1">
                          <Info className="w-4 h-4 mr-1" /> Tip: Input Guidance
                        </p>
                        <p className="text-blue-700">
                          Enter your soil test results and climate data for the most accurate crop recommendations. 
                          Values outside the suggested ranges might result in less reliable predictions.
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 pt-2">
                        <Button 
                          onClick={handleGetPrediction}
                          disabled={isPredicting}
                          variant="secondary"
                        >
                          {isPredicting ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Predicting...
                            </>
                          ) : (
                            "Get Prediction"
                          )}
                        </Button>
                        <Button 
                          onClick={handleSaveParameters}
                          disabled={isSaving || isPredicting}
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : isEditing ? (
                            "Update Parameters"
                          ) : (
                            "Save Parameters"
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleResetForm}
                        >
                          Reset
                        </Button>
                        {apiHealth && (
                          <div className={`px-3 py-1 rounded-full flex items-center gap-1 text-xs ${apiHealth.modelsLoaded ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            <div className={`w-2 h-2 rounded-full ${apiHealth.modelsLoaded ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                            API: {apiHealth.status}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">Recommended Crop</h3>
                      
                      {isLoading || isPredicting ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center h-64">
                          <RefreshCw className="h-10 w-10 text-primary animate-spin mb-4" />
                          <h3 className="font-medium text-center mb-2">
                            {isPredicting ? "Predicting Crop..." : "Loading Parameters"}
                          </h3>
                          <p className="text-sm text-center text-muted-foreground">
                            {isPredicting 
                              ? "Analyzing soil and climate parameters..." 
                              : "Fetching your saved soil parameters..."}
                          </p>
                        </div>
                      ) : cropRecommendation ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6 h-fit flex flex-col">
                          <div className="flex items-center gap-3 mb-6">
                            <Leaf className="h-8 w-8 text-green-600" />
                            <div>
                              <h3 className="font-semibold text-lg">Recommendation Result</h3>
                              <p className="text-sm text-muted-foreground">
                                Based on your soil and weather parameters
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col items-center justify-center mb-6">
                            <p className="text-sm text-muted-foreground mb-2">Primary Recommendation</p>
                            <p className="text-3xl font-bold text-green-700 capitalize mb-1">
                              {cropRecommendation}
                            </p>
                            {soilParameters.confidence !== undefined && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${Math.round(soilParameters.confidence * 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                  {Math.round(soilParameters.confidence * 100)}%
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {cropRecommendation && soilParameters.alternativeRecommendations && 
                           Object.keys(soilParameters.alternativeRecommendations).length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium mb-2">Confidence Analysis</h4>
                              <div className="bg-white border border-gray-200 rounded-lg p-3">
                                {(() => {
                                  try {
                                    return (
                                      <CropRecommendationChart 
                                        recommendedCrop={cropRecommendation}
                                        confidence={soilParameters.confidence || 0}
                                        alternatives={soilParameters.alternativeRecommendations || {}}
                                      />
                                    );
                                  } catch (error) {
                                    console.error('Error rendering chart:', error);
                                    return (
                                      <div className="p-4 bg-red-50 rounded-md text-red-600 text-sm">
                                        <p>Could not load chart visualization. Please try refreshing the page.</p>
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                          
                          {cropRecommendation && (
                            <div className="mt-8" id="crop-guide">
                              <div className="flex items-center gap-2 mb-4">
                                <Leaf className="h-5 w-5 text-green-600" />
                                <h4 className="text-lg font-semibold">Growing Guide</h4>
                              </div>
                              
                              <div className="bg-white border border-gray-200 rounded-lg p-5">
                                <div className="mb-4">
                                  <label htmlFor="cropSelector" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Crop
                                  </label>
                                  <select
                                    id="cropSelector"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                    onChange={(e) => {
                                      const selectedCrop = e.target.value;
                                      setSelectedCropGuide(cropGuides[selectedCrop]);
                                    }}
                                    defaultValue={cropRecommendation.toLowerCase()}
                                  >
                                    {Object.keys(cropGuides).map((crop) => (
                                      <option key={crop} value={crop}>
                                        {crop.charAt(0).toUpperCase() + crop.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                
                                <div className="mt-4 bg-green-50 p-4 rounded-md">
                                  <h4 className="mb-2 text-lg font-medium text-green-800">Growing Guide</h4>
                                  <div className="text-sm text-green-700 whitespace-pre-line">
                                    {selectedCropGuide || cropGuides[cropRecommendation.toLowerCase()] || cropGuides['lentil']}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm text-center text-muted-foreground mt-6">
                            This recommendation is based on ML analysis of your soil parameters
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center h-64">
                          <Leaf className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-medium text-center mb-2">No Recommendation Yet</h3>
                          <p className="text-sm text-center text-muted-foreground">
                            Enter your soil parameters and click "Get Prediction" to receive a crop recommendation
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-3">Parameter History</h4>
                        {parameterHistory.length > 0 ? (
                          <div className="max-h-64 overflow-y-auto border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Crop</TableHead>
                                  <TableHead>Confidence</TableHead>
                                  <TableHead></TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {parameterHistory.map((params) => (
                                  <TableRow key={params._id}>
                                    <TableCell>
                                      {params.createdAt ? new Date(params.createdAt).toLocaleDateString() : 'N/A'}
                                    </TableCell>
                                    <TableCell className="capitalize">
                                      {params.recommendedCrop || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                      {params.confidence ? `${Math.round(params.confidence * 100)}%` : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleLoadParameters(params)}
                                      >
                                        Load
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No parameter history available
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Smart Irrigation Recommendations</CardTitle>
                  <CardDescription>
                    Optimal watering schedules based on soil moisture and environmental factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingIrrigation ? (
                    <LoadingCard />
                  ) : irrigationError ? (
                    <ErrorCard message="Failed to load irrigation recommendations" />
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Current Status</h3>
                        <p>{irrigationData?.data?.recommendation}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Irrigation Schedule</h3>
                        <p className="mb-4 text-sm">{irrigationData?.data?.scheduleRecommendation}</p>
                        
                        <div className="flex items-center gap-4 border-t pt-4">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">Next Scheduled Irrigation</p>
                            <p className="text-sm text-muted-foreground">
                              {irrigationData?.data?.nextIrrigation 
                                ? new Date(irrigationData.data.nextIrrigation).toLocaleString() 
                                : 'Not scheduled'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Fertilizer & Nutrient Plan</CardTitle>
                  <CardDescription>
                    Recommended fertilizer applications based on soil analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingFertilizer ? (
                    <LoadingCard />
                  ) : fertilizerError ? (
                    <ErrorCard message="Failed to load fertilizer recommendations" />
                  ) : (
                    <div className="space-y-6">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nutrient</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Application Schedule</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fertilizerData?.data?.recommendations.map((rec, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{rec.nutrient}</TableCell>
                              <TableCell>{rec.amount}</TableCell>
                              <TableCell>{rec.schedule}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Notes</h3>
                        <p className="text-sm">{fertilizerData?.data?.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Crop Health Recommendations</CardTitle>
                  <CardDescription>
                    Actionable insights to improve overall crop health
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingHealth ? (
                    <LoadingCard />
                  ) : healthError ? (
                    <ErrorCard message="Failed to load crop health recommendations" />
                  ) : (
                    <div className="space-y-4">
                      <ul className="space-y-3">
                        {healthData?.data?.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium">{rec}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CropHealthDashboard;
