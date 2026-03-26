import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CropRecommendationChartProps {
  recommendedCrop: string;
  confidence: number;
  alternatives: Record<string, number>;
}

const COLORS = ['#138808', '#FF9933', '#65b7ff', '#9c27b0', '#e91e63', '#ff5722'];

const CropRecommendationChart: React.FC<CropRecommendationChartProps> = ({
  recommendedCrop,
  confidence,
  alternatives
}) => {
  // Prepare data for pie chart
  const data = [
    { name: recommendedCrop, value: confidence * 100 },
    ...Object.entries(alternatives).map(([crop, conf]) => ({
      name: crop,
      value: conf * 100
    }))
  ];

  // Sort data by value in descending order
  data.sort((a, b) => b.value - a.value);

  // Take only top 5 items (including the recommended crop)
  const chartData = data.slice(0, 5);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.name === recommendedCrop ? '#138808' : COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number | string) => {
              return typeof value === 'number' 
                ? [`${value.toFixed(1)}% confidence`, ''] 
                : [value, ''];
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CropRecommendationChart; 