import { Link, useParams } from 'react-router-dom'
import { navGroups } from '../data/navigation'
import './NavGroupPage.css'

export function NavGroupPage() {
  const { groupId } = useParams()
  const group = navGroups.find((g) => g.id === groupId)

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
      <p>{group.items.length} mục</p>
      <ul className="nav-group-page__grid">
        {group.items.map((item) => (
          <li key={item.href}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </div>
  )
}
