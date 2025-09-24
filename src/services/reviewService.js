import apiClient from '../config/api';

// Review Service for handling review-related API calls
class ReviewService {
  
  // Get all approved reviews
  async getReviews(params = {}) {
    try {
      const defaultParams = {
        approved: true,
        limit: 50,
        sort: '-createdAt',
        ...params
      };
      
      return await apiClient.get('/reviews', defaultParams);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw new Error('Falha ao carregar avaliações. Tente novamente.');
    }
  }

  // Submit a new review
  async submitReview(reviewData) {
    try {
      // Validate required fields
      const requiredFields = ['name', 'email', 'rating', 'comment'];
      for (const field of requiredFields) {
        if (!reviewData[field]) {
          throw new Error(`Campo obrigatório: ${field}`);
        }
      }

      // Validate rating range
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('A avaliação deve estar entre 1 e 5 estrelas.');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reviewData.email)) {
        throw new Error('Por favor, insira um email válido.');
      }

      // Sanitize and prepare data
      const sanitizedData = {
        name: reviewData.name.trim(),
        email: reviewData.email.trim().toLowerCase(),
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment.trim()
      };

      const response = await apiClient.post('/reviews', sanitizedData);
      return {
        success: true,
        message: 'Avaliação enviada com sucesso! Será analisada antes da publicação.',
        data: response
      };
    } catch (error) {
      console.error('Error submitting review:', error);
      return {
        success: false,
        message: error.message || 'Erro ao enviar avaliação. Tente novamente.'
      };
    }
  }

  // Get review statistics
  async getReviewStats() {
    try {
      return await apiClient.get('/reviews/stats');
    } catch (error) {
      console.error('Error fetching review stats:', error);
      // Return default stats if API fails
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: [
          { rating: 5, count: 0 },
          { rating: 4, count: 0 },
          { rating: 3, count: 0 },
          { rating: 2, count: 0 },
          { rating: 1, count: 0 }
        ]
      };
    }
  }

  // Get reviews by rating
  async getReviewsByRating(rating) {
    try {
      return await apiClient.get('/reviews', { rating, approved: true });
    } catch (error) {
      console.error('Error fetching reviews by rating:', error);
      throw new Error('Falha ao carregar avaliações por classificação.');
    }
  }

  // Check if user can submit review (rate limiting)
  async canSubmitReview(email) {
    try {
      const response = await apiClient.get('/reviews/can-submit', { email });
      return response.canSubmit;
    } catch (error) {
      console.error('Error checking review submission eligibility:', error);
      // Allow submission if check fails
      return true;
    }
  }
}

// Create singleton instance
const reviewService = new ReviewService();

export default reviewService;
export { ReviewService };