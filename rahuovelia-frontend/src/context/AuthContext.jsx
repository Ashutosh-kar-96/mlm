import { createContext, useContext, useMemo, useState } from 'react'
import { authApi, clearStoredAuth, getStoredAuth, storeAuth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getStoredAuth())

  const saveSession = (data, role) => {
    const nextSession = {
      role,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: normalizeUser(data.user || data.admin, role),
    }
    setSession(nextSession)
    storeAuth(nextSession)
    return nextSession
  }

  const login = async ({ identifier, password, asAdmin = false }) => {
    if (asAdmin) {
      const data = await authApi.adminLogin({ username: identifier, password })
      return saveSession(data, 'admin')
    }

    const data = await authApi.memberLogin({ identifier, password })
    return saveSession(data, 'user')
  }

  const register = async (form) => {
    const [firstName, ...rest] = form.name.trim().split(/\s+/)
    const data = await authApi.memberRegister({
      firstName,
      lastName: rest.join(' '),
      email: form.email,
      password: form.password,
      sponsorId: form.sponsor || undefined,
      username: form.email,
    })
    return saveSession(data, 'user')
  }

  const logout = () => {
    setSession(null)
    clearStoredAuth()
  }

  const value = useMemo(
    () => ({
      user: session?.user || null,
      role: session?.role || 'user',
      token: session?.accessToken || null,
      login,
      register,
      logout,
      isAuthenticated: !!session?.user,
    }),
    [session]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

function normalizeUser(user, role) {
  if (role === 'admin') {
    return {
      id: user?.id ? `ADM${user.id}` : 'ADMIN',
      name: user?.username || 'Admin',
      email: '',
      role,
    }
  }

  return {
    id: user?.regno || user?.id || '',
    name: user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Member',
    email: user?.email || user?.emailId || '',
    sponsor: user?.sponsorId || '',
    rank: user?.rank || 'Member',
    kyc: user?.kyc || 'Pending',
    joined: user?.joined || user?.doj || '',
    status: user?.status,
    role,
  }
}
