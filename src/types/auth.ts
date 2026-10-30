export type Role = 'USER' | 'RECRUIT'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  username: string
  role: Role
}

export interface CreateStaffPayload {
  email: string
  username: string
  role: 'RECRUIT'
}
