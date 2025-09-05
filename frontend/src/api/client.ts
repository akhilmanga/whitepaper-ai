// src/api/client.ts
import axios from 'axios'
import { auth } from '../config/firebase'

// Use port 8002 (matches your main.py)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add Firebase Auth token to every request
apiClient.interceptors.request.use(
    async (config) => {
        const user = auth.currentUser
        if (user) {
            try {
                const token = await user.getIdToken()
                config.headers.Authorization = `Bearer ${token}`
            } catch (error) {
                console.error('Failed to get Firebase token:', error)
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Optional: Add response interceptor for global error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized: Redirecting to login...')
            // Optionally trigger logout or redirect
        }
        return Promise.reject(error)
    }
)

export default apiClient