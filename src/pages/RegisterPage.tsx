import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Toast, type ToastMessage } from '../components/ui/Toast'
import type { RegisterPayload, Role } from '../types/auth'
import './RegisterPage.css'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<Role>('USER')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitting = useRef(false)
  const [notification, setNotification] = useState<ToastMessage | null>(null)
  const closeToast = useCallback(() => setNotification(null), [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting.current) return
    if (!username.trim()) {
      setNotification({ type: 'error', message: 'Vui lòng nhập họ tên.' })
      return
    }
    const payload: RegisterPayload = { email: email.trim(), password, username: username.trim(), roleId: role === 'USER' ? 1 : 3 }
    submitting.current = true
    setIsSubmitting(true)
    setNotification(null)
    try {
      const response = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        const text = await response.text()
        let message = `Đăng ký thất bại (HTTP ${response.status}). Vui lòng thử lại.`
        try {
          const body: unknown = JSON.parse(text)
          if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
        } catch {
          if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300)
        }
        setNotification({ type: 'error', message })
        return
      }
      setNotification({ type: 'success', message: 'Đăng ký thành công! Bạn có thể đăng nhập bằng tài khoản vừa tạo.' })
      setPassword('')
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

        <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>{isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}</button>
        <p className="register__hint">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}
