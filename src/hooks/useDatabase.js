import { useState, useEffect, useCallback } from 'react';
import apiClient from '../config/api';

// Custom hook for managing database connection and API status
const useDatabase = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isLoading: true,
    error: null,
    lastChecked: null,
    serverInfo: null
  });

  const [apiHealth, setApiHealth] = useState({
    isHealthy: false,
    responseTime: null,
    database: null,
    server: null
  });

  // Check API health and database connection
  const checkConnection = useCallback(async () => {
    setConnectionStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    const startTime = Date.now();
    
    try {
      const healthData = await apiClient.healthCheck();
      const responseTime = Date.now() - startTime;
      
      if (healthData.isHealthy) {
        setConnectionStatus({
          isConnected: true,
          isLoading: false,
          error: null,
          lastChecked: new Date(),
          serverInfo: healthData.data
        });
        
        setApiHealth({
          isHealthy: true,
          responseTime,
          database: healthData.data.database,
          server: {
            status: healthData.data.status,
            uptime: healthData.data.uptime,
            environment: healthData.data.environment
          }
        });
      } else {
        throw new Error(healthData.error || 'API health check failed');
      }
    } catch (error) {
      console.error('Database connection check failed:', error);
      
      setConnectionStatus({
        isConnected: false,
        isLoading: false,
        error: error.message || 'Falha na conexão com o servidor',
        lastChecked: new Date(),
        serverInfo: null
      });
      
      setApiHealth({
        isHealthy: false,
        responseTime: null,
        database: null,
        server: null
      });
    }
  }, []);

  // Auto-check connection on mount and set up periodic checks
  useEffect(() => {
    checkConnection();
    
    // Set up periodic health checks every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Manual retry function
  const retryConnection = useCallback(() => {
    checkConnection();
  }, [checkConnection]);

  // Get connection status message
  const getStatusMessage = useCallback(() => {
    if (connectionStatus.isLoading) {
      return 'Verificando conexão...';
    }
    
    if (connectionStatus.isConnected) {
      return 'Conectado ao servidor';
    }
    
    if (connectionStatus.error) {
      return connectionStatus.error;
    }
    
    return 'Desconectado';
  }, [connectionStatus]);

  // Get connection status color for UI
  const getStatusColor = useCallback(() => {
    if (connectionStatus.isLoading) {
      return 'yellow';
    }
    
    if (connectionStatus.isConnected) {
      return 'green';
    }
    
    return 'red';
  }, [connectionStatus]);

  // Check if API is ready for requests
  const isApiReady = useCallback(() => {
    return connectionStatus.isConnected && !connectionStatus.isLoading;
  }, [connectionStatus]);

  // Get formatted uptime
  const getFormattedUptime = useCallback(() => {
    if (!apiHealth.server?.uptime) return 'N/A';
    
    const uptime = apiHealth.server.uptime;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  }, [apiHealth]);

  // Get database status info
  const getDatabaseInfo = useCallback(() => {
    if (!apiHealth.database) {
      return {
        status: 'Desconhecido',
        host: 'N/A',
        name: 'N/A'
      };
    }
    
    return {
      status: apiHealth.database.connected ? 'Conectado' : 'Desconectado',
      host: apiHealth.database.host || 'N/A',
      name: apiHealth.database.name || 'N/A'
    };
  }, [apiHealth]);

  return {
    // Connection status
    connectionStatus,
    apiHealth,
    
    // Status checks
    isConnected: connectionStatus.isConnected,
    isLoading: connectionStatus.isLoading,
    hasError: !!connectionStatus.error,
    isApiReady: isApiReady(),
    
    // Actions
    checkConnection,
    retryConnection,
    
    // Utilities
    getStatusMessage,
    getStatusColor,
    getFormattedUptime,
    getDatabaseInfo,
    
    // Response time
    responseTime: apiHealth.responseTime
  };
};

export default useDatabase;