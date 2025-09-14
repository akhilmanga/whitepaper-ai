// src/context/LearningContext.tsx
import React, { createContext, useContext, useReducer } from 'react'

export interface Course {
  id: string
  user_id: string
  title: string
  description: string
  objectives: string[]
  modules: Module[]
  progress: number
  estimatedTime: number
  difficulty: string
  createdAt: string
}

export interface Module {
  id: string
  title: string
  content: string
  flashcards: Flashcard[]
  quiz: Quiz | null
  completed: boolean
  timeSpent: number
  estimatedTime: number
}

export interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: number
  lastReviewed?: string
  nextReview?: string
}

export interface Quiz {
  id: string
  questions: Question[]
  score?: number
  attempts: number
}

export interface Question {
  id: string
  type: 'multiple-choice'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface LearningState {
  courses: Course[]
  currentCourse: Course | null
  currentModule: Module | null
  loading: boolean
  error: string | null
}

type LearningAction =
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_CURRENT_COURSE'; payload: Course | null }
  | { type: 'SET_CURRENT_MODULE'; payload: Module | null }
  | { type: 'UPDATE_MODULE_PROGRESS'; payload: { courseId: string; moduleId: string; progress: Partial<Module> } }

const initialState: LearningState = {
  courses: [],
  currentCourse: null,
  currentModule: null,
  loading: false,
  error: null
}

const learningReducer = (state: LearningState, action: LearningAction): LearningState => {
  switch (action.type) {
    case 'SET_COURSES':
      return { ...state, courses: action.payload }
    case 'SET_CURRENT_COURSE':
      return { ...state, currentCourse: action.payload }
    case 'SET_CURRENT_MODULE':
      return { ...state, currentModule: action.payload }
    case 'UPDATE_MODULE_PROGRESS':
      const { courseId, moduleId, progress } = action.payload
      return {
        ...state,
        courses: state.courses.map(course =>
          course.id === courseId
            ? {
                ...course,
                modules: course.modules.map(module =>
                  module.id === moduleId ? { ...module, ...progress } : module
                )
              }
            : course
        )
      }
    default:
      return state
  }
}

const LearningContext = createContext<LearningState | undefined>(undefined)
const DispatchContext = createContext<React.Dispatch<LearningAction> | undefined>(undefined)

export const useLearning = () => {
  const state = useContext(LearningContext)
  const dispatch = useContext(DispatchContext)
  if (state === undefined || dispatch === undefined) {
    throw new Error('useLearning must be used within a LearningProvider')
  }
  return { state, dispatch }
}

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(learningReducer, initialState)
  return (
    <LearningContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </LearningContext.Provider>
  )
}