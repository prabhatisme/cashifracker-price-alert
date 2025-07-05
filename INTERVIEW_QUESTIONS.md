
# 💰 CashiFracker - Technical Interview Questions

This document contains medium to hard technical interview questions related to the CashiFracker project. These questions cover various aspects of the application including architecture, security, performance, and implementation details.

## 🏗️ Architecture & Design Questions

### Question 1: System Architecture
**Q:** Explain the overall architecture of CashiFracker. How do the different components (frontend, backend, database, cron jobs) interact with each other?

**Expected Answer:** 
- Frontend: React + TypeScript with Vite build tool
- Backend: Supabase (Auth, Database, Edge Functions)
- Database: PostgreSQL with Row Level Security
- Cron Jobs: Automated price monitoring via Edge Functions
- Real-time updates: Supabase real-time subscriptions
- Email service: Resend API for notifications

### Question 2: Database Schema Design
**Q:** Walk me through the database schema. Why did you choose this particular design for `tracked_products` and `price_history` tables?

**Expected Answer:**
- `tracked_products`: Stores user's tracked items with current state
- `price_history`: Separate table for historical data to avoid bloating main table
- Foreign key relationship for data integrity
- JSONB for flexible product metadata storage
- Separate tables allow for efficient queries and data retention policies

### Question 3: Scalability Considerations
**Q:** How would you scale this application to handle 100,000+ users tracking millions of products?

**Expected Answer:**
- Database indexing on frequently queried columns
- Implement caching layer (Redis)
- Database sharding/partitioning for price_history
- Rate limiting for API endpoints
- CDN for static assets
- Background job queues for price monitoring
- Database connection pooling

## 🔒 Security Questions

### Question 4: Row Level Security Implementation
**Q:** Explain how Row Level Security (RLS) is implemented in this project. What are the potential security vulnerabilities if RLS policies are misconfigured?

**Expected Answer:**
- RLS policies ensure users only access their own data
- Policies use `auth.uid()` to filter records by user_id
- Vulnerabilities: Data leakage between users, privilege escalation
- Service role key bypasses RLS for system operations
- Need proper testing of RLS policies

### Question 5: API Security
**Q:** What security measures are in place for the Edge Functions? How do you prevent unauthorized access and abuse?

**Expected Answer:**
- Authentication required for user-specific operations
- CORS headers properly configured
- Input validation and sanitization
- Rate limiting (should be implemented)
- API key management via Supabase secrets
- Error handling without information disclosure

### Question 6: Web Scraping Security
**Q:** What are the potential security risks with web scraping Cashify, and how would you mitigate them?

**Expected Answer:**
- IP blocking/rate limiting from target site
- User-Agent rotation and request throttling
- Legal compliance with robots.txt and ToS
- Proxy rotation for distributed scraping
- Captcha handling mechanisms
- Error handling for blocked requests

## 📊 Performance & Optimization Questions

### Question 7: Price Monitoring Optimization
**Q:** The current price monitoring runs every hour for all products. How would you optimize this for better performance and cost efficiency?

**Expected Answer:**
- Intelligent scheduling based on price volatility
- Batch processing with connection pooling
- Implement exponential backoff for failed requests
- Priority queues for high-value products
- Caching mechanisms for recently checked products
- Database query optimization with proper indexing

### Question 8: Frontend Performance
**Q:** How would you optimize the frontend performance when displaying thousands of tracked products?

**Expected Answer:**
- Virtual scrolling/pagination for large lists
- Memoization of expensive calculations
- Lazy loading of product images
- Debounced search functionality
- Code splitting and bundle optimization
- Service workers for offline functionality

## 🔧 Implementation Details Questions

### Question 9: Real-time Updates Implementation
**Q:** Explain how real-time price updates work in the application. What are the limitations of the current approach?

**Expected Answer:**
- Supabase real-time subscriptions on `tracked_products` table
- WebSocket connections for live updates
- Limitations: Connection limits, battery drain on mobile
- Alternative: Server-sent events or periodic polling
- Consider implementing WebSocket reconnection logic

### Question 10: Error Handling Strategy
**Q:** How would you implement comprehensive error handling across the application, especially for the price monitoring system?

