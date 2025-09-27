import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import type { User } from '@supabase/supabase-js'
import { generateDeviceFingerprint, checkDeviceBanStatus, logDeviceSession, getOrCreateDeviceFingerprint } from '@/utils/deviceFingerprinting'

interface AuthContextType {
  user: User | null
  loading: boolean
  deviceBanned: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [deviceBanned, setDeviceBanned] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      // Check device ban status first
      const fingerprint = await getOrCreateDeviceFingerprint()
      const isBanned = await checkDeviceBanStatus(fingerprint)
      
      if (isBanned) {
        setDeviceBanned(true)
        setLoading(false)
        return
      }

      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Log device session if user is authenticated
        if (session?.user) {
          logDeviceSession(fingerprint, session.user.id, undefined, navigator.userAgent)
        }
      })

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Log device session if user is authenticated
        if (session?.user) {
          logDeviceSession(fingerprint, session.user.id, undefined, navigator.userAgent)
        }
      })

      return () => subscription.unsubscribe()
    }

    initializeAuth()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Check device ban status before allowing sign in
    const fingerprint = await getOrCreateDeviceFingerprint()
    const isBanned = await checkDeviceBanStatus(fingerprint)
    
    if (isBanned) {
      setDeviceBanned(true)
      throw new Error('This device has been banned from accessing the application')
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string) => {
    // Check device ban status before allowing sign up
    const fingerprint = await getOrCreateDeviceFingerprint()
    const isBanned = await checkDeviceBanStatus(fingerprint)
    
    if (isBanned) {
      setDeviceBanned(true)
      throw new Error('This device has been banned from accessing the application')
    }

    const redirectUrl = `${window.location.origin}/`
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    loading,
    deviceBanned,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}