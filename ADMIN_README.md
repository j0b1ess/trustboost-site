# TrustBoost AI Admin Dashboard

A secure admin interface for monitoring users, subscriptions, and system metrics.

## � **PRODUCTION STATUS: LIVE**

The admin dashboard is now **LIVE** and connected to the real backend API at `trustboost-ai-backend-jsyinvest7.replit.app`.

## Current Implementation Status

🟢 **Frontend Complete**: Fully functional admin dashboard
� **Backend Integration**: Connected to live backend API
� **Production Ready**: Fully operational with real data

### Live System
The dashboard is currently running in **production mode**:
- Real backend API calls to `trustboost-ai-backend-jsyinvest7.replit.app`
- Live user data and statistics
- Production authentication system

## Features

### 🔐 **Secure Authentication**
- Admin login with username/password protection
- Session token management with localStorage
- Auto-logout on token expiration

### 📊 **Dashboard Overview**
- **Total Users**: Count of all registered users
- **Active Subscriptions**: Number of active paying customers
- **Monthly Revenue**: Total revenue for the current month
- **API Calls Today**: Number of API requests processed today

### 👥 **User Management**
- Comprehensive user list with detailed information
- User email, ID, and registration date
- Current subscription plan (Starter/Pro/Enterprise)
- Usage statistics with visual progress bars
- Payment status and revenue tracking
- Account status monitoring (Active/Inactive/Pending)

### 🎨 **Modern UI/UX**
- Responsive design for desktop and mobile
- Dark/light theme support
- Real-time data updates every 30 seconds
- Loading states and error handling
- Smooth animations and transitions

## Files Structure

```
admin.html          # Main admin dashboard page
admin.js           # Dashboard JavaScript functionality
```

### Accessing the Dashboard
1. Navigate to `/admin.html`
2. Enter admin credentials (provided by backend system)
3. View live dashboard metrics and user data
4. Data refreshes automatically every 30 seconds

## Required Backend API Endpoints

The admin dashboard expects these endpoints to be implemented:

### POST `/api/admin/login`
**Request:**
```json
{
  "username": "admin_username",
  "password": "admin_password"
}
```
**Response:**
```json
{
  "token": "jwt_admin_token_here"
}
```

### GET `/api/admin/stats`
**Headers:** `Authorization: Bearer {admin_token}`
**Response:**
```json
{
  "totalUsers": 150,
  "activeSubscriptions": 89,
  "monthlyRevenue": 12450,
  "apiCallsToday": 2847
}
```

### GET `/api/admin/users`
**Headers:** `Authorization: Bearer {admin_token}`
**Response:**
```json
[
  {
    "id": "user_001",
    "email": "user@example.com",
    "plan": "Pro",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z",
    "lastPayment": "2024-12-01T00:00:00Z",
    "revenue": 79,
    "usage": {
      "used": 45,
      "limit": 100
    }
  }
]
```

## Security Features

- **Token-based authentication** with secure storage
- **Input sanitization** to prevent XSS attacks
- **Session management** with auto-logout
- **HTTPS-only** cookie handling (in production)
- **Access control** with admin-only routes

## Responsive Design

The dashboard is fully responsive and works on:
- ✅ Desktop computers (1200px+)
- ✅ Tablets (768px - 1199px)
- ✅ Mobile phones (320px - 767px)

## Theme Support

- **Light Mode**: Default clean interface
- **Dark Mode**: Automatic detection from main site preference
- **Consistent Styling**: Matches TrustBoost AI brand colors

## Performance

- **Lazy Loading**: Users data loads on demand
- **Auto Refresh**: 30-second intervals for real-time updates
- **Efficient Rendering**: Optimized DOM updates
- **Caching**: Session tokens stored locally

## Production Deployment

1. **Remove Mock API**: Delete `mock-admin-api.js` include
2. **Configure Backend**: Ensure all API endpoints are implemented
3. **Set Admin Credentials**: Configure secure admin authentication
4. **Enable HTTPS**: Ensure all API calls use secure connections
5. **Environment Variables**: Use secure token storage

## Customization

### Adding New Metrics
1. Update the stats API response
2. Add new stat cards in `admin.html`
3. Update `updateDashboardStats()` in `admin.js`

### Modifying User Display
1. Update the user data structure
2. Modify `createUserRow()` function
3. Adjust CSS classes for styling

### Security Configuration
1. Update authentication endpoint
2. Modify token validation logic
3. Configure session timeout settings

## Browser Support

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Dependencies

- **Font Awesome 6.4.0**: Icons and symbols
- **Native JavaScript**: No external frameworks
- **CSS Grid & Flexbox**: Modern layout techniques
- **Fetch API**: HTTP requests
