import { useCallback, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Toast, type ToastMessage } from '../components/ui/Toast'
import './RegisterPage.css'

export function ChangePasswordPage() {
  const { token } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [notification, setNotification] = useState<ToastMessage | null>(null)
  const closeToast = useCallback(() => setNotification(null), [])
  const [saving, setSaving] = useState(false)
  const submitting = useRef(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token || submitting.current) return
    setError('')
    setNotification(null)
    if (password !== confirmation) {
      setError('Mật khẩu nhập lại không khớp.')
      setNotification({ type: 'error', message: 'Mật khẩu xác nhận không khớp với mật khẩu mới.' })
      return
    }
    submitting.current = true
    setSaving(true)
    try {
      const response = await fetch('/api/api/v1/users/password-change', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPassword, new_password: password, confirm_password: confirmation }),
        signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        const text = await response.text()
        let detail = `Đổi mật khẩu thất bại (HTTP ${response.status}).`
        try {
          const body: unknown = JSON.parse(text)
          if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') detail = body.message
        } catch {
          if (text && !text.trimStart().startsWith('<')) detail = text.slice(0, 300)
        }
        setNotification({ type: 'error', message: detail })
        return
      }
      setCurrentPassword('')
      setPassword('')
      setConfirmation('')
      setNotification({ type: 'success', message: 'Đổi mật khẩu thành công.' })
    } catch {
      setNotification({ type: 'error', message: 'Không thể kết nối máy chủ hoặc yêu cầu đã hết thời gian chờ. Vui lòng thử lại.' })
    } finally {
      submitting.current = false
      setSaving(false)
    }
  }

  function clearMessages() {
    setError('')
  }

  if (!token) return <Navigate to="/login" replace />

  return <section className="register">
    <Toast notification={notification} onClose={closeToast} />
    <form className="register__form" onSubmit={handleSubmit}>
      <h1>Đổi mật khẩu</h1>
      <label>Mật khẩu hiện tại<input disabled={saving} name="current_password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => { setCurrentPassword(event.target.value); clearMessages() }} /></label>
      <label>Mật khẩu mới<input disabled={saving} name="new_password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => { setPassword(event.target.value); clearMessages() }} /></label>
      <label>Xác nhận mật khẩu mới<input disabled={saving} name="confirm_password" type="password" autoComplete="new-password" minLength={6} required value={confirmation} aria-invalid={password !== confirmation && Boolean(error)} aria-describedby={error ? 'password-error' : undefined} onChange={(event) => { setConfirmation(event.target.value); clearMessages() }} /></label>
      {error && <p id="password-error" className="register__hint" role="alert">{error}</p>}
      <button type="submit" disabled={saving} aria-busy={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
    </form>
  </section>
}
