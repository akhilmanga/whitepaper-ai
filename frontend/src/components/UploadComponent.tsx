import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  DocumentArrowUpIcon, 
  LinkIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { uploadWhitepaper, designCourse } from '../api/courses'

interface UploadComponentProps {
  onUploadSuccess: (uploadId: string) => void
}

const UploadComponent: React.FC<UploadComponentProps> = ({ onUploadSuccess }) => {
  const [uploadType, setUploadType] = useState<'pdf' | 'url' | 'text'>('pdf')
  const [urlInput, setUrlInput] = useState('')
  const [textInput, setTextInput] = useState('')
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadId, setUploadId] = useState<string | null>(null)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDrop: handleFileDrop
  })

  async function handleFileDrop(acceptedFiles: File[]) {
    if (acceptedFiles.length === 0) return
    
    const file = acceptedFiles[0]
    await handleUpload('pdf', file)
  }

  const handleUpload = async (type: 'pdf' | 'url' | 'text', content: string | File) => {
    setUploading(true)
    
    try {
      const result = await uploadWhitepaper({
        type,
        content,
        title: title || undefined
      })
      
      toast.success('Upload successful! Ready to design your course.')
      setUploadId(result.id)
      setUploadComplete(true)
    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDesignCourse = async () => {
    if (!uploadId) return
    
    try {
      await designCourse(uploadId)
      toast.success('Starting course design...')
      onUploadSuccess(uploadId)
    } catch (error) {
      console.error('Failed to start course design:', error)
      toast.error('Failed to start course design. Please try again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (uploadType === 'url' && urlInput) {
      await handleUpload('url', urlInput)
    } else if (uploadType === 'text' && textInput) {
      await handleUpload('text', textInput)
    }
  }

  // Show success state after upload
  if (uploadComplete && uploadId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <DocumentArrowUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
            <p className="text-gray-600">
              Your whitepaper has been uploaded successfully. Ready to create an interactive learning course?
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleDesignCourse}
              className="w-full btn-primary text-lg py-3"
            >
              🎓 Design a Course
            </button>
            
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Your Whitepaper</h2>
        
        {/* Upload Type Selector */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { type: 'pdf' as const, label: 'PDF File', icon: DocumentArrowUpIcon },
            { type: 'url' as const, label: 'URL', icon: LinkIcon },
            { type: 'text' as const, label: 'Text', icon: DocumentTextIcon }
          ].map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => setUploadType(type)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                uploadType === type
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Title Input */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Course Title (Optional)
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a custom title for your course"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Upload Interface */}
        {uploadType === 'pdf' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-400 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop your PDF here' : 'Drag & drop your PDF'}
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (max 50MB)
            </p>
          </div>
        )}

        {uploadType === 'url' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Whitepaper URL
              </label>
              <input
                type="url"
                id="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/whitepaper.pdf"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !urlInput}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Processing...' : 'Process URL'}
            </button>
          </form>
        )}

        {uploadType === 'text' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Paste Whitepaper Text
              </label>
              <textarea
                id="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste the full text of your whitepaper here..."
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>
            <button
              type="submit"
              disabled={uploading || !textInput}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Processing...' : 'Process Text'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default UploadComponent