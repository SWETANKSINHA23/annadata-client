import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="p-6 rounded-lg bg-red-50 border border-red-200 text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-red-800 mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-red-700 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reload page
        </Button>
        {resetErrorBoundary && (
          <Button 
            onClick={resetErrorBoundary}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Try again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback; 