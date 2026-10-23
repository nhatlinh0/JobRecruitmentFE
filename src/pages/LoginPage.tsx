import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { LoginPayload } from '../types/auth'
import './RegisterPage.css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const payload: LoginPayload = { email, password }
    console.log(payload) // TODO: gọi API đăng nhập
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
