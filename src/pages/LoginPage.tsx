import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { createMockToken } from '../utils/mockJwt'
import type { LoginPayload, Role } from '../types/auth'
import './RegisterPage.css'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const payload: LoginPayload = { email, password }
    // Giả lập server: email bắt đầu bằng "recruit" => nhà tuyển dụng
    const role: Role = email.toLowerCase().startsWith('recruit') ? 'RECRUIT' : 'USER'
    login(createMockToken({ email: payload.email, username: payload.email.split('@')[0], role }))
    navigate('/')
  }

  return (
    <div className="register">
      <form className="register__form" onSubmit={handleSubmit}>
        <h1>Đăng nhập</h1>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label>
          Mật khẩu
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <button type="submit">Đăng nhập</button>
        <p className="register__hint">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  )
}
