import React, { useState } from 'react'
import { 
  ArrowPathIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'

interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: number
}

interface FlashcardSystemProps {
  flashcards: Flashcard[]
}

const FlashcardSystem: React.FC<FlashcardSystemProps> = ({ flashcards }) => {
  // Normalize incoming flashcards to expected interface
  const normalizedFlashcards = flashcards.map((card) => ({
    id: card.id,
    front: card.front || card.question,
    back: card.back || card.answer,
    difficulty: card.difficulty || 1,
  }))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showAll, setShowAll] = useState(false)

  if (!normalizedFlashcards || normalizedFlashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-100 rounded-lg p-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards available</h3>
          <p className="text-gray-600">Flashcards will be generated for this module.</p>
        </div>
      </div>
    )
  }

  const currentCard = normalizedFlashcards[currentIndex]

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % normalizedFlashcards.length)
    setIsFlipped(false)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + normalizedFlashcards.length) % normalizedFlashcards.length)
    setIsFlipped(false)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleShuffle = () => {
    // In a real implementation, you'd shuffle the flashcards array
    setCurrentIndex(Math.floor(Math.random() * normalizedFlashcards.length))
    setIsFlipped(false)
  }

  if (showAll) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">All Flashcards</h3>
          <button
            onClick={() => setShowAll(false)}
            className="btn-secondary flex items-center space-x-2"
          >
            <EyeSlashIcon className="h-4 w-4" />
            <span>Study Mode</span>
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {normalizedFlashcards.map((card, index) => (
            <div key={card.id} className="border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <span className="text-xs font-medium text-gray-500">Card {index + 1}</span>
                <h4 className="font-medium text-gray-900 mt-1">{card.front}</h4>
              </div>
              <div className="border-t pt-3">
                <p className="text-gray-700">{card.back}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Flashcards</h3>
          <p className="text-sm text-gray-600">
            Card {currentIndex + 1} of {normalizedFlashcards.length}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAll(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <EyeIcon className="h-4 w-4" />
            <span>View All</span>
          </button>
          
          <button
            onClick={handleShuffle}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className="h-4 w-4" />
            <span>Shuffle</span>
          </button>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative">
        <div 
          className={`bg-white border-2 border-gray-200 rounded-xl p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-primary-300 ${
            isFlipped ? 'bg-primary-50 border-primary-300' : ''
          }`}
          onClick={handleFlip}
        >
          <div className="text-center">
            {!isFlipped ? (
              <>
                <div className="text-sm font-medium text-gray-500 mb-4">QUESTION</div>
                <p className="text-xl font-medium text-gray-900 leading-relaxed">
                  {currentCard.front}
                </p>
                <div className="mt-6 text-sm text-gray-500">
                  Click to reveal answer
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-medium text-primary-600 mb-4">ANSWER</div>
                <p className="text-lg text-gray-900 leading-relaxed">
                  {currentCard.back}
                </p>
                <div className="mt-6 text-sm text-primary-600">
                  Click to see question again
                </div>
              </>
            )}
          </div>
        </div>

        {/* Difficulty Indicator */}
        <div className="absolute top-4 right-4">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            currentCard.difficulty === 1 
              ? 'bg-green-100 text-green-800'
              : currentCard.difficulty === 2
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {currentCard.difficulty === 1 ? 'Easy' : currentCard.difficulty === 2 ? 'Medium' : 'Hard'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-1">
          {normalizedFlashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index)
                setIsFlipped(false)
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>Next</span>
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

export default FlashcardSystem