import React, { createContext, useContext, useEffect, useState } from 'react'
import { 
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from '../config/firebase'

// Define User type for mock compatibility
interface User {
  uid: string
  email: string | null
  getIdToken?: () => Promise<string>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password)
    setUser(result.user as User)
  }

  const register = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    setUser(result.user as User)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}