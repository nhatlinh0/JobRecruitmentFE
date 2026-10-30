export interface UserProfile {
  username: string
  email?: string
  avatar?: string
  role?: unknown
  roleId?: number
  [key: string]: unknown
}

export async function fetchUserProfile(token: string, signal?: AbortSignal): Promise<UserProfile> {
  // /api là prefix proxy; /api thứ hai thuộc đường dẫn backend.
  const response = await fetch('/api/api/v1/users/get-user', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    signal: signal ?? AbortSignal.timeout(15000),
  })
  if (!response.ok) throw new Error(`Không thể lấy thông tin người dùng (HTTP ${response.status}).`)
  const body: unknown = await response.json()
  const profile = body && typeof body === 'object' && 'data' in body ? body.data : body
  if (!profile || typeof profile !== 'object' || !('username' in profile) || typeof profile.username !== 'string' || !profile.username.trim()) {
    throw new Error('Phản hồi thông tin người dùng không có username hợp lệ.')
  }
  return profile as UserProfile
}
