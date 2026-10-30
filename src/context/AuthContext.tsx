import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'
import type { JwtClaims } from '../utils/mockJwt'
import { fetchUserProfile, type UserProfile } from '../services/user'
import { resolveRole } from '../utils/resolveRole'

const TOKEN_KEY = 'access_token'

export interface AuthContextValue {
  token: string | null
  user: JwtClaims | null
  profile: UserProfile | null
  login: (token: string) => Promise<void>
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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const sessionVersion = useRef(0)

  const login = useCallback(async (newToken: string) => {
    if (!decodeToken(newToken)) throw new Error('JWT không hợp lệ hoặc đã hết hạn')
    const version = ++sessionVersion.current
    // Lưu JWT nhận từ login trước khi gọi API lấy thông tin user.
    localStorage.setItem(TOKEN_KEY, newToken)
    const nextProfile = await fetchUserProfile(newToken)
    if (version !== sessionVersion.current) throw new Error('Phiên đăng nhập đã thay đổi.')
    setProfile(nextProfile)
    setToken(newToken)
  }, [])

  useEffect(() => {
    if (!token || profile) return
    const controller = new AbortController()
    fetchUserProfile(token, controller.signal).then((nextProfile) => {
      if (!controller.signal.aborted) setProfile(nextProfile)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) console.error('Không thể tải thông tin người dùng:', error)
    })
    return () => controller.abort()
  }, [token, profile])

  const logout = useCallback(() => {
    sessionVersion.current += 1
    localStorage.removeItem(TOKEN_KEY)
    setProfile(null)
    setToken(null)
  }, [])

  const value = useMemo(
    () => {
      const claims = decodeToken(token)
      const role = resolveRole(profile?.role) ?? resolveRole(profile?.roleName) ?? resolveRole(profile?.roleId) ?? resolveRole(claims?.role)
      return { token, profile, user: claims ? { ...claims, username: profile?.username ?? claims.username, email: profile?.email ?? claims.email, avatar: profile?.avatar ?? claims.avatar, role: role ?? claims.role } : null, login, logout }
    },
    [token, profile, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
