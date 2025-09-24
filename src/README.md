# Frontend Database Integration - Bondegusto Restaurant

## Overview
This frontend application is configured to connect securely to a MongoDB database through a Node.js backend API. The implementation includes proper authentication, connection monitoring, and seamless data management.

## Database Configuration

### Environment Variables
The application uses environment variables for secure configuration:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# Application Settings
REACT_APP_NAME=Bondegusto
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_REVIEWS=true
REACT_APP_ENABLE_MENU_SYNC=true
REACT_APP_ENABLE_ANALYTICS=false

# Security
REACT_APP_ENABLE_HTTPS=false
REACT_APP_CORS_ENABLED=true

# Debug
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=info
```

### API Client Configuration
The `src/config/api.js` file provides:
- Centralized HTTP client with retry logic
- Timeout handling and error management
- Environment-based configuration
- Security headers and CORS support

## Database Services

### Review Service (`src/services/reviewService.js`)
Handles all review-related operations:
- **Fetch Reviews**: Get all reviews with pagination
- **Submit Review**: Add new reviews with validation
- **Review Statistics**: Get rating averages and counts
- **Filter by Rating**: Get reviews by specific rating
- **Submission Eligibility**: Check if user can submit reviews

### Menu Service (`src/services/menuService.js`)
Manages menu data operations:
- **Weekly Menu**: Fetch complete weekly menu
- **Daily Menu**: Get menu for specific days
- **Search Items**: Find menu items by name/description
- **Filter by Category**: Get items by category or dietary restrictions
- **Special Offers**: Fetch promotional items
- **Item Details**: Get detailed information for specific items

## Database Connection Monitoring

### useDatabase Hook (`src/hooks/useDatabase.js`)
Provides real-time connection status:
- **Connection Status**: Monitor API connectivity
- **Health Checks**: Regular backend health monitoring
- **Retry Logic**: Automatic reconnection attempts
- **Status Indicators**: Visual feedback for connection state
- **Error Handling**: Graceful degradation on connection loss

### Connection States
- **Connected**: Green indicator, full functionality
- **Connecting**: Yellow indicator with loading animation
- **Disconnected**: Red indicator with retry option
- **Offline Mode**: Fallback to cached/default data

## Security Features

### Data Validation
- Input sanitization for all user submissions
- XSS protection through proper escaping
- Rate limiting on API calls
- CSRF protection headers

### Authentication
- Secure token-based authentication (ready for implementation)
- Session management
- Role-based access control preparation

### Error Handling
- Comprehensive error catching and logging
- User-friendly error messages
- Fallback data for offline scenarios
- Graceful degradation of features

## Implementation Examples

### Using Review Service
```javascript
import { reviewService } from '../services/reviewService';

// Fetch all reviews
const reviews = await reviewService.getAllReviews();

// Submit a new review
const reviewData = {
  customerName: 'João Silva',
  rating: 5,
  comment: 'Excelente comida!',
  visitDate: new Date()
};
const result = await reviewService.submitReview(reviewData);

// Get review statistics
const stats = await reviewService.getReviewStats();
```

### Using Menu Service
```javascript
import { menuService } from '../services/menuService';

// Get weekly menu
const weeklyMenu = await menuService.getWeeklyMenu();

// Search menu items
const searchResults = await menuService.searchItems('frango');

// Filter by category
const vegetarianItems = await menuService.filterByCategory('vegetariano');
```

### Using Database Hook
```javascript
import { useDatabase } from '../hooks/useDatabase';

function MyComponent() {
  const { 
    isConnected, 
    dbLoading, 
    retryConnection, 
    connectionStatus,
    lastChecked 
  } = useDatabase();

  return (
    <div>
      <div className={`status-indicator ${
        isConnected ? 'connected' : 'disconnected'
      }`}>
        {connectionStatus}
      </div>
      {!isConnected && (
        <button onClick={retryConnection}>
          Reconectar
        </button>
      )}
    </div>
  );
}
```

## Pages with Database Integration

### Reviews Page (`src/pages/Avaliacoes.js`)
- Real-time review loading from database
- Form submission with validation
- Connection status monitoring
- Offline mode with cached data
- Review statistics display

### Menu Page (`src/pages/Cardapio.js`)
- Dynamic menu loading from database
- Weekly menu display with real data
- Search and filter functionality
- Loading states and error handling
- Fallback to default menu when offline

## Performance Optimizations

### Caching Strategy
- Local storage for frequently accessed data
- Session storage for temporary data
- Memory caching for API responses
- Intelligent cache invalidation

### Loading Optimization
- Lazy loading of menu images
- Pagination for large datasets
- Debounced search queries
- Progressive data loading

### Error Recovery
- Automatic retry mechanisms
- Exponential backoff for failed requests
- Circuit breaker pattern for API calls
- Graceful fallback to cached data

## Development Guidelines

### Adding New Database Operations
1. Create service method in appropriate service file
2. Add error handling and validation
3. Implement loading states in components
4. Add fallback data for offline scenarios
5. Update connection monitoring if needed

### Testing Database Integration
1. Test with backend running (connected state)
2. Test with backend stopped (disconnected state)
3. Test with slow network (loading states)
4. Test error scenarios (invalid data, timeouts)
5. Verify fallback data works correctly

### Security Checklist
- [ ] All user inputs are validated and sanitized
- [ ] API endpoints use proper authentication
- [ ] Sensitive data is not logged or exposed
- [ ] HTTPS is enabled in production
- [ ] CORS is properly configured
- [ ] Rate limiting is implemented

## Troubleshooting

### Common Issues
1. **Connection Failed**: Check if backend server is running
2. **CORS Errors**: Verify CORS configuration in backend
3. **Timeout Errors**: Check network connectivity and API timeout settings
4. **Data Not Loading**: Verify API endpoints and data format
5. **Authentication Errors**: Check token validity and permissions

### Debug Mode
Enable debug mode in `.env` to see detailed logs:
```env
REACT_APP_DEBUG_MODE=true
REACT_APP_LOG_LEVEL=debug
```

## Next Steps

### Planned Enhancements
- [ ] Real-time updates with WebSocket integration
- [ ] Advanced caching with service workers
- [ ] Offline-first architecture
- [ ] Push notifications for new menu items
- [ ] Analytics and user behavior tracking
- [ ] Multi-language support for database content
- [ ] Image upload and management
- [ ] Advanced search with filters and sorting

### Production Deployment
- [ ] Configure production API endpoints
- [ ] Set up SSL certificates
- [ ] Implement proper logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CDN for static assets
- [ ] Implement proper backup strategies

## Support

For issues related to database connectivity or data operations, check:
1. Backend server logs
2. Browser network tab for API calls
3. Console logs for JavaScript errors
4. Database connection status in the UI

The application is designed to work seamlessly with the MongoDB backend while providing a robust offline experience when needed.