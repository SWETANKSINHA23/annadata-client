export interface CropRecommendationDetails {
  water_requirements: string;
  fertilizer: string;
  pest_control: string;
  soil_type: string;
  ph_range: string;
  harvest_time: string;
}

const cropRecommendations: Record<string, CropRecommendationDetails> = {
  "rice": {
    "water_requirements": "1200-1500 mm (requires standing water during most of its growth).",
    "fertilizer": "100 kg N/ha, 60 kg P/ha, 40 kg K/ha. Split application recommended.",
    "pest_control": "Use neem-based or systemic pesticides for stem borers and leaf folders.",
    "soil_type": "Clayey loam with good water retention.",
    "ph_range": "5.5 to 7.0",
    "harvest_time": "100-150 days after sowing."
  },
  "maize": {
    "water_requirements": "500-800 mm, avoid waterlogging.",
    "fertilizer": "120 kg N/ha, 60 kg P/ha, 40 kg K/ha.",
    "pest_control": "Use pheromone traps and spray for armyworms or borers.",
    "soil_type": "Well-drained loamy soil.",
    "ph_range": "5.5 to 7.5",
    "harvest_time": "90-120 days after sowing."
  },
  "chickpea": {
    "water_requirements": "300-400 mm, mainly rain-fed.",
    "fertilizer": "20-40 kg N/ha, 60 kg P/ha.",
    "pest_control": "Protect from pod borers and aphids.",
    "soil_type": "Loamy to sandy soil with good drainage.",
    "ph_range": "6.0 to 8.0",
    "harvest_time": "90-100 days."
  },
  "kidneybeans": {
    "water_requirements": "350-500 mm.",
    "fertilizer": "50 kg N/ha, 75 kg P/ha, 20 kg K/ha.",
    "pest_control": "Control aphids and fungal infections.",
    "soil_type": "Sandy loam to loamy soil.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "90-100 days."
  },
  "pigeonpeas": {
    "water_requirements": "600-1000 mm.",
    "fertilizer": "25 kg N/ha, 50 kg P/ha.",
    "pest_control": "Spray for pod borers and fusarium wilt.",
    "soil_type": "Loamy soils with moderate fertility.",
    "ph_range": "6.0 to 7.0",
    "harvest_time": "150-200 days."
  },
  "mothbeans": {
    "water_requirements": "250-300 mm.",
    "fertilizer": "20 kg N/ha, 40 kg P/ha.",
    "pest_control": "Watch for aphids and jassids.",
    "soil_type": "Sandy loam soil.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "70-90 days."
  },
  "mungbean": {
    "water_requirements": "300-400 mm.",
    "fertilizer": "20 kg N/ha, 40 kg P/ha.",
    "pest_control": "Protect from whiteflies and aphids.",
    "soil_type": "Loam to sandy loam.",
    "ph_range": "6.2 to 7.2",
    "harvest_time": "60-75 days."
  },
  "blackgram": {
    "water_requirements": "300-400 mm.",
    "fertilizer": "25 kg N/ha, 50 kg P/ha.",
    "pest_control": "Aphids and yellow mosaic virus must be controlled.",
    "soil_type": "Alluvial or loamy soil.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "70-90 days."
  },
  "lentil": {
    "water_requirements": "250-400 mm.",
    "fertilizer": "20 kg N/ha, 40 kg P/ha.",
    "pest_control": "Use appropriate fungicides and insecticides for aphids and rust.",
    "soil_type": "Clay loam or loam soils.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "100-110 days."
  },
  "pomegranate": {
    "water_requirements": "500-800 mm.",
    "fertilizer": "Apply 600 g N, 200 g P, 200 g K per plant/year.",
    "pest_control": "Protect from fruit borers and aphids.",
    "soil_type": "Well-drained sandy loam.",
    "ph_range": "5.5 to 7.5",
    "harvest_time": "5-6 months after flowering."
  },
  "banana": {
    "water_requirements": "1200-2500 mm.",
    "fertilizer": "200 g N, 60 g P, 200 g K per plant per cycle.",
    "pest_control": "Control nematodes and banana weevils.",
    "soil_type": "Rich loamy soil with high organic content.",
    "ph_range": "5.5 to 7.0",
    "harvest_time": "11-12 months after planting."
  },
  "mango": {
    "water_requirements": "750-1200 mm.",
    "fertilizer": "400 g N, 250 g P, 500 g K per tree/year.",
    "pest_control": "Protect from mealybugs and mango hoppers.",
    "soil_type": "Well-drained alluvial to red loamy soil.",
    "ph_range": "5.5 to 7.5",
    "harvest_time": "3-6 months after flowering."
  },
  "grapes": {
    "water_requirements": "600-800 mm.",
    "fertilizer": "80 kg N/ha, 60 kg P/ha, 60 kg K/ha.",
    "pest_control": "Downy mildew and powdery mildew control essential.",
    "soil_type": "Loamy, well-drained with good organic matter.",
    "ph_range": "6.5 to 7.5",
    "harvest_time": "5-6 months after pruning."
  },
  "watermelon": {
    "water_requirements": "400-600 mm.",
    "fertilizer": "Apply 100 kg N/ha, 50 kg P/ha, 50 kg K/ha.",
    "pest_control": "Aphids and powdery mildew common.",
    "soil_type": "Sandy loam to loamy soil.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "75-90 days after sowing."
  },
  "muskmelon": {
    "water_requirements": "300-500 mm.",
    "fertilizer": "90 kg N/ha, 40 kg P/ha, 40 kg K/ha.",
    "pest_control": "Prevent powdery mildew and aphids.",
    "soil_type": "Light sandy loam, well-drained.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "80-100 days."
  },
  "apple": {
    "water_requirements": "900-1200 mm annually.",
    "fertilizer": "Apply 70 kg FYM/tree, 500 g N, 250 g P, 250 g K annually.",
    "pest_control": "Apple scab and codling moth are common issues.",
    "soil_type": "Loamy, well-drained soil in hilly areas.",
    "ph_range": "5.5 to 6.5",
    "harvest_time": "100-180 days depending on variety."
  },
  "orange": {
    "water_requirements": "1000-1500 mm.",
    "fertilizer": "400 g N, 200 g P, 300 g K per tree/year.",
    "pest_control": "Citrus psylla and fruit flies must be monitored.",
    "soil_type": "Well-drained loamy soil.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "8-10 months after flowering."
  },
  "papaya": {
    "water_requirements": "1000-1200 mm.",
    "fertilizer": "200 g N, 250 g P, 250 g K per plant/year.",
    "pest_control": "Control aphids, mealybugs, and viral diseases.",
    "soil_type": "Light, well-drained sandy loam.",
    "ph_range": "5.5 to 6.7",
    "harvest_time": "6-10 months."
  },
  "coconut": {
    "water_requirements": "1500-2500 mm.",
    "fertilizer": "500 g N, 320 g P, 1200 g K per palm/year.",
    "pest_control": "Rhinoceros beetle and red palm weevil are common pests.",
    "soil_type": "Coastal sandy or loamy soils with good drainage.",
    "ph_range": "5.2 to 8.0",
    "harvest_time": "6-10 years after planting, then regular yields."
  },
  "cotton": {
    "water_requirements": "600-1200 mm.",
    "fertilizer": "150 kg N/ha, 60 kg P/ha, 60 kg K/ha.",
    "pest_control": "Protect against bollworms and whiteflies.",
    "soil_type": "Black cotton soil or loamy soil.",
    "ph_range": "5.8 to 8.0",
    "harvest_time": "150-180 days."
  },
  "jute": {
    "water_requirements": "1500-2000 mm, well-distributed.",
    "fertilizer": "60 kg N/ha, 30 kg P/ha, 40 kg K/ha.",
    "pest_control": "Monitor for stem weevil and leaf caterpillar.",
    "soil_type": "Alluvial soils with good drainage.",
    "ph_range": "6.0 to 7.5",
    "harvest_time": "100-120 days."
  },
  "coffee": {
    "water_requirements": "1500-2500 mm, mostly through rainfall.",
    "fertilizer": "Apply NPK in split doses. 100 g N, 40 g P, 100 g K per plant/year.",
    "pest_control": "Control coffee borer and leaf rust.",
    "soil_type": "Well-drained red sandy loam or laterite soil.",
    "ph_range": "6.0 to 6.5",
    "harvest_time": "9-11 months after flowering."
  }
};

export const getCropRecommendationDetails = (cropName: string): CropRecommendationDetails | null => {
  if (!cropName) return null;
  
  const normalizedCropName = cropName.toLowerCase().trim();
  return cropRecommendations[normalizedCropName] || null;
};

export default {
  getCropRecommendationDetails
}; 