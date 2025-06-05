import axios from "axios";

const apiUrl = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance with default config
const axiosInstance = axios.create({
    baseURL: apiUrl,
    withCredentials: true,
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
});

// Add response interceptor to handle CSRF tokens and token refresh
axiosInstance.interceptors.response.use(
    (response) => {
        const csrfToken = response.headers['x-csrf-token'];
        if (csrfToken) {
            localStorage.setItem('csrfToken', csrfToken);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        const csrfToken = error.response?.headers?.['x-csrf-token'];
        if (csrfToken) {
            localStorage.setItem('csrfToken', csrfToken);
        }

        // Handle 401 errors (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                if (refreshResponse.data?.accessToken) {
                    const newToken = refreshResponse.data.accessToken;
                    localStorage.setItem('accessToken', newToken);
                    
                    // Retry the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axiosInstance(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('csrfToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Centralized resource mapping
const getEndpoint = (resource) => {
    const resourceMap = {
        'users': 'auth/users',
        'course': 'courses',
        'quiz': 'quiz',
        'question': 'question'
    };
    return resourceMap[resource] || resource;
};

export default {
    getList: async (resource, params) => {
        try {
            const { page, perPage } = params.pagination;
            const endpoint = getEndpoint(resource);
            
            const response = await axiosInstance.get(`/${endpoint}`, {
                params: { page, perPage },
            });

            const items = response.data?.items || [];

            if (!Array.isArray(items)) {
                console.error('API response:', response.data);
                throw new Error('Data returned from API is not an array');
            }
            
            return {
                data: items.map(item => ({ ...item, id: item._id })),
                total: response.data?.total || 0,
            };
        } catch (error) {
            console.error('getList error:', error);
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    create: async (resource, params) => {
        try {
            const { data } = params;
            const endpoint = getEndpoint(resource);
            const response = await axiosInstance.post(`/${endpoint}`, data);
            
            return { data: { ...response.data, id: response.data._id } };
        } catch (error) {
            console.error('create error:', error);
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    getOne: async (resource, params) => {
        try {
            const { id } = params;
            const endpoint = getEndpoint(resource);
            const response = await axiosInstance.get(`/${endpoint}/${id}`);

            return { data: { ...response.data, id: response.data._id } };
        } catch (error) {
            console.error('getOne error:', error);
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    getMany: async (resource, params) => {
        try {
            const { ids } = params;
            const endpoint = getEndpoint(resource);
            const response = await axiosInstance.get(`/${endpoint}/many`, {
                params: { ids },
            });            
            
            const items = response.data?.items || [];
            return { data: items.map(item => ({ ...item, id: item._id })) };
        } catch (error) {
            console.error('getMany error:', error);
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    update: async (resource, params) => {
        try {
            const { id, data } = params;
            const endpoint = getEndpoint(resource);
            const response = await axiosInstance.put(`/${endpoint}/edit/${id}`, data);

            return { data: { ...response.data, id: response.data._id } };
        } catch (error) {
            console.error('update error:', error);
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    delete: async (resource, params) => {
        try {
            const { id } = params;
            const endpoint = getEndpoint(resource);
            await axiosInstance.delete(`/${endpoint}/delete/${id}`);
            
            return { data: { id } };
        } catch (error) {
            console.error('delete error:', error);
            throw new Error(error.response?.data?.message || error.message);
        }
    },

    deleteMany: async (resource, params) => {
        try {
            const { ids } = params;
            const endpoint = getEndpoint(resource);
            await axiosInstance.delete(`/${endpoint}/deleteMany`, {
                data: { ids },
            });

            const deletedItems = ids.map(id => ({ id }));
            return { data: deletedItems };
        } catch (error) {
            console.error('deleteMany error:', error);
            throw new Error(error.response?.data?.message || error.message);
        }
    },
}