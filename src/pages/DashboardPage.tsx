import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUserCourses } from '../api/courses'
import { useLearning } from '../context/LearningContext'
import { 
  PlusIcon, 
  BookOpenIcon, 
  ClockIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DashboardPage: React.FC = () => {
  const { state, dispatch } = useLearning()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0,
    averageScore: 0
  })

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const courses = await getUserCourses()
        dispatch({ type: 'SET_COURSES', payload: courses })
        
        // Calculate stats
        const totalCourses = courses.length
        const completedCourses = courses.filter((c: any) => c.progress >= 100).length
        const totalTimeSpent = courses.reduce((acc: number, course: any) => {
          return acc + course.modules.reduce((moduleAcc: number, module: any) => {
            return moduleAcc + (module.timeSpent || 0)
          }, 0)
        }, 0)
        
        const allScores = courses.flatMap((course: any) => 
          course.modules
            .map((module: any) => module.quiz?.score)
            .filter((score: any) => score !== undefined && score !== null)
        )
        const averageScore = allScores.length > 0 
          ? allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length 
          : 0

        setStats({
          totalCourses,
          completedCourses,
          totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
          averageScore: Math.round(averageScore)
        })
      } catch (error) {
        console.error('Failed to load dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [dispatch])

  const getProgressChartData = () => {
    return state.courses.slice(0, 5).map(course => ({
      name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
      progress: Math.round(course.progress)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your progress and continue learning</p>
          </div>
          <Link to="/upload" className="btn-primary flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>New Course</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrophyIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedCourses}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ClockIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTimeSpent}m</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <div className="lg:col-span-2">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Progress</h3>
              {state.courses.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getProgressChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12">
                  <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by uploading your first whitepaper.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Courses */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Courses</h3>
              <div className="space-y-3">
                {state.courses.slice(0, 5).map((course) => (
                  <Link
                    key={course.id}
                    to={`/course/${course.id}`}
                    className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm">{course.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {course.modules.length} modules
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-1">
                          <div 
                            className="bg-primary-600 h-1 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {Math.round(course.progress)}%
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
                
                {state.courses.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No courses yet</p>
                    <Link to="/upload" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Upload your first whitepaper
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage