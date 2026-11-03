import { useCallback, useEffect, useState } from 'react'
import { Toast, type ToastMessage } from './Toast'

export function GlobalToast() {
  const [notification, setNotification] = useState<ToastMessage | null>(null)
  const close = useCallback(() => setNotification(null), [])
  useEffect(() => {
    const listener = (event: Event) => setNotification((event as CustomEvent<ToastMessage>).detail)
    window.addEventListener('app-toast', listener)
    return () => window.removeEventListener('app-toast', listener)
  }, [])
  return <Toast notification={notification} onClose={close} />
}
