// src/api/course.ts
import apiClient from './client'

export interface UploadRequest {
  type: 'pdf' | 'url' | 'text'
  content: string | File
  title?: string
}

export interface ProcessingStatus {
  id: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  message?: string
}

/**
 * Upload a whitepaper (PDF, URL, or text)
 */
export const uploadWhitepaper = async (data: UploadRequest): Promise<{ id: string }> => {
  const formData = new FormData()

  if (data.type === 'pdf' && data.content instanceof File) {
    formData.append('file', data.content)
    formData.append('type', 'pdf')
  } else {
    formData.append('content', data.content as string)
    formData.append('type', data.type)
  }

  if (data.title) {
    formData.append('title', data.title)
  }

  try {
    const response = await apiClient.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error: any) {
    console.error('Upload failed:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Start course design process
 */
export const designCourse = async (uploadId: string): Promise<{ id: string; status: string }> => {
  try {
    const response = await apiClient.post(`/api/design-course/${uploadId}`)
    return response.data
  } catch (error: any) {
    console.error('Design course failed:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Get processing status
 */
export const getProcessingStatus = async (id: string): Promise<ProcessingStatus> => {
  try {
    const response = await apiClient.get(`/api/processing/${id}`)
    return response.data
  } catch (error: any) {
    console.error('Failed to get processing status:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Get course by ID
 */
export const getCourse = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/courses/${id}`)
    return response.data
  } catch (error: any) {
    console.error(`Failed to load course ${id}:`, error.response?.data || error.message)
    throw error
  }
}

/**
 * Get all courses for current user
 */
export const getUserCourses = async () => {
  try {
    const response = await apiClient.get('/api/courses')
    return response.data
  } catch (error: any) {
    console.error('Failed to load user courses:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Update module progress
 */
export const updateProgress = async (courseId: string, moduleId: string, progress: any) => {
  try {
    const response = await apiClient.post(`/api/courses/${courseId}/modules/${moduleId}/progress`, progress)
    return response.data
  } catch (error: any) {
    console.error('Update progress failed:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Generate quiz for a module
 */
export const generateQuiz = async (courseId: string, moduleId: string) => {
  try {
    const response = await apiClient.post(`/api/courses/${courseId}/modules/${moduleId}/generate-quiz`)
    return response.data
  } catch (error: any) {
    console.error('Quiz generation failed:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Generate flashcards for a module
 */
export const generateFlashcards = async (courseId: string, moduleId: string) => {
  try {
    const response = await apiClient.post(`/api/courses/${courseId}/modules/${moduleId}/generate-flashcards`)
    return response.data
  } catch (error: any) {
    console.error('Flashcard generation failed:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Submit quiz answers
 */
export const submitQuiz = async (courseId: string, moduleId: string, answers: Record<string, string>) => {
  try {
    const response = await apiClient.post(`/api/courses/${courseId}/modules/${moduleId}/quiz`, { answers })
    return response.data
  } catch (error: any) {
    console.error('Quiz submission failed:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Export course in specified format
 */
export const exportCourse = async (courseId: string, format: 'pdf' | 'pptx' | 'notion') => {
  try {
    const response = await apiClient.get(`/api/courses/${courseId}/export/${format}`, {
      responseType: 'blob',
    })
    return response.data
  } catch (error: any) {
    console.error('Export failed:', error.response?.data || error.message)
    throw error
  }
}