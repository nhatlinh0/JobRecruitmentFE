import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Icon } from '../components/ui/Icon'
import { fetchPackages, type CreditPackage } from '../services/packages'
import { createVnpayPayment } from '../services/payments'
import './UpgradePackagesPage.css'

export function UpgradePackagesPage() {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'RECRUIT') return <Navigate to="/" replace />
  return <PackagesContent key={token} token={token} />
}

function PackagesContent({ token }: { token: string }) {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [selected, setSelected] = useState<CreditPackage | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    fetchPackages(token, controller.signal).then((items) => {
      if (!controller.signal.aborted) setPackages(items)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải các gói credit.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, retry])
  const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
  return <section className="upgrade-packages">
    <header className="upgrade-packages__heading"><div><span className="section-kicker">DÀNH CHO NHÀ TUYỂN DỤNG</span><h1>Thêm credit.<br /><em>Thêm cơ hội tiếp cận.</em></h1><p>Chọn gói phù hợp để đưa công việc nổi bật đến gần ứng viên hơn.</p></div><span className="upgrade-packages__symbol" aria-hidden="true"><Icon name="spark" /></span></header>
    <div className="upgrade-packages__section-title"><h2>Các gói credit</h2><span>Lựa chọn theo nhu cầu tuyển dụng</span></div>
    {loading ? <p role="status">Đang tải các gói credit...</p> : error ? <div className="upgrade-packages__notice" role="alert">{error} <button className="button button-outline" type="button" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></div> : packages.length ? <div className="upgrade-packages__grid">{packages.map((item) => <article className="credit-package" key={item.id}>
      <div className="credit-package__top"><span className="credit-package__icon"><Icon name="spark" /></span><span className="credit-package__tag">GÓI CREDIT</span></div><h2>{item.name}</h2>
      <p className="credit-package__credits"><strong>{new Intl.NumberFormat('vi-VN').format(item.credits)}</strong><span>credits</span></p>
      <p className="credit-package__description">{item.description || 'Gói credit dành cho nhà tuyển dụng.'}</p>
      <div className="credit-package__price"><span>Giá gói</span><strong>{currency.format(item.price)}</strong></div>
      <button type="button" className="credit-package__buy" onClick={() => setSelected(item)}>Mua gói <Icon name="arrow" /></button>
    </article>)}</div> : <p className="upgrade-packages__notice">Hiện chưa có gói credit nào.</p>}
    {selected && <PurchasePreview token={token} item={selected} onClose={() => setSelected(null)} />}
  </section>
}

function PurchasePreview({ token, item, onClose }: { token: string; item: CreditPackage; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const submitting = useRef(false)
  const request = useRef<AbortController | null>(null)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { request.current?.abort(); dialog.close(); document.body.style.overflow = previous }
  }, [])
  function close() { if (!submitting.current) onClose() }
  async function pay() {
    if (submitting.current) return
    submitting.current = true; setPaying(true); setError('')
    const controller = new AbortController()
    request.current = controller
    try {
      const url = await createVnpayPayment(token, item.id, controller.signal)
      if (!controller.signal.aborted) window.location.assign(url)
    } catch (error) {
      if (controller.signal.aborted) return
      const message = error instanceof Error ? error.message : 'Không thể kết nối VNPay. Vui lòng thử lại.'
      setError(message)
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message } }))
      submitting.current = false; setPaying(false)
    }
  }
  return <dialog className="package-purchase" ref={ref} aria-labelledby="package-purchase-title" aria-busy={paying} onCancel={(event) => { event.preventDefault(); close() }} onClick={(event) => { if (event.target === event.currentTarget) close() }}>
    <header><h2 id="package-purchase-title">Thông tin gói đã chọn</h2><button type="button" aria-label="Đóng" disabled={paying} onClick={close}>×</button></header>
    <div className="package-purchase__body"><h3>{item.name}</h3><p>{item.description}</p><dl><div><dt>Số credits</dt><dd>{new Intl.NumberFormat('vi-VN').format(item.credits)}</dd></div><div><dt>Giá gói</dt><dd>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(item.price)}</dd></div></dl><p>Bạn sẽ được chuyển đến VNPay để thanh toán.</p>{error && <p className="package-purchase__notice" role="alert">{error}</p>}<button type="button" className="credit-package__buy" disabled={paying} onClick={pay}>{paying ? 'Đang chuyển đến VNPay...' : 'Thanh toán qua VNPay'}<Icon name="arrow" /></button><button type="button" className="package-purchase__back" disabled={paying} onClick={close}>Quay lại chọn gói</button></div>
  </dialog>
}
