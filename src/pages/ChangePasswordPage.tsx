import { useState, type FormEvent } from 'react'
import './RegisterPage.css'

export function ChangePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (password !== confirmation) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }
    setMessage('Thông tin hợp lệ. Chức năng đổi mật khẩu chưa được kết nối API.')
  }

  function clearMessages() {
    setError('')
    setMessage('')
  }

  return <section className="register">
    <form className="register__form" onSubmit={handleSubmit}>
      <h1>Đổi mật khẩu</h1>
      <label>Mật khẩu<input name="password" type="password" autoComplete="new-password" minLength={6} required value={password} onChange={(event) => { setPassword(event.target.value); clearMessages() }} /></label>
      <label>Nhập lại mật khẩu<input name="confirmation" type="password" autoComplete="new-password" minLength={6} required value={confirmation} aria-invalid={Boolean(error)} aria-describedby={error ? 'password-error' : undefined} onChange={(event) => { setConfirmation(event.target.value); clearMessages() }} /></label>
      {error && <p id="password-error" className="register__hint" role="alert">{error}</p>}
      {message && <p className="register__hint" role="status">{message}</p>}
      <button type="submit">Lưu</button>
    </form>
  </section>
}
