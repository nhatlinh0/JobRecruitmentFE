import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { publicNavGroups } from '../data/navigation'
import { fetchPublicNavigation, publicItemHref, type PublicNavItem } from '../services/publicNavigation'
import './NavGroupPage.css'

export function NavGroupPage() {
  const { groupId } = useParams()
  const group = publicNavGroups.find((g) => g.id === groupId)
  const [result, setResult] = useState<{ id: string; items: PublicNavItem[]; error: string } | null>(null)
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    if (!group) return
    const controller = new AbortController()
    window.scrollTo(0, 0)
    fetchPublicNavigation(group.endpoint, controller.signal).then((items) => {
      if (!controller.signal.aborted) setResult({ id: group.id, items, error: '' })
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setResult({ id: group.id, items: [], error: error instanceof Error ? error.message : 'Không thể tải danh mục.' })
    })
    return () => controller.abort()
  }, [group, retry])
  const data = result && result.id === groupId ? result : null

  if (!group) {
    return (
      <div className="nav-group-page">
        <h1>Không tìm thấy danh mục</h1>
        <Link to="/">Về trang chủ</Link>
      </div>
    )
  }

  return (
    <div className="nav-group-page">
      <Link className="nav-group-page__back" to="/">← Trang chủ</Link>
      <h1>{group.label}</h1>
      {!data && <p role="status">Đang tải danh mục...</p>}
      {data?.error && <div role="alert">{data.error} <button type="button" onClick={() => { setResult(null); setRetry((value) => value + 1) }}>Thử lại</button></div>}
      {data && !data.error && <p>{data.items.length} mục</p>}
      <ul className="nav-group-page__grid">
        {data?.items.map((item) => (
          <li key={item.id}>
            {publicItemHref(group.id, item) ? <Link to={publicItemHref(group.id, item)!} state={{ label: item.label }}>{item.label}</Link> : <span className="nav-group-page__item">{item.label}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
