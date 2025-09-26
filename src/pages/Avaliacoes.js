import React, { useState } from 'react';
import { WifiX, CheckCircle } from '@phosphor-icons/react';
import reviewService from '../services/reviewService';
import useDatabase from '../hooks/useDatabase';
import { useAuth } from '../hooks/useAuth';
import LoginModal from '../components/LoginModal';

const Avaliacoes = () => {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    turno: '',
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Authentication hook
  const { currentUser } = useAuth();
  
  // Database connection hook
  const { isConnected, isLoading: dbLoading, getStatusMessage, retryConnection } = useDatabase();

  const handleStarClick = (rating) => {
    setUserRating(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    
    if (userRating === 0) {
      setSubmitStatus('error');
      return;
    }
    
    if (!reviewForm.name || !reviewForm.turno || !reviewForm.comment) {
      setSubmitStatus('error');
      return;
    }
    
    if (!isConnected) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const reviewData = {
        name: reviewForm.name,
        turno: reviewForm.turno,
        comment: reviewForm.comment,
        rating: userRating,
        unit: currentUser.unit._id // Include user's unit
      };
      
      const result = await reviewService.submitReview(reviewData);
      
      if (result.success) {
        setSubmitStatus('success');
        
        // Reset form on success
        setReviewForm({ name: '', turno: '', comment: '' });
        setUserRating(0);
        
        // Reviews would be reloaded here in a full implementation
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };



  const renderStars = (rating, interactive = false, size = 'text-xl') => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => handleStarClick(star) : undefined}
            onMouseEnter={interactive ? () => handleStarHover(star) : undefined}
            onMouseLeave={interactive ? handleStarLeave : undefined}
            className={`${size} ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${
              star <= (interactive ? (hoverRating || userRating) : rating)
                ? 'text-yellow-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
            disabled={!interactive}
          >
            <i className="ph-fill ph-star"></i>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Database Connection Status */}
      <div className="mb-6">
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          isConnected ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' : 
          dbLoading ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' : 
          'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
        }`}>
          {isConnected ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : dbLoading ? (
            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent"></div>
          ) : (
            <WifiX className="w-5 h-5 mr-2" />
          )}
          <span className="text-sm font-medium">{getStatusMessage()}</span>
          {!isConnected && !dbLoading && (
            <button
              onClick={retryConnection}
              className="ml-3 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
          Avaliações
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          Compartilhe sua experiência conosco
        </p>
      </div>

      {currentUser && (
        <div className="max-w-2xl mx-auto">
          {/* Review Form */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                Deixe sua Avaliação
              </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="reviewName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  id="reviewName"
                  name="name"
                  value={reviewForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="Digite seu nome"
                />
              </div>

              {/* Turno */}
              <div>
                <label htmlFor="reviewTurno" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Turno *
                </label>
                <select
                  id="reviewTurno"
                  name="turno"
                  value={reviewForm.turno}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Selecione o turno</option>
                  <option value="Manhã">Manhã</option>
                  <option value="Diurno">Diurno</option>
                  <option value="Noturno">Noturno</option>
                </select>
              </div>

              {/* Rating Stars */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Sua Avaliação *
                </label>
                {renderStars(userRating, true, 'text-3xl')}
                {userRating > 0 && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Você avaliou com {userRating} estrela{userRating > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="reviewComment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Comentário *
                </label>
                <textarea
                  id="reviewComment"
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                  placeholder="Conte-nos sobre sua experiência..."
                ></textarea>
              </div>
              
              {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <i className="ph ph-check-circle text-lg mr-2"></i>
                    <span>Avaliação enviada com sucesso! Obrigado pelo seu feedback.</span>
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <i className="ph ph-warning-circle text-lg mr-2"></i>
                    <span>Por favor, selecione uma avaliação e preencha todos os campos.</span>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting || !isConnected}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}</span>
                {isSubmitting ? (
                  <i className="ph ph-spinner-gap text-lg ml-2 animate-spin"></i>
                ) : (
                  <i className="ph ph-paper-plane-tilt text-lg ml-2"></i>
                )}
              </button>
            </form>
        </div>
      </div>
      )}
      
      {/* Modal de Login */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  );
};

export default Avaliacoes;