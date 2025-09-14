// src/pages/CoursePage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse } from '../api/courses'
import { useLearning } from '../context/LearningContext'
import ModuleViewer from '../components/ModuleViewer'
import ProgressSidebar from '../components/ProgressSidebar'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const CoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { state, dispatch } = useLearning()
  const [loading, setLoading] = useState(true)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0) // ← Add refresh key

  // Load course data
  useEffect(() => {
    if (!courseId) return

    const loadCourse = async () => {
      try {
        setLoading(true)
        const course = await getCourse(courseId)
        dispatch({ type: 'SET_CURRENT_COURSE', payload: course })
        
        if (course.modules.length > 0) {
          dispatch({ 
            type: 'SET_CURRENT_MODULE', 
            payload: course.modules[0] 
          })
        }
      } catch (error) {
        console.error('Failed to load course:', error)
        toast.error('Failed to load course')
        navigate('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, dispatch, navigate])

  const handleModuleSelect = (moduleIndex: number) => {
    if (state.currentCourse && state.currentCourse.modules[moduleIndex]) {
      setCurrentModuleIndex(moduleIndex)
      dispatch({ 
        type: 'SET_CURRENT_MODULE', 
        payload: state.currentCourse.modules[moduleIndex] 
      })
    }
  }

  const handleNextModule = () => {
    if (state.currentCourse && currentModuleIndex < state.currentCourse.modules.length - 1) {
      handleModuleSelect(currentModuleIndex + 1)
    }
  }

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      handleModuleSelect(currentModuleIndex - 1)
    }
  }

  // Refresh the current module (after quiz/flashcards generated)
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!state.currentCourse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ChevronLeftIcon className="h-5 w-5 mr-1" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {state.currentCourse.title}
                </h1>
                <p className="text-sm text-gray-500">
                  Module {currentModuleIndex + 1} of {state.currentCourse.modules.length}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Progress: {Math.round(state.currentCourse.progress)}%
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.currentCourse.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ProgressSidebar
              course={state.currentCourse}
              currentModuleIndex={currentModuleIndex}
              onModuleSelect={handleModuleSelect}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {state.currentModule && (
              <ModuleViewer
                key={`module-${state.currentModule.id}-${refreshKey}`} // ← Force re-render
                module={state.currentModule}
                courseId={state.currentCourse.id}
                onNext={handleNextModule}
                onPrevious={handlePreviousModule}
                canGoNext={currentModuleIndex < state.currentCourse.modules.length - 1}
                canGoPrevious={currentModuleIndex > 0}
                onRefresh={handleRefresh} // ✅ Pass refresh function
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoursePage