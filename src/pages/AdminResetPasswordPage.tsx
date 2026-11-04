import { useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './RegisterPage.css'

export function AdminResetPasswordPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'ADMIN') return <Navigate to="/" replace />
  return <ResetPasswordForm key={token} token={token} />
}

function ResetPasswordForm({ token }: { token: string }) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const submitting = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting.current) return
    submitting.current = true
    setSending(true)
    try {
      const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim() }),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        const text = await response.text()
        let message = `Đặt lại mật khẩu thất bại (HTTP ${response.status}).`
        try {
          const body: unknown = JSON.parse(text)
          if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') message = body.message
        } catch { if (text && !text.trimStart().startsWith('<')) message = text.slice(0, 300) }
        throw new Error(message)
      }
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Yêu cầu đặt lại mật khẩu thành công.' } }))
      setEmail('')
    } catch (error) {
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message: error instanceof Error ? error.message : 'Không thể gửi yêu cầu đặt lại mật khẩu.' } }))
    } finally {
      submitting.current = false
      setSending(false)
    }
  }

  return <section className="register">
    <form className="register__form" onSubmit={handleSubmit}>
      <h1>Đặt lại mật khẩu</h1>
      <label>Nhập email<input type="email" name="email" autoComplete="email" required disabled={sending} value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <button type="submit" disabled={sending} aria-busy={sending}>{sending ? 'Đang gửi...' : 'Gửi'}</button>
    </form>
  </section>
}