**Expected Answer:**
- Centralized error logging system
- Retry mechanisms with exponential backoff
- Circuit breaker pattern for external APIs
- User-friendly error messages
- Monitoring and alerting for system failures
- Graceful degradation when services are unavailable

### Question 11: Data Consistency
**Q:** How do you ensure data consistency between price updates and user notifications? What happens if the email service fails?

**Expected Answer:**
- Database transactions for atomic operations
- Implement event sourcing or outbox pattern
- Retry queues for failed email notifications
- Idempotency keys for duplicate prevention
- Compensation patterns for rollback scenarios
- Audit logging for debugging

## 🚀 Advanced Technical Questions

### Question 12: Microservices Migration
**Q:** If you were to migrate this monolithic Edge Function approach to microservices, how would you structure it?

**Expected Answer:**
- Product scraping service
- Price monitoring service
- Notification service
- User management service
- API gateway for routing
- Message queues for service communication
- Distributed tracing and monitoring

### Question 13: Machine Learning Integration
**Q:** How would you implement price prediction features using historical data?

**Expected Answer:**
- Time series analysis using ARIMA/LSTM models
- Feature engineering from price history
- Model training pipeline with MLOps
- A/B testing for model performance
- Real-time inference API
- Model versioning and rollback strategies

### Question 14: Testing Strategy
**Q:** Design a comprehensive testing strategy for this application, including the Edge Functions.

**Expected Answer:**
- Unit tests for business logic
- Integration tests for database operations
- End-to-end tests for user workflows
- Mock external APIs for consistent testing
- Load testing for price monitoring system
- Security testing for RLS policies
- Edge Function testing with local Supabase

## 🔍 Debugging & Troubleshooting Questions

### Question 15: Production Debugging
**Q:** A user reports that they're not receiving price alerts despite prices dropping below their threshold. How would you debug this issue?

**Expected Answer:**
- Check Edge Function logs for errors
- Verify RLS policies for data access
- Validate email service configuration
- Check cron job execution history
- Inspect price history data accuracy
- Test notification system manually
- Monitor database query performance

### Question 16: Performance Bottleneck Investigation
**Q:** Users are reporting slow loading times for the dashboard. Walk me through your investigation process.

**Expected Answer:**
- Browser DevTools performance analysis
- Database query performance monitoring
- Network request waterfall analysis
- Memory usage profiling
- Bundle size analysis
- CDN cache hit rates
- Database connection pool status

## 📝 Code Review Questions

### Question 17: Code Quality Assessment
**Q:** Looking at the `useTrackedProducts` hook, what improvements would you suggest for better maintainability and performance?

**Expected Answer:**
- Split into smaller, focused hooks
- Implement proper error boundaries
- Add TypeScript strict mode compliance
- Optimize re-renders with useMemo/useCallback
- Implement proper loading states
- Add comprehensive error handling
- Consider using React Query for better caching

### Question 18: Security Code Review
**Q:** Review the Edge Function code and identify potential security vulnerabilities.

**Expected Answer:**
- Input validation on product URLs
- Rate limiting implementation needed
- Error message information disclosure
- User-Agent rotation for scraping
- Proper secret management validation
- CORS configuration review
- SQL injection prevention (though using ORM)

---

## 💡 Bonus Questions

### Question 19: Business Logic Extension
**Q:** How would you extend the system to support multiple e-commerce platforms beyond Cashify?

**Expected Answer:**
- Abstract scraping logic with strategy pattern
- Platform-specific adapters
- Unified product data model
- Configuration-driven scraping rules
- Platform detection from URLs
- Separate rate limiting per platform

### Question 20: Disaster Recovery
**Q:** Design a disaster recovery plan for the CashiFracker application.

**Expected Answer:**
- Database backup and point-in-time recovery
- Multi-region deployment strategy
- Data replication across regions
- Automated failover mechanisms
- Monitoring and alerting systems
- Recovery time objectives (RTO/RPO)
- Regular disaster recovery testing

---

*These questions are designed to assess deep understanding of the CashiFracker project and general software engineering principles. Candidates should demonstrate both theoretical knowledge and practical problem-solving skills.*
