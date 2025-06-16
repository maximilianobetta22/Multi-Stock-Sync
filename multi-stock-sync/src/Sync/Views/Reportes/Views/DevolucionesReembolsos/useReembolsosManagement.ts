import React from 'react';
import axiosInstance from '../../../../../axiosConfig';
import axios from 'axios';

export interface Refund {
  id: number;
  created_date: string;
  total_amount: number;
  status: string;
  product: {
    title: string;
    quantity: number;
    price: number;
  };
  buyer: {
    id: number;
    name: string;
  };
  billing: {
    first_name: string;
    last_name: string;
    identification: {
      type: string;
      number: string;
    };
  };
  shipping: {
    shipping_id: string;
    shipping_method: string;
    tracking_number: string;
    shipping_status: string;
    shipping_address: {
      address: string;
      number: string;
      city: string;
      state: string;
      country: string;
      comments: string;
    };
  };
}

export const useRefundsManagement = () => {
  const [refunds, setRefunds] = React.useState<Refund[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchRefunds = React.useCallback(async (client_id: string, year: string, month: string) => {
    setLoading(true);
    setError(null);
    try {
      const date_from = `${year}-${month}-01`;
      const date_to = `${year}-${month}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`;
      
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_API_URL}/mercadolibre/refunds-by-category/${client_id}`,
        {
          params: { date_from, date_to }
        }
      );

      const refundsData = response.data.data;
      const refundsList: Refund[] = [];

      for (const category in refundsData) {
        if (refundsData[category] && Array.isArray(refundsData[category].orders)) {
            refundsList.push(...refundsData[category].orders);
        }
      }
      
      setRefunds(refundsList);
    } catch (error) {
      console.error('Error fetching refunds data:', error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'Error al obtener las devoluciones');
      } else {
        setError('Ocurrió un error inesperado al obtener las devoluciones.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    refunds,
    loading,
    error,
    fetchRefunds,
  };
};