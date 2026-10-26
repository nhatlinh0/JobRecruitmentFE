import type { Role } from '../types/auth'

export interface JwtClaims {
  sub: string
  email: string
  username: string
  role: Role
  avatar?: string
  exp: number
}

function encode(value: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// Giả lập token do server trả về (chưa có chữ ký thật)
export function createMockToken(claims: Omit<JwtClaims, 'exp' | 'sub'>): string {
  const payload: JwtClaims = {
    ...claims,
    sub: claims.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.mock-signature`
}
