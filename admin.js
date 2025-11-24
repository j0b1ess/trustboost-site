// TrustBoost AI Admin Dashboard
// Secure admin interface for monitoring users and system metrics
// 
// PRODUCTION MODE: Connected to Real Backend API
// - All data comes from trustboost-ai-backend-jsyinvest7.replit.app
// - Real authentication and user management
// - Live system monitoring

class AdminDashboard {
    constructor() {
        // Production mode - using real backend API
        this.useMockAPI = false;
        this.apiBaseUrl = 'https://trustboost-ai-backend-jsyinvest7.replit.app/api';
        this.adminToken = null;
        this.refreshInterval = null;
    this.allowedAdmins = ['jyehezkel10@gmail.com']; // Only this email has dashboard access for now
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkStoredToken();
    }

    bindEvents() {
        // Login form submission
        document.getElementById('admin-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Auto-refresh dashboard every 30 seconds
        this.startAutoRefresh();
    }

    checkStoredToken() {
        const storedToken = localStorage.getItem('adminToken');
        if (storedToken) {
            this.adminToken = storedToken;
            this.showDashboard();
            this.loadDashboardData();
        }
    }

    async handleLogin() {
        const username = document.getElementById('admin-username').value.trim().toLowerCase();
        const password = document.getElementById('admin-password').value.trim();
        const loginBtn = document.getElementById('login-btn');
        const errorDiv = document.getElementById('login-error');
        const unauthorizedDiv = document.getElementById('unauthorized-message');

        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }

        // Frontend allowlist check (still rely on backend auth)
        if (!this.allowedAdmins.includes(username)) {
            unauthorizedDiv.style.display = 'block';
            return;
        } else {
            unauthorizedDiv.style.display = 'none';
        }

        // Disable button and show loading
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
        errorDiv.style.display = 'none';

        try {
            // Use real backend API
            const response = await fetch(`${this.apiBaseUrl}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token) {
                    this.adminToken = data.token;
                    localStorage.setItem('adminToken', this.adminToken);
                    
                    this.showDashboard();
                    this.loadDashboardData();
                    
                    console.log('Admin login successful');
                } else {
                    throw new Error('No token received from server');
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            // Reset button
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fa-solid fa-sign-in-alt"></i> Login';
        }
    }

    handleLogout() {
        this.adminToken = null;
        localStorage.removeItem('adminToken');
        this.stopAutoRefresh();
        
        // Show login form
        document.getElementById('admin-login').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
        
        // Clear form
        document.getElementById('admin-login-form').reset();
        document.getElementById('login-error').style.display = 'none';
        
        console.log('Admin logged out');
    }

    showDashboard() {
        document.getElementById('admin-login').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    async loadDashboardData() {
        try {
            // Show loading state
            document.getElementById('users-loading').style.display = 'block';
            document.getElementById('users-list').innerHTML = '';

            // Load dashboard stats and users in parallel
            const [statsData, usersData] = await Promise.all([
                this.fetchDashboardStats(),
                this.fetchUsers()
            ]);

            // Update stats
            if (statsData) {
                this.updateDashboardStats(statsData);
            }

            // Update users table
            if (usersData) {
                this.updateUsersTable(usersData);
            }

            document.getElementById('users-loading').style.display = 'none';
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            document.getElementById('users-loading').innerHTML = 
                '<div style="color: #ef4444;"><i class="fa-solid fa-exclamation-triangle"></i> Failed to load data</div>';
        }
    }

    async fetchDashboardStats() {
        try {
            // Use real backend API
            const response = await fetch(`${this.apiBaseUrl}/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            } else if (response.status === 401) {
                this.handleLogout();
                return null;
            } else {
                throw new Error('Failed to fetch stats');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return null;
        }
    }

    async fetchUsers() {
        try {
            // Use real backend API
            const response = await fetch(`${this.apiBaseUrl}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                return await response.json();
            } else if (response.status === 401) {
                this.handleLogout();
                return null;
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            return null;
        }
    }

    updateDashboardStats(stats) {
        // Update stat cards with animation
        this.animateStatUpdate('total-users', stats.totalUsers || 0);
        this.animateStatUpdate('active-subs', stats.activeSubscriptions || 0);
        this.animateStatUpdate('monthly-revenue', this.formatCurrency(stats.monthlyRevenue || 0));
        this.animateStatUpdate('api-calls', this.formatNumber(stats.apiCallsToday || 0));
    }

    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Simple fade effect
        element.style.opacity = '0.5';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.opacity = '1';
        }, 150);
    }

    updateUsersTable(users) {
        const usersList = document.getElementById('users-list');
        
        if (!users || users.length === 0) {
            usersList.innerHTML = '<div class="loading">No users found</div>';
            return;
        }

        usersList.innerHTML = users.map(user => this.createUserRow(user)).join('');
        // Bind action buttons after rendering
        users.forEach(u => this.bindUserActionButtons(u));
    }

    createUserRow(user) {
        const usagePercentage = user.usage ?
            Math.min((user.usage.used / user.usage.limit) * 100, 100) : 0;

        return `
            <div class="user-row" data-user-id="${this.escapeHtml(user.id || '')}" data-user-email="${this.escapeHtml(user.email || '')}">
                <div>
                    <div style="font-weight: 600;">${this.escapeHtml(user.email || user.id || 'Unknown')}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        ID: ${this.escapeHtml(user.id || 'N/A')}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        Joined: ${this.formatDate(user.createdAt)}
                    </div>
                </div>
                <div>
                    <span class="plan-badge plan-${(user.plan || 'starter').toLowerCase()}">
                        ${this.escapeHtml(user.plan || 'Starter')}
                    </span>
                </div>
                <div>
                    <div class="usage-bar">
                        <div class="usage-fill" style="width: ${usagePercentage}%"></div>
                    </div>
                    <div class="usage-text">
                        ${user.usage ? `${user.usage.used}/${user.usage.limit}` : 'N/A'}
                    </div>
                </div>
                <div>
                    <span class="status-badge status-${(user.status || 'active').toLowerCase()}">
                        ${this.escapeHtml(user.status || 'Active')}
                    </span>
                </div>
                <div>
                    <div style="font-weight: 600;">${this.formatCurrency(user.revenue || 0)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                        Last payment: ${this.formatDate(user.lastPayment)}
                    </div>
                </div>
                <div class="actions-cell">
                    <button class="action-btn plan-starter" data-action="plan" data-plan="Starter">Starter</button>
                    <button class="action-btn plan-pro" data-action="plan" data-plan="Pro">Pro</button>
                    <button class="action-btn plan-enterprise" data-action="plan" data-plan="Enterprise">Ent</button>
                    <button class="action-btn reset-btn" data-action="reset" title="Reset usage"><i class="fa-solid fa-rotate-left"></i></button>
                </div>
            </div>
        `;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatNumber(num) {
        return new Intl.NumberFormat('en-US').format(num);
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'Invalid Date';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    startAutoRefresh() {
        // Refresh every 30 seconds
        this.refreshInterval = setInterval(() => {
            if (this.adminToken && document.getElementById('admin-dashboard').style.display !== 'none') {
                this.loadDashboardData();
            }
        }, 30000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    // ===== User Action Methods =====
    bindUserActionButtons(user) {
        const row = document.querySelector(`.user-row[data-user-id="${CSS.escape(user.id || '')}"]`);
        if (!row) return;
        row.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                if (action === 'plan') {
                    const newPlan = btn.getAttribute('data-plan');
                    this.updateUserPlan(user, newPlan, btn);
                } else if (action === 'reset') {
                    this.resetUserUsage(user, btn);
                }
            });
        });
    }

    async updateUserPlan(user, newPlan, buttonEl) {
        if (!confirm(`Change plan for ${user.email || user.id} to ${newPlan}?`)) return;
        const originalText = buttonEl.textContent;
        buttonEl.disabled = true;
        buttonEl.textContent = '...';
        try {
            const resp = await fetch(`${this.apiBaseUrl}/admin/update-plan`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id, plan: newPlan })
            });
            if (!resp.ok) throw new Error('Failed to update plan');
            await this.loadDashboardData();
        } catch(err) {
            alert(err.message || 'Error updating plan');
        } finally {
            buttonEl.disabled = false;
            buttonEl.textContent = originalText;
        }
    }

    async resetUserUsage(user, buttonEl) {
        if (!confirm(`Reset usage for ${user.email || user.id}?`)) return;
        const originalHTML = buttonEl.innerHTML;
        buttonEl.disabled = true;
        buttonEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            const resp = await fetch(`${this.apiBaseUrl}/admin/reset-usage`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id })
            });
            if (!resp.ok) throw new Error('Failed to reset usage');
            await this.loadDashboardData();
        } catch(err) {
            alert(err.message || 'Error resetting usage');
        } finally {
            buttonEl.disabled = false;
            buttonEl.innerHTML = originalHTML;
        }
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('TrustBoost AI Admin Dashboard: Initializing...');
    new AdminDashboard();
    console.log('TrustBoost AI Admin Dashboard: Initialized successfully');
});
