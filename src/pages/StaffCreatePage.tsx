import { useState, type FormEvent } from 'react'
import type { CreateStaffPayload } from '../types/auth'
import './RegisterPage.css'

export function StaffCreatePage() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập.')
      return
    }

    const payload: CreateStaffPayload = {
      email: email.trim(),
      username: username.trim(),
      role: 'RECRUIT',
    }
    console.log('Thông tin nhân sự mới:', payload)
    setMessage('Thông tin đã được kiểm tra. Chức năng thêm nhân sự chưa được kết nối API.')
  }

  return (
    <section className="register">
      <form className="register__form" onSubmit={handleSubmit}>
        <h1>Thêm nhân sự</h1>
        <label>
          Email
          <input autoComplete="email" name="email" type="email" value={email} onChange={(event) => { setEmail(event.target.value); setMessage('') }} required />
        </label>
        <label>
          Tên đăng nhập
          <input autoComplete="username" name="username" value={username} onChange={(event) => { setUsername(event.target.value); setError(''); setMessage('') }} required />
        </label>
        {error && <p className="register__hint" role="alert">{error}</p>}
        {message && <p className="register__hint" role="status">{message}</p>}
        <button type="submit">Thêm nhân sự</button>
      </form>
    </section>
  )
}
