import axios from 'axios';
import { toast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_CROP_RECOMMENDATION_API_URL || 'http://localhost:8000';

// Interface for soil parameters in the request body
export interface SoilParameters {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

// Interface for crop prediction response
export interface CropPredictionResponse {
  recommended_crop: string;
  confidence: number;
  alternative_recommendations: Record<string, number>;
}

// Interface for API health response
export interface HealthResponse {
  status: string;
  models_loaded: boolean;
  details?: Record<string, any>;
}

const cropRecommendationApi = {
  /**
   * Get health status of the API
   */
  async getHealth(): Promise<HealthResponse> {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  },

  /**
   * Predict the most suitable crop based on soil parameters
   */
  async predictCrop(parameters: SoilParameters): Promise<CropPredictionResponse> {
    try {
      const response = await axios.post(`${API_URL}/predict`, parameters);
      return response.data;
    } catch (error) {
      console.error('Error predicting crop:', error);
      toast({
        title: "Prediction Error",
        description: "Failed to get crop recommendation from API",
        variant: "destructive",
      });
      throw error;
    }
  },

  /**
   * Get debug information about the API
   */
  async getDebugInfo(): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/debug`);
      return response.data;
    } catch (error) {
      console.error('Error fetching debug info:', error);
      throw error;
    }
  }
};

export default cropRecommendationApi; 