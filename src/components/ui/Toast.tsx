import { useEffect } from 'react'
import './Toast.css'

export interface ToastMessage {
  type: 'success' | 'error'
  message: string
}

export function Toast({ notification, onClose }: { notification: ToastMessage | null; onClose: () => void }) {
  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(onClose, 6000)
    return () => window.clearTimeout(timer)
  }, [notification, onClose])

  return <div className="toast-region" aria-live="polite" aria-atomic="true">
    {notification && <div className={`toast toast--${notification.type}`}>
      <span className="toast__icon" aria-hidden="true">{notification.type === 'success' ? '✓' : '!'}</span>
      <div><strong>{notification.type === 'success' ? 'Thành công' : 'Không thành công'}</strong><p>{notification.message}</p></div>
      <button type="button" aria-label="Đóng thông báo" onClick={onClose}>×</button>
    </div>}
  </div>
}
