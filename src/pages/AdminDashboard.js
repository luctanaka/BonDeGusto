import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import MenuManagement from '../components/MenuManagement';
import ReviewManagement from '../components/ReviewManagement';
import GalleryManagement from '../components/GalleryManagement';
import UserManagement from '../components/UserManagement';
import AdminLogin from '../components/AdminLogin';
import adminService from '../services/adminService';

const AdminDashboard = () => {
  const { adminUser, isAuthenticated, logout } = useAdminAuth();
  const [showLogin, setShowLogin] = useState(!isAuthenticated());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authenticated = isAuthenticated();
    if (authenticated) {
      setShowLogin(false);
      loadDashboardStats();
    } else {
      setShowLogin(true);
    }
  }, [adminUser]);

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const dashboardStats = await adminService.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    loadDashboardStats();
  };

  const handleLogout = () => {
    logout();
    setShowLogin(true);
    setStats(null);
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: 'ph-chart-pie' },
    { id: 'menu', name: 'Cardápio', icon: 'ph-fork-knife' },
    { id: 'reviews', name: 'Avaliações', icon: 'ph-star' },
    { id: 'gallery', name: 'Galeria', icon: 'ph-images' },
    { id: 'users', name: 'Usuários', icon: 'ph-users' },
    { id: 'settings', name: 'Configurações', icon: 'ph-gear' }
  ];

  if (showLogin) {
    return (
      <AdminLogin 
        onClose={() => window.history.back()}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="ml-3 px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full">
                Bondegusto
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Olá, <span className="font-medium">{adminUser?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ph ph-sign-out mr-2"></i>
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 mr-8">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-amber-100 text-amber-900 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <i className={`${tab.icon} mr-3 text-lg`}></i>
                      {tab.name}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <DashboardOverview stats={stats} loading={loading} />
            )}
            {activeTab === 'menu' && (
              <MenuManagement />
            )}
            {activeTab === 'reviews' && (
              <ReviewManagement />
            )}
            {activeTab === 'gallery' && (
              <GalleryManagement />
            )}
            {activeTab === 'users' && (
              <UserManagement />
            )}
            {activeTab === 'settings' && (
              <SettingsPanel />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Pratos',
      value: stats?.totalMenuItems || 0,
      icon: 'ph-fork-knife',
      color: 'bg-blue-500'
    },
    {
      title: 'Avaliações Pendentes',
      value: stats?.pendingReviews || 0,
      icon: 'ph-clock',
      color: 'bg-yellow-500'
    },
    {
      title: 'Avaliações Aprovadas',
      value: stats?.approvedReviews || 0,
      icon: 'ph-star',
      color: 'bg-green-500'
    },
    {
      title: 'Imagens na Galeria',
      value: stats?.totalImages || 0,
      icon: 'ph-images',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <i className={`${card.icon} text-white text-xl`}></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="ph ph-plus text-amber-500 text-xl mr-3"></i>
            <span className="font-medium">Adicionar Prato</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="ph ph-eye text-blue-500 text-xl mr-3"></i>
            <span className="font-medium">Revisar Avaliações</span>
          </button>
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <i className="ph ph-upload text-green-500 text-xl mr-3"></i>
            <span className="font-medium">Upload de Imagem</span>
          </button>
        </div>
      </div>
    </div>
  );
};



const SettingsPanel = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-2xl font-bold text-gray-900 mb-4">Configurações</h2>
    <p className="text-gray-600">Painel de configurações em desenvolvimento...</p>
  </div>
);

export default AdminDashboard;