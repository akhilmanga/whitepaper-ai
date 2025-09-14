import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { LearningProvider } from './context/LearningContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import UploadPage from './pages/UploadPage'
import CoursePage from './pages/CoursePage'
import DashboardPage from './pages/DashboardPage'

function App() {
  return (
    <AuthProvider>
      <LearningProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/course/:courseId" element={<CoursePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </Router>
      </LearningProvider>
    </AuthProvider>
  )
}

export default App