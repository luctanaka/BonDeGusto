import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

const useUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_CONFIG.baseURL}/units`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar unidades');
      }
      
      const data = await response.json();
      setUnits(data.data || data);
    } catch (err) {
      console.error('Error fetching units:', err);
      setError(err.message || 'Erro ao carregar unidades');
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const getUnitByKey = (key) => {
    return units.find(unit => unit.key === key);
  };

  const getUnitName = (key) => {
    const unit = getUnitByKey(key);
    return unit ? unit.displayName : key;
  };

  return {
    units,
    loading,
    error,
    fetchUnits,
    getUnitByKey,
    getUnitName,
    refetch: fetchUnits
  };
};

export default useUnits;