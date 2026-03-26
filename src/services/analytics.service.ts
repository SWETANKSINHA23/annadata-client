import { api } from '@/lib/axios';

interface AnalyticsResponse {
  stats: {
    totalSpent: number;
    totalOrders: number;
    totalSavings: number;
    ordersThisMonth: number;
    spendingTrend: number;
    ordersTrend: number;
    savingsTrend: number;
  };
  charts: {
    spending: { name: string; value: number }[];
    categories: { name: string; value: number }[];
    orderStatus: { name: string; value: number }[];
  };
}

class AnalyticsService {
  /**
   * Fetch consumer analytics data
   * @param timeRange - Time range for the analytics data (this-week, this-month, this-year)
   * @returns Analytics data including stats and charts
   */
  async getConsumerAnalytics(timeRange: string): Promise<AnalyticsResponse> {
    try {
      const response = await api.get('/consumer/analytics', { 
        params: { timeRange } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching consumer analytics:', error);
      throw error;
    }
  }

  /**
   * Export consumer analytics report as CSV
   * @param timeRange - Time range for the report data
   * @returns Blob containing CSV data
   */
  async exportConsumerReport(timeRange: string): Promise<Blob> {
    try {
      const response = await api.get('/consumer/analytics/export', {
        params: { timeRange },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting consumer report:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(); 