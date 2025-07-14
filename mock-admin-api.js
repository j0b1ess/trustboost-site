// Mock Admin API for Testing
// This file provides test data for the admin dashboard until the backend is ready

class MockAdminAPI {
    constructor() {
        this.mockToken = 'admin_test_token_123';
        this.initMockData();
    }

    initMockData() {
        // Mock users data
        this.mockUsers = [
            {
                id: 'user_001',
                email: 'john.doe@example.com',
                plan: 'Pro',
                status: 'active',
                createdAt: '2024-01-15T10:30:00Z',
                lastPayment: '2024-12-01T00:00:00Z',
                revenue: 79,
                usage: {
                    used: 45,
                    limit: 100
                }
            },
            {
                id: 'user_002',
                email: 'sarah.smith@company.com',
                plan: 'Enterprise',
                status: 'active',
                createdAt: '2024-02-20T14:22:00Z',
                lastPayment: '2024-12-01T00:00:00Z',
                revenue: 179,
                usage: {
                    used: 234,
                    limit: 1000
                }
            },
            {
                id: 'user_003',
                email: 'mike.wilson@startup.io',
                plan: 'Starter',
                status: 'active',
                createdAt: '2024-11-01T09:15:00Z',
                lastPayment: '2024-12-01T00:00:00Z',
                revenue: 29,
                usage: {
                    used: 8,
                    limit: 10
                }
            },
            {
                id: 'user_004',
                email: 'lisa.chen@techcorp.com',
                plan: 'Pro',
                status: 'pending',
                createdAt: '2024-11-28T16:45:00Z',
                lastPayment: null,
                revenue: 0,
                usage: {
                    used: 0,
                    limit: 100
                }
            },
            {
                id: 'user_005',
                email: 'david.brown@agency.net',
                plan: 'Starter',
                status: 'inactive',
                createdAt: '2024-10-10T11:20:00Z',
                lastPayment: '2024-11-01T00:00:00Z',
                revenue: 29,
                usage: {
                    used: 10,
                    limit: 10
                }
            }
        ];

        // Mock dashboard stats
        this.mockStats = {
            totalUsers: this.mockUsers.length,
            activeSubscriptions: this.mockUsers.filter(u => u.status === 'active').length,
            monthlyRevenue: this.mockUsers.reduce((sum, user) => sum + (user.revenue || 0), 0),
            apiCallsToday: 1247
        };
    }

    // Simulate API calls with delays and responses
    async mockLogin(username, password) {
        await this.delay(800); // Simulate network delay
        
        // Simple mock authentication
        if (username === 'admin' && password === 'trustboost2024') {
            return {
                success: true,
                token: this.mockToken
            };
        } else {
            throw new Error('Invalid credentials');
        }
    }

    async mockGetStats(token) {
        await this.delay(500);
        
        if (token !== this.mockToken) {
            throw new Error('Unauthorized');
        }
        
        return this.mockStats;
    }

    async mockGetUsers(token) {
        await this.delay(700);
        
        if (token !== this.mockToken) {
            throw new Error('Unauthorized');
        }
        
        return this.mockUsers;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Override fetch for admin API calls to use mock data
const mockAPI = new MockAdminAPI();

// Store original fetch
const originalFetch = window.fetch;

// Override fetch for admin endpoints
window.fetch = function(url, options = {}) {
    const baseUrl = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api';
    
    // Check if this is an admin API call
    if (url.includes('/admin/')) {
        console.log('MockAdminAPI: Intercepting admin API call:', url);
        
        if (url.includes('/admin/login')) {
            const body = JSON.parse(options.body || '{}');
            return mockAPI.mockLogin(body.username, body.password)
                .then(result => ({
                    ok: true,
                    json: () => Promise.resolve({ token: result.token })
                }))
                .catch(error => ({
                    ok: false,
                    json: () => Promise.resolve({ message: error.message })
                }));
        }
        
        if (url.includes('/admin/stats')) {
            const token = options.headers?.Authorization?.replace('Bearer ', '');
            return mockAPI.mockGetStats(token)
                .then(stats => ({
                    ok: true,
                    json: () => Promise.resolve(stats)
                }))
                .catch(() => ({
                    ok: false,
                    status: 401
                }));
        }
        
        if (url.includes('/admin/users')) {
            const token = options.headers?.Authorization?.replace('Bearer ', '');
            return mockAPI.mockGetUsers(token)
                .then(users => ({
                    ok: true,
                    json: () => Promise.resolve(users)
                }))
                .catch(() => ({
                    ok: false,
                    status: 401
                }));
        }
    }
    
    // For non-admin calls, use original fetch
    return originalFetch.call(this, url, options);
};

console.log('MockAdminAPI: Mock API initialized for testing');
console.log('MockAdminAPI: Use credentials - Username: admin, Password: trustboost2024');
