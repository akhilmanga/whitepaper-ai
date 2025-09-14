import React from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpenIcon, 
  LightBulbIcon, 
  ChartBarIcon,
  ShareIcon 
} from '@heroicons/react/24/outline'

const HomePage: React.FC = () => {
  const features = [
    {
      icon: BookOpenIcon,
      title: 'Smart Content Structuring',
      description: 'AI automatically breaks down complex whitepapers into digestible learning modules with clear objectives.'
    },
    {
      icon: LightBulbIcon,
      title: 'Interactive Learning',
      description: 'Generate flashcards, quizzes, and checkpoints that adapt to your learning pace and style.'
    },
    {
      icon: ChartBarIcon,
      title: 'Progress Tracking',
      description: 'Visual dashboards show your learning progress, achievements, and knowledge mastery across topics.'
    },
    {
      icon: ShareIcon,
      title: 'Export & Share',
      description: 'Export to PDF, PowerPoint, or Notion. Share courses with teams or collaborate on learning goals.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Turn any whitepaper into an
              <span className="text-primary-600"> interactive learning course</span>
              <span className="block">in minutes</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform complex technical documents into structured, engaging learning experiences 
              with AI-powered content generation, interactive quizzes, and progress tracking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/upload" className="btn-primary text-lg px-8 py-3">
                Get Started Free
              </Link>
              <button className="btn-secondary text-lg px-8 py-3">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to master technical content
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform transforms dense whitepapers into engaging, 
              personalized learning experiences tailored to your pace and style.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect for researchers, investors, and technical teams
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Academic Students</h3>
              <p className="text-gray-600">
                Quickly understand blockchain and crypto whitepapers for research projects and thesis work.
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">VC Analysts</h3>
              <p className="text-gray-600">
                Rapidly assess technical viability of projects for faster, more informed investment decisions.
              </p>
            </div>

            <div className="card text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Technical Leaders</h3>
              <p className="text-gray-600">
                Stay current with emerging technologies and make better strategic decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your learning?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Upload your first whitepaper and see how AI can make complex content accessible.
          </p>
          <Link to="/upload" className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-8 rounded-lg text-lg transition-colors">
            Start Learning Now
          </Link>
        </div>
      </div>
    </div>
  )
}

export default HomePage