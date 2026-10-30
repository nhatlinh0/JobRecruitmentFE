import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Toast, type ToastMessage } from '../components/ui/Toast'
import type { LoginPayload } from '../types/auth'
import './RegisterPage.css'

function extractToken(body: unknown): string | null {
  if (typeof body === 'string') return body.trim() || null
  if (!body || typeof body !== 'object') return null
  for (const key of ['token', 'accessToken', 'access_token']) {
    if (key in body) {
      const value = (body as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return 'data' in body ? extractToken(body.data) : null
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)
  const [notification, setNotification] = useState<ToastMessage | null>(null)
  const closeToast = useCallback(() => setNotification(null), [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setIsSubmitting(true)
    setNotification(null)
    const payload: LoginPayload = { email: email.trim(), password }
    try {
      // Vite bỏ prefix /api và chuyển tới localhost:8080/public/login.
      const response = await fetch('/api/public/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      })
      const text = await response.text()
      let body: unknown = text
      try { body = JSON.parse(text) } catch { /* Server có thể trả JWT dạng text. */ }
      if (!response.ok) {
        let message = response.status === 401 ? 'Email hoặc mật khẩu không đúng.' : `Đăng nhập thất bại (HTTP ${response.status}).`
        if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
        setNotification({ type: 'error', message })
        return
      }
      const token = extractToken(body)
      if (!token) {
        setNotification({ type: 'error', message: 'Phản hồi đăng nhập không có JWT token.' })
        return
      }
      try {
        await login(token)
      } catch (error) {
        setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Không thể tải thông tin người dùng hoặc lưu phiên đăng nhập.' })
        return
      }
      navigate('/')
    } catch {
      setNotification({ type: 'error', message: 'Không thể kết nối máy chủ hoặc yêu cầu đã hết thời gian chờ. Vui lòng thử lại.' })
    } finally {
      submitting.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <div className="register">
      <Toast notification={notification} onClose={closeToast} />
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

        <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        <p className="register__hint">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  )
}
