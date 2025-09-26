import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

const useRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.baseURL}/restaurants`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar restaurantes');
      }
      
      const data = await response.json();
      setRestaurants(data.data || data);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError(err.message || 'Erro ao carregar restaurantes');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const getRestaurantByKey = (key) => {
    return restaurants.find(restaurant => restaurant.key === key);
  };

  const getRestaurantName = (key) => {
    const restaurant = getRestaurantByKey(key);
    return restaurant ? restaurant.displayName : key;
  };

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants,
    getRestaurantByKey,
    getRestaurantName
  };
};

export default useRestaurants;