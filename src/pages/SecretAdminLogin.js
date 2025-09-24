import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import AdminLogin from '../components/AdminLogin';

const SecretAdminLogin = () => {
  const { adminUser, login } = useAdminAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [accessAttempts, setAccessAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    if (adminUser) {
      // Redirect to root path to show main navigation with admin privileges
      window.location.href = '/';
      return;
    }

    // Security: Log access attempt
    const logAccess = () => {
      const timestamp = new Date().toISOString();
      const userAgent = navigator.userAgent;
      const ip = 'client-side'; // Would be logged server-side in production
      
      console.warn(`[SECURITY] Admin login page accessed at ${timestamp}`);
      console.warn(`[SECURITY] User Agent: ${userAgent}`);
      
      // Track access attempts in session storage
      const attempts = parseInt(sessionStorage.getItem('adminAccessAttempts') || '0') + 1;
      sessionStorage.setItem('adminAccessAttempts', attempts.toString());
      setAccessAttempts(attempts);
      
      // Block after 3 attempts in same session
      if (attempts > 3) {
        setIsBlocked(true);
        setShowLogin(false);
      }
    };

    logAccess();
  }, [adminUser]);

  const handleLoginSuccess = () => {
    // Clear access attempts on successful login
    sessionStorage.removeItem('adminAccessAttempts');
    // Redirect to root path to show main navigation with admin privileges
    window.location.href = '/';
  };

  const handleClose = () => {
    // Redirect to home page
    window.location.href = '/';
  };

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 border border-red-700 rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-red-400 mb-4">
            <i className="ph ph-shield-warning text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-red-100 mb-4">Acesso Bloqueado</h2>
          <p className="text-red-200 mb-6">
            Muitas tentativas de acesso detectadas. Por motivos de segurança, o acesso foi temporariamente bloqueado.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-red-700 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!showLogin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 max-w-md w-full text-center">
          <div className="text-gray-400 mb-4">
            <i className="ph ph-warning text-6xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-100 mb-4">Acesso Negado</h2>
          <p className="text-gray-300 mb-6">
            Esta página é restrita a administradores autorizados.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Security Warning */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-6 text-center">
          <div className="text-amber-400 mb-2">
            <i className="ph ph-shield-check text-2xl"></i>
          </div>
          <p className="text-amber-200 text-sm">
            <strong>Área Restrita</strong><br />
            Acesso monitorado e registrado
          </p>
          <p className="text-amber-300/70 text-xs mt-2">
            Tentativas: {accessAttempts}/3
          </p>
        </div>

        {/* Admin Login Component */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <AdminLogin 
            onClose={handleClose}
            onLoginSuccess={handleLoginSuccess}
          />
        </div>

        {/* Footer Warning */}
        <div className="text-center mt-6 text-gray-400 text-xs">
          <i className="ph ph-warning-circle mr-1"></i>
          Acesso não autorizado é crime - Lei 12.737/2012
        </div>
      </div>
    </div>
  );
};

export default SecretAdminLogin;