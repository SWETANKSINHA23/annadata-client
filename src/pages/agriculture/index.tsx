import React, { lazy, Suspense } from 'react';
import { RefreshCw } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Use React's lazy loading
const CropHealthDashboard = lazy(() => import('./CropHealthDashboard'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <RefreshCw className="animate-spin h-8 w-8 text-primary" />
    <span className="ml-2">Loading Dashboard...</span>
  </div>
);

const AgricultureDashboard = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <CropHealthDashboard />
      </Suspense>
    </ErrorBoundary>
  );
};

export default AgricultureDashboard; 