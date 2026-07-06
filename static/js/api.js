/**
 * MLSTAT 2026 API 客户端
 */

// 自动检测 Hugo basePath（无需覆盖 head.html）
(function() {
    if (window.HUGO_CONFIG) return;
    const scripts = document.getElementsByTagName('script');
    for (let s of scripts) {
        if (s.src && s.src.includes('/js/api.js')) {
            const url = new URL(s.src);
            window.HUGO_CONFIG = {
                basePath: url.pathname.replace(/js\/api\.js.*$/, '')
            };
            break;
        }
    }
})();

// 根据环境自动选择 API 地址
function resolveApiBase() {
    if (window.location.hostname === 'ml-stat.github.io') {
        return 'https://api.mlstat.top';
    }
    if (window.location.port === '1320') {
        return '';
    }
    return 'http://127.0.0.1:5001';
}

const API_BASE = resolveApiBase();

// 防止多个并发 401 响应触发重复跳转
let _redirectingToLogin = false;

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('mlstat_token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('mlstat_token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('mlstat_token');
        localStorage.removeItem('mlstat_user');
    }

    getUser() {
        try {
            const user = localStorage.getItem('mlstat_user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            console.error('解析用户数据失败:', e);
            this.clearToken();
            return null;
        }
    }

    setUser(user) {
        localStorage.setItem('mlstat_user', JSON.stringify(user));
    }

    isLoggedIn() {
        return !!this.token;
    }

    getApiBase() {
        return API_BASE;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const headers = {
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers
            });
        } catch (e) {
            throw new Error('网络连接失败，请检查您的网络');
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error('服务器返回了无效的响应');
        }

        if (!response.ok) {
            // token 过期或无效，自动退出登录
            if (response.status === 401 && this.token) {
                this.clearToken();
                // 避免在登录页面重复跳转；使用全局标志防止并发 401 触发多次重定向
                if (!_redirectingToLogin && !window.location.pathname.includes('/login')) {
                    _redirectingToLogin = true;
                    showMessage('登录已过期，请重新登录\nSession expired, please login again', 'warning');
                    setTimeout(() => {
                        _redirectingToLogin = false;
                        window.location.href = (window.HUGO_CONFIG?.basePath || '/') + 'login/';
                    }, 1000);
                }
                // 标记为已处理的 401，调用方无需再弹提示
                const err = new Error('SESSION_EXPIRED');
                err.handled = true;
                throw err;
            }
            throw new Error(data.error || '请求失败');
        }

        return data;
    }

    // ========== 认证 ==========

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(email, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setToken(data.token);
        this.setUser(data.user);
        return data;
    }

    logout() {
        this.clearToken();
    }

    async verifyEmail(token) {
        return this.request(`/auth/verify/${token}`, {
            method: 'POST'
        });
    }

    async forgotPassword(email) {
        return this.request('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(token, password) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, password })
        });
    }

    async resendVerification(email) {
        return this.request('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    // ========== 用户 ==========

    async getProfile() {
        return this.request('/users/profile');
    }

    async updateProfile(data) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async changePassword(oldPassword, newPassword) {
        return this.request('/users/password', {
            method: 'PUT',
            body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
        });
    }

    async getDashboard() {
        return this.request('/users/dashboard');
    }

    // ========== 会议注册 ==========

    async getConferenceInfo() {
        return this.request('/conference/info');
    }

    async createRegistration(data) {
        // 支持 FormData（学生上传学生证）或普通对象
        if (data instanceof FormData) {
            return this.request('/conference/register', {
                method: 'POST',
                body: data,
                headers: {}
            });
        }
        return this.request('/conference/register', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async getRegistration() {
        return this.request('/conference/register');
    }

    async updateRegistration(data) {
        return this.request('/conference/register', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async getTutorialChoice() {
        return this.request('/conference/tutorial');
    }

    async updateTutorialChoice(attendTutorial) {
        return this.request('/conference/tutorial', {
            method: 'PUT',
            body: JSON.stringify({ attend_tutorial: attendTutorial })
        });
    }

    async submitPayment() {
        return this.request('/conference/payment/submit', {
            method: 'POST'
        });
    }

    async getPaymentStatus() {
        return this.request('/conference/payment/status');
    }

    // ========== 海报 ==========

    async createPoster(formData) {
        return this.request('/posters/', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async getPosters() {
        return this.request('/posters/');
    }

    async getPoster(id) {
        return this.request(`/posters/${id}`);
    }

    async updatePoster(id, formData) {
        return this.request(`/posters/${id}`, {
            method: 'PUT',
            body: formData,
            headers: {}
        });
    }

    async deletePoster(id) {
        return this.request(`/posters/${id}`, {
            method: 'DELETE'
        });
    }

    // ========== 文档 ==========

    async getDocuments() {
        return this.request('/documents/');
    }

    getDocumentDownloadUrl(docId) {
        return `${API_BASE}/documents/${docId}/download?token=${this.token}`;
    }

    getPosterDownloadUrl(posterId) {
        return `${API_BASE}/posters/${posterId}/download?token=${this.token}`;
    }

    getStudentIdDownloadUrl() {
        return `${API_BASE}/conference/student-id/download?token=${this.token}`;
    }

    async updateStudentId(formData) {
        return this.request('/conference/student-id', {
            method: 'PUT',
            body: formData,
            headers: {}
        });
    }

    // ========== 管理员 ==========

    async adminGetUsers(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/admin/users?${query}`);
    }

    async adminGetRegistrations(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/admin/registrations?${query}`);
    }

    async adminConfirmPayment(regId, note = '') {
        return this.request(`/admin/payments/${regId}/confirm`, {
            method: 'POST',
            body: JSON.stringify({ note })
        });
    }

    async adminGetPosters(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/admin/posters?${query}`);
    }

    async adminReviewPoster(posterId, status, comment) {
        return this.request(`/admin/posters/${posterId}/review`, {
            method: 'POST',
            body: JSON.stringify({ status, comment })
        });
    }

    async adminUploadDocument(formData) {
        return this.request('/admin/documents/upload', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async adminBulkUploadInvitation(formData) {
        return this.request('/admin/invitations/bulk-upload', {
            method: 'POST',
            body: formData,
            headers: {}
        });
    }

    async adminGetStatistics() {
        return this.request('/admin/statistics');
    }

    async adminGetLogs(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/admin/logs?${query}`);
    }

    async adminSetUserAdmin(userId, isAdmin) {
        return this.request(`/admin/users/${userId}/set-admin`, {
            method: 'POST',
            body: JSON.stringify({ is_admin: isAdmin })
        });
    }

    async adminUpdateUser(userId, data) {
        return this.request(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async adminCreateRegistration(userId, data) {
        return this.request(`/admin/users/${userId}/registration`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async adminUpdateRegistration(regId, data) {
        return this.request(`/admin/registrations/${regId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
}

// 全局实例
const api = new ApiClient();
