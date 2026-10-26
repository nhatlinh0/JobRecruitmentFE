import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createMockToken } from '../utils/mockJwt'
import type { RegisterPayload, Role } from '../types/auth'
import './RegisterPage.css'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<Role>('USER')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const payload: RegisterPayload = { email, password, username, role }
    // Giả lập server: đăng ký xong trả token và đăng nhập luôn
    login(createMockToken({ email: payload.email, username: payload.username, role: payload.role }))
    navigate('/')
  }

  return (
    <div className="register">
      <form className="register__form" onSubmit={handleSubmit}>
        <h1>Đăng ký</h1>

        <label>
          Họ tên
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Mật khẩu
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <fieldset className="register__type">
          <legend>Bạn là</legend>
          <label>
            <input
              type="radio"
              name="role"
              checked={role === 'USER'}
              onChange={() => setRole('USER')}
            />
            Người dùng bình thường
          </label>
          <label>
            <input
              type="radio"
              name="role"
              checked={role === 'RECRUIT'}
              onChange={() => setRole('RECRUIT')}
            />
            Nhà tuyển dụng
          </label>
        </fieldset>

        <button type="submit">Đăng ký</button>
        <p className="register__hint">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}
