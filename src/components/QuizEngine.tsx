import React, { useEffect, useState } from 'react'
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

interface Question {
  id: string
  type: 'multiple-choice' | 'fill-blank' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface Quiz {
  id: string
  questions: Question[]
  score?: number
  attempts: number
}

interface QuizEngineProps {
  quiz: Quiz
  moduleId: string
  courseId: string
}

const QuizEngine: React.FC<QuizEngineProps> = ({ quiz, moduleId, courseId }) => {
  console.log("courseId:", courseId, "moduleId:", moduleId)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showExplanations, setShowExplanations] = useState(false)

  useEffect(() => {
    console.log("Mounted QuizEngine with courseId:", courseId, "moduleId:", moduleId)
  }, [courseId, moduleId])

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-lg p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quiz available</h3>
          <p className="text-gray-600">A quiz will be generated for this module.</p>
        </div>
      </div>
    )
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== quiz.questions.length) {
      alert('Please answer all questions before submitting.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/courses/${courseId}/modules/${moduleId}/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers, quiz })
      })

      if (!response.ok) {
        throw new Error('Failed to submit quiz')
      }

      const result = await response.json()
      setResults(result)
      setSubmitted(true)
      setShowExplanations(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      alert('Something went wrong while submitting the quiz.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setSubmitted(false)
    setResults(null)
    setShowExplanations(false)
  }

  const renderQuestion = (question: Question, index: number) => {
    const userAnswer = answers[question.id]
    const isCorrect = submitted && userAnswer === question.correctAnswer

    return (
      <div key={question.id} className="border border-gray-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="inline-block mb-1 px-2 py-0.5 text-xs font-semibold text-white bg-gray-500 rounded-full">
              {question.type}
            </span>
            <h4 className="text-lg font-medium text-gray-900">
              Question {index + 1}
            </h4>
            <p className="text-sm text-gray-500 italic">{question.type}</p>
          </div>
          {submitted && (
            <div className={`flex items-center space-x-1 ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">
                {isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
          )}
        </div>

        <p className="text-gray-700 mb-4">{question.question}</p>

        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, optionIndex) => (
              <label
                key={optionIndex}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  submitted
                    ? option === question.correctAnswer
                      ? 'border-green-300 bg-green-50'
                      : userAnswer === option && option !== question.correctAnswer
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200'
                    : userAnswer === option
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={submitted}
                  className="text-primary-600"
                />
                <span className="text-gray-900">{String.fromCharCode(65 + optionIndex)}. {option}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'fill-blank' && (
          <input
            type="text"
            value={userAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={submitted}
            placeholder="Type your answer here..."
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              submitted
                ? isCorrect
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
        )}

        {question.type === 'short-answer' && (
          <textarea
            value={userAnswer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            disabled={submitted}
            placeholder="Type your answer here..."
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              submitted
                ? isCorrect
                  ? 'border-green-300 bg-green-50'
                  : 'border-red-300 bg-red-50'
                : 'border-gray-300'
            }`}
          />
        )}

        {submitted && showExplanations && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
            <p className="text-blue-800">{question.explanation}</p>
            {!isCorrect && (
              <p className="text-blue-800 mt-2">
                <strong>Correct answer:</strong> {question.correctAnswer}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">ID: {question.id}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Module Quiz</h3>
          <p className="text-sm text-gray-600">
            {quiz.questions.length} questions • {quiz.attempts} attempts
          </p>
        </div>
        
        {submitted && results && (
          <div className={`px-4 py-2 rounded-lg ${
            results.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Score: {results.score}%</span>
              {results.passed ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        {submitted && !results?.passed && (
          <button
            onClick={handleRetry}
            className="btn-secondary"
          >
            Try Again
          </button>
        )}
        
        {submitted && showExplanations && (
          <button
            onClick={() => setShowExplanations(false)}
            className="btn-secondary"
          >
            Hide Explanations
          </button>
        )}
        
        {submitted && !showExplanations && (
          <button
            onClick={() => setShowExplanations(true)}
            className="btn-secondary"
          >
            Show Explanations
          </button>
        )}

        {!submitted && (
          <button
            onClick={handleSubmit}
            disabled={loading || Object.keys(answers).length !== quiz.questions.length}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
          >
            {loading ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      {!submitted && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            {Object.keys(answers).length} of {quiz.questions.length} questions answered
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.keys(answers).length / quiz.questions.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QuizEngine