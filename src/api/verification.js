import apiClient from '@/lib/axios';

/**
 * Verification API endpoints
 */
export const verification = {
    // Check gate status for an email
    checkGateStatus: async (email) => {
        const response = await apiClient.post('/verification/gate-check', { email });
        return response.data;
    },

    // Register a new applicant (Multipart form data for photo)
    registerApplicant: async (formData) => {
        const response = await apiClient.post('/verification/applicant-register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Submit verification for existing user (Multipart form data)
    submitVerification: async (formData) => {
        const response = await apiClient.post('/verification/browser-submit', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get status for current user (or via telegram_id)
    getStatus: async (telegramId = null) => {
        const params = telegramId ? { telegram_id: telegramId } : {};
        const response = await apiClient.get('/verification/status', { params });
        return response.data;
    },

    // ADMIN: Get pending requests
    getPendingRequests: async (page = 1, limit = 20) => {
        const response = await apiClient.get('/verification/pending', { params: { page, limit } });
        return response.data;
    },

    // ADMIN: Approve request
    approveRequest: async (id, note = '') => {
        const response = await apiClient.post(`/verification/approve/${id}`, { note });
        return response.data;
    },

    // ADMIN: Reject request
    rejectRequest: async (id, reason) => {
        const response = await apiClient.post(`/verification/reject/${id}`, { reason });
        return response.data;
    },
};

export default verification;
