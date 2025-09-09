// frontend/src/components/ProgressSidebar.tsx
import React from 'react'
import { 
  CheckCircleIcon, 
  ClockIcon,
  PlayIcon 
} from '@heroicons/react/24/outline'
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid'

interface Module {
  id: string
  title: string
  completed: boolean
  timeSpent: number
  estimatedTime: number
}

interface Course {
  id: string
  title: string
  description: string
  modules: Module[]
  progress: number
  estimatedTime: number
  objectives?: string[]  // Optional — may not exist yet
}

interface ProgressSidebarProps {
  course: Course
  currentModuleIndex: number
  onModuleSelect: (index: number) => void
}

const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  course,
  currentModuleIndex,
  onModuleSelect
}) => {
  const completedModules = course.modules.filter(m => m.completed).length
  const totalModules = course.modules.length

  return (
    <div className="space-y-6">
      {/* Course Overview */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-2">Course Overview</h3>
        <p className="text-sm text-gray-600 mb-4">{course.description}</p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{Math.round(course.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Modules</span>
            <span className="font-medium">{completedModules}/{totalModules}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>{course.estimatedTime} min estimated</span>
          </div>
        </div>
      </div>

      {/* Module List */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Modules</h3>
        <div className="space-y-2">
          {course.modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => onModuleSelect(index)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                index === currentModuleIndex
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {module.completed ? (
                    <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                  ) : index === currentModuleIndex ? (
                    <PlayIcon className="h-5 w-5 text-primary-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${
                    index === currentModuleIndex ? 'text-primary-900' : 'text-gray-900'
                  }`}>
                    Module {index + 1}: {module.title}
                  </h4>
                  
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>{Math.round(module.estimatedTime / 60)} min</span>
                    {module.timeSpent > 0 && (
                      <span className="ml-2">
                        • {Math.round(module.timeSpent / 60)} min spent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Learning Objectives */}
      {Array.isArray(course.objectives) && course.objectives.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Learning Objectives</h3>
          <ul className="space-y-2">
            {course.objectives.map((objective) => (
              <li key={objective} className="flex items-start space-x-2 text-sm">
                <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProgressSidebar