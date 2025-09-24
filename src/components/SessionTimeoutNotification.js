import React, { useState, useEffect } from 'react';
import { Clock, X } from '@phosphor-icons/react';

const SessionTimeoutNotification = ({ 
  isVisible, 
  onClose, 
  message = 'Sua sessão expirou devido à inatividade. Por favor, faça login novamente para continuar.',
  autoCloseDelay = 3000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Trigger animation
      setIsAnimating(true);
      
      // Auto-close after delay
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300); // Wait for animation to complete
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Notification */}
      <div 
        className={`
          relative bg-white rounded-lg shadow-xl border-l-4 border-amber-500 
          max-w-md w-full mx-auto transform transition-all duration-300 ease-out
          ${
            isAnimating 
              ? 'translate-y-0 opacity-100 scale-100' 
              : '-translate-y-4 opacity-0 scale-95'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-amber-500" weight="fill" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Sessão Expirada
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                handleClose();
                // Redirect to homepage immediately
                window.location.href = '/';
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 border border-transparent rounded-md hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
            >
              Ir para Início
            </button>
          </div>
        </div>

        {/* Progress bar for auto-close */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-amber-500 transition-all ease-linear"
            style={{
              width: isAnimating ? '0%' : '100%',
              transitionDuration: `${autoCloseDelay}ms`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutNotification;