# Bondegusto Restaurant Backend API

## MongoDB Connection Setup

This backend is configured with MongoDB Atlas using Mongoose for optimal performance and connection pooling.

### Features

✅ **MongoDB Atlas Connection**
- Secure connection to MongoDB Atlas cluster
- Connection pooling for optimal performance
- Automatic retry logic and error handling
- Graceful shutdown handling

✅ **Security & Performance**
- Helmet.js for security headers
- CORS configuration for frontend integration
- Rate limiting (100 requests per 15 minutes)
- Request compression
- Input validation and sanitization

✅ **API Endpoints**
- Health check endpoint with database status
- RESTful API structure ready for expansion
- Error handling middleware
- Request logging

### Environment Variables

The following environment variables are configured in `.env`:

```env
# Database
MONGODB_URI=mongodb+srv://Vercel-Admin-Atlas-BomDeGusto:3sO0iKPkvSsivzoE@atlas-bomdegusto.mglbuhf.mongodb.net/?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend Integration
FRONTEND_URL=http://localhost:3001

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Database Models

#### Review Model
- User reviews with rating (1-5 stars)
- Email validation and approval system
- Automatic rating calculations and distributions
- IP tracking for spam prevention

#### Menu Model
- Weekly menu items with categories
- Nutritional information and allergen tracking
- Dietary restrictions (vegetarian, vegan, gluten-free)
- Search functionality and availability status

### API Endpoints

#### Health Check
```
GET /api/health
```
Returns server status, database connection, and system information.

#### Base API
```
GET /api
```
Returns API information and available endpoints.

#### Future Endpoints (Ready for Implementation)
- `GET /api/menu` - Menu items
- `GET /api/reviews` - Customer reviews
- `GET /api/reservations` - Table reservations
- `GET /api/contact` - Contact form submissions

### Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Test the Connection**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Connection Monitoring

The application includes comprehensive connection monitoring:

- **Connection Events**: Logs when connected, disconnected, or errors occur
- **Health Check**: Real-time database status via `/api/health`
- **Graceful Shutdown**: Properly closes database connections on app termination
- **Error Handling**: Detailed error messages for different connection issues

### Performance Optimizations

- **Connection Pooling**: Maximum 10 concurrent connections
- **Timeouts**: 5-second server selection, 45-second socket timeout
- **Indexes**: Optimized database queries with proper indexing
- **Compression**: Gzip compression for API responses
- **Caching**: Ready for Redis integration if needed

### Security Features

- **Helmet.js**: Security headers protection
- **CORS**: Configured for frontend domain
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Mongoose schema validation
- **Error Sanitization**: No sensitive data in error responses

### Development Notes

- The database name is currently set to `test` (default)
- Connection string includes retry writes and majority write concern
- All models include timestamps and virtual fields
- Text search is enabled for menu items
- Review approval system is implemented for content moderation

### Next Steps

1. Implement specific API routes for menu, reviews, and reservations
2. Add authentication middleware for admin functions
3. Set up data seeding for initial menu items
4. Configure production environment variables
5. Add API documentation with Swagger/OpenAPI