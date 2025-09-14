import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadComponent from '../components/UploadComponent'
import { getProcessingStatus } from '../api/courses'
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'

const UploadPage: React.FC = () => {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle')
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!processingId) return

    const checkStatus = async () => {
      try {
        const statusData = await getProcessingStatus(processingId)
        setStatus(statusData.status)
        setProgress(statusData.progress)
        setMessage(statusData.message || '')

        if (statusData.status === 'completed') {
          setTimeout(() => {
            navigate(`/course/${processingId}`)
          }, 2000)
        }
      } catch (error) {
        console.error('Failed to check status:', error)
        setStatus('failed')
        setMessage('Failed to process whitepaper')
      }
    }

    const interval = setInterval(checkStatus, 2000)
    checkStatus() // Initial check

    return () => clearInterval(interval)
  }, [processingId, navigate])

  const handleUploadSuccess = (uploadId: string) => {
    setProcessingId(uploadId)
    setStatus('processing')
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="card text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Whitepaper</h2>
            <p className="text-gray-600 mb-6">
              Our AI is analyzing your document and creating an interactive learning experience.
            </p>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-500">{progress}% complete</p>
            {message && (
              <p className="text-sm text-gray-600 mt-2">{message}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="card text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Complete!</h2>
            <p className="text-gray-600 mb-4">
              Your interactive learning course is ready. Redirecting you now...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="card text-center">
            <ExclamationCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button 
              onClick={() => {
                setStatus('idle')
                setProcessingId(null)
                setProgress(0)
                setMessage('')
              }}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Upload Your Whitepaper
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform any technical document into an interactive learning experience. 
            Support for PDFs, URLs, and direct text input.
          </p>
        </div>

        <UploadComponent onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  )
}

export default UploadPage