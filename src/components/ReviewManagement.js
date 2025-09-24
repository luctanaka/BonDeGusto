import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      const reviewsData = await adminService.getReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      // Show the specific error message from the service
      showToast(error.message || 'Erro ao carregar avaliações', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      await adminService.updateReviewStatus(reviewId, newStatus);
      setReviews(prev => prev.map(review => 
        review._id === reviewId ? { ...review, status: newStatus } : review
      ));
      showToast(`Avaliação ${newStatus === 'approved' ? 'aprovada' : 'rejeitada'} com sucesso!`, 'success');
    } catch (error) {
      console.error('Error updating review status:', error);
      showToast('Erro ao atualizar status da avaliação', 'error');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      return;
    }
    
    try {
      await adminService.deleteReview(reviewId);
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      showToast('Avaliação excluída com sucesso!', 'success');
    } catch (error) {
      console.error('Error deleting review:', error);
      showToast('Erro ao excluir avaliação', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    const icon = type === 'success' ? 'ph-check-circle' : 'ph-x-circle';
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform`;
    toast.innerHTML = `
      <div class="flex items-center">
        <i class="ph ${icon} text-lg mr-2"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.status === filter;
    const matchesSearch = review.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comentario.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprovada';
      case 'rejected': return 'Rejeitada';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <i
        key={i}
        className={`ph ${i < rating ? 'ph-star-fill text-yellow-400' : 'ph-star text-gray-300'}`}
      />
    ));
  };

  const getAverageRating = () => {
    const approvedReviews = reviews.filter(r => r.status === 'approved');
    if (approvedReviews.length === 0) return 0;
    const sum = approvedReviews.reduce((acc, review) => acc + review.avaliacao, 0);
    return (sum / approvedReviews.length).toFixed(1);
  };

  const getReviewStats = () => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.status === 'approved').length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;
    
    return { total, approved, pending, rejected };
  };

  const stats = getReviewStats();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciamento de Avaliações</h2>
            <p className="text-gray-600 mt-1">Gerencie as avaliações dos clientes</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-amber-600">{getAverageRating()}</div>
            <div className="flex items-center justify-end">
              {renderStars(Math.round(getAverageRating()))}
            </div>
            <div className="text-sm text-gray-600 mt-1">Média geral</div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-800">Total</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-sm text-green-800">Aprovadas</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-yellow-800">Pendentes</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-red-800">Rejeitadas</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por nome ou comentário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'pending', label: 'Pendentes' },
              { value: 'approved', label: 'Aprovadas' },
              { value: 'rejected', label: 'Rejeitadas' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === option.value
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map(review => (
          <div key={review._id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{review.nome}</h3>
                    <div className="flex items-center">
                      {renderStars(review.avaliacao)}
                      <span className="ml-2 text-sm text-gray-600">({review.avaliacao}/5)</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                    {getStatusText(review.status)}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{review.comentario}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Local: {review.local}</span>
                  <span>{new Date(review.data).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedReview(review);
                  setShowModal(true);
                }}
                className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Ver detalhes"
              >
                <i className="ph ph-eye mr-1"></i>
                Detalhes
              </button>
              
              {review.status !== 'approved' && (
                <button
                  onClick={() => handleStatusChange(review._id, 'approved')}
                  className="px-3 py-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Aprovar"
                >
                  <i className="ph ph-check mr-1"></i>
                  Aprovar
                </button>
              )}
              
              {review.status !== 'rejected' && (
                <button
                  onClick={() => handleStatusChange(review._id, 'rejected')}
                  className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Rejeitar"
                >
                  <i className="ph ph-x mr-1"></i>
                  Rejeitar
                </button>
              )}
              
              <button
                onClick={() => handleDelete(review._id)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Excluir"
              >
                <i className="ph ph-trash mr-1"></i>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <i className="ph ph-chat-circle text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filter !== 'all' ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação ainda'}
          </h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'Tente ajustar os filtros de busca.'
              : 'As avaliações dos clientes aparecerão aqui.'}
          </p>
        </div>
      )}

      {/* Review Detail Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalhes da Avaliação</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ph ph-x text-2xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <p className="text-gray-900">{selectedReview.nome}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                    <p className="text-gray-900">{selectedReview.local}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação</label>
                  <div className="flex items-center">
                    {renderStars(selectedReview.avaliacao)}
                    <span className="ml-2 text-gray-600">({selectedReview.avaliacao}/5)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comentário</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedReview.comentario}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReview.status)}`}>
                      {getStatusText(selectedReview.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                    <p className="text-gray-900">{new Date(selectedReview.data).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                {selectedReview.status !== 'approved' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedReview._id, 'approved');
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Aprovar
                  </button>
                )}
                
                {selectedReview.status !== 'rejected' && (
                  <button
                    onClick={() => {
                      handleStatusChange(selectedReview._id, 'rejected');
                      setShowModal(false);
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Rejeitar
                  </button>
                )}
                
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;