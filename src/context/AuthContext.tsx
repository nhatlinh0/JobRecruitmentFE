import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from '../utils/mockJwt'

const TOKEN_KEY = 'access_token'

export interface AuthContextValue {
  token: string | null
  user: JwtClaims | null
  login: (token: string) => void
  logout: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string | null): JwtClaims | null {
  if (!token) return null
  try {
    const claims = jwtDecode<JwtClaims>(token)
    return claims.exp * 1000 > Date.now() ? claims : null
  } catch {
    return null
  }
}

function readStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && !decodeToken(token)) {
    localStorage.removeItem(TOKEN_KEY)
    return null
  }
  return token
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken)

  const login = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({ token, user: decodeToken(token), login, logout }),
    [token, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
