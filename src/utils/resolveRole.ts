import type { Role } from '../types/auth'

// API có thể trả role trực tiếp hoặc đối tượng role trong thông tin user.
export function resolveRole(value: unknown): Role | null {
  if (value === 1) return 'USER'
  if (value === 3) return 'RECRUIT'
  if (typeof value === 'string') {
    const role = value.trim().toUpperCase().replace(/^ROLE_/, '')
    if (role === 'USER' || role === 'RECRUIT') return role
    return null
  }
  if (value && typeof value === 'object') {
    const role = value as Record<string, unknown>
    return resolveRole(role.name) ?? resolveRole(role.roleName) ?? resolveRole(role.authority) ?? resolveRole(role.roleId) ?? resolveRole(role.id)
  }
  return null
}
