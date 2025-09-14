// src/components/ModuleViewer.tsx
import React, { useState } from 'react'
import { updateProgress, submitQuiz, generateQuiz, generateFlashcards } from '../api/courses'
import FlashcardSystem from './FlashcardSystem'
import QuizEngine from './QuizEngine'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  BookOpenIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export interface Flashcard {
  id: string
  question: string
  answer: string
  generated_at?: string
  difficulty?: number
}

export interface Question {
  id: string
  type: 'multiple-choice'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

export interface Quiz {
  id: string
  title?: string
  questions: (Question & { type?: string })[]
  score?: number
  attempts: number
  timeSpent?: number
}

interface Module {
  id: string
  title: string
  content: string
  flashcards: Flashcard[]
  quiz: Quiz | null
  completed: boolean
  timeSpent: number
  estimatedTime: number
}

interface ModuleViewerProps {
  module: Module
  courseId: string
  onNext: () => void
  onPrevious: () => void
  canGoNext: boolean
  canGoPrevious: boolean
  onRefresh: () => void // ← Add this
}

const ModuleViewer: React.FC<ModuleViewerProps> = ({
  module,
  courseId,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'flashcards' | 'quiz'>('content')
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false)
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false)
  const [startTime] = useState(Date.now())

  const handleMarkComplete = async () => {
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      
      await updateProgress(courseId, module.id, {
        completed: true,
        timeSpent: module.timeSpent + timeSpent
      })
      
      toast.success('Module completed!')
      
      if (canGoNext) {
        onNext()
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
      toast.error('Failed to update progress')
    }
  }

  const handleQuizSubmit = async (answers: Record<string, string>) => {
    try {
      const result = await submitQuiz(courseId, module.id, answers)
      
      if (result.passed) {
        toast.success(`Quiz passed! Score: ${result.score}%`)
        await handleMarkComplete()
      } else {
        toast.error(`Quiz failed. Score: ${result.score}%. Try again!`)
      }
      
      return result
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      toast.error('Failed to submit quiz')
      throw error
    }
  }

  const handleGenerateQuiz = async () => {
    if (!module.id) return
    setIsGeneratingQuiz(true)
    try {
      await generateQuiz(courseId, module.id)
      toast.success('Quiz generated!')
      onRefresh() // ← Trigger refresh
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.')
    } finally {
      setIsGeneratingQuiz(false)
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!module.id) return
    setIsGeneratingFlashcards(true)
    try {
      await generateFlashcards(courseId, module.id)
      toast.success('Flashcards generated!')
      onRefresh() // ← Trigger refresh
    } catch (error) {
      toast.error('Failed to generate flashcards. Please try again.')
    } finally {
      setIsGeneratingFlashcards(false)
    }
  }

  // Format content for markdown
  const formatContent = (content: string) => {
    if (!content?.trim()) return '<p>No content available.</p>'
    
    let html = content
      .replace(/\n## (.*?)(\n|$)/g, '\n<h3>$1</h3>\n')
      .replace(/\n### (.*?)(\n|$)/g, '\n<h4>$1</h4>\n')
      .replace(/\n- (.*?)(\n|$)/g, '\n<ul><li>$1</li></ul>\n')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>')
    
    return html
  }

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
          {module.completed && (
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              Completed
            </span>
          )}
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'content' as const, label: 'Content', icon: BookOpenIcon },
              { id: 'flashcards' as const, label: 'Flashcards', icon: LightBulbIcon },
              { id: 'quiz' as const, label: 'Quiz', icon: QuestionMarkCircleIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="card">
        {activeTab === 'content' && (
          <div className="prose max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: formatContent(module.content) }}
              className="text-gray-700 leading-relaxed"
            />
          </div>
        )}

        {activeTab === 'flashcards' && (
          <>
            {module.flashcards && module.flashcards.length > 0 ? (
              <FlashcardSystem flashcards={module.flashcards.map(fc => ({
                ...fc,
                front: fc.question,
                back: fc.answer
              }))} />
            ) : (
              <div className="text-center py-12">
                <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Flashcards Yet</h3>
                <p className="mt-2 text-gray-500">Generate flashcards to help you review key concepts.</p>
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={isGeneratingFlashcards}
                  className="mt-4 flex items-center space-x-2 btn-primary mx-auto"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>{isGeneratingFlashcards ? 'Generating...' : 'Generate Flashcards'}</span>
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'quiz' && (
          <>
            {module.quiz && module.quiz.questions?.length > 0 ? (
              <>
                <div className="mb-4">
                  {module.quiz.title && (
                    <h3 className="text-lg font-semibold text-gray-900">{module.quiz.title}</h3>
                  )}
                  <p className="text-sm text-gray-600">
                    Attempts: {module.quiz.attempts} &nbsp;|&nbsp; Score: {module.quiz.score ?? 'N/A'}%
                  </p>
                </div>
                <QuizEngine 
                  quiz={{
                    ...module.quiz,
                    questions: module.quiz.questions.map(q => ({
                      ...q,
                      type: 'multiple-choice'
                    }))
                  }} 
                  onSubmit={handleQuizSubmit}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <QuestionMarkCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No Quiz Yet</h3>
                <p className="mt-2 text-gray-500">Test your knowledge with a generated quiz.</p>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="mt-4 flex items-center space-x-2 btn-primary mx-auto"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>{isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
            canGoPrevious
              ? 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              : 'text-gray-400 bg-gray-50 cursor-not-allowed'
          }`}
        >
          <ChevronLeftIcon className="h-5 w-5" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-3">
          {!module.completed && (
            <button
              onClick={handleMarkComplete}
              className="btn-secondary"
            >
              Mark Complete
            </button>
          )}
          
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium ${
              canGoNext
                ? 'btn-primary'
                : 'text-gray-400 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModuleViewer