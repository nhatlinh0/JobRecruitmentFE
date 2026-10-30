import { useState } from 'react'
import { getStaffPage, staff, type StaffStatus } from '../data/staff'
import './JobPostListPage.css'
import './StaffListPage.css'

const statusInfo: Record<StaffStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Hoạt động', className: 'is-open' },
  SUSPENDED: { label: 'Tạm ngưng', className: 'is-expiring' },
}

const PAGE_SIZE = 5

export function StaffListPage() {
  const [people, setPeople] = useState(staff)
  const [draftStatuses, setDraftStatuses] = useState<Record<number, StaffStatus>>({})
  const [message, setMessage] = useState('')
  const [requestedPage, setRequestedPage] = useState(0)
  const { content, page, size, totalElements, totalPages, isLast } = getStaffPage(people, requestedPage, PAGE_SIZE)

  function saveStatus(id: number) {
    const person = people.find((item) => item.id === id)
    const nextStatus = draftStatuses[id]
    if (!person || !nextStatus || nextStatus === person.status) return

    setPeople((current) => current.map((item) => item.id === id ? { ...item, status: nextStatus } : item))
    setMessage(`Đã lưu trạng thái ${statusInfo[nextStatus].label.toLowerCase()} cho ${person.username} trong dữ liệu mẫu. Thay đổi chưa được lưu lên server.`)
  }

  return (
    <section className="post-list">
      <div className="post-list__heading">
        <span className="section-kicker">QUẢN LÝ CÔNG TY</span>
        <h1>Danh sách nhân sự</h1>
        <p>{totalElements} nhân sự · Dữ liệu mẫu.</p>
      </div>
      {message && <p className="staff-list__message" role="status">{message}</p>}
      <div className="post-list__card">
        <table className="post-table">
          <thead>
            <tr>
              <th scope="col">STT</th>
              <th scope="col">ID</th>
              <th scope="col">Email</th>
              <th scope="col">Tên người dùng</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {content.map((person, index) => {
              const status = statusInfo[person.status]
              const draftStatus = draftStatuses[person.id] ?? person.status
              return (
                <tr key={person.id}>
                  <td>{page * size + index + 1}</td>
                  <td className="post-table__id">#{person.id}</td>
                  <td>{person.email}</td>
                  <td className="post-table__title">{person.username}</td>
                  <td><span className={`post-status ${status.className}`}>{status.label}</span></td>
                  <td>
                    <div className="post-actions staff-list__actions">
                      <select
                        aria-label={`Trạng thái của ${person.username}`}
                        value={draftStatus}
                        onChange={(event) => {
                          const value = event.target.value
                          if (value === 'ACTIVE' || value === 'SUSPENDED') {
                            setDraftStatuses((current) => ({ ...current, [person.id]: value }))
                            setMessage('')
                          }
                        }}
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="SUSPENDED">Tạm ngưng</option>
                      </select>
                      <button
                        className="staff-list__save"
                        aria-label={`Lưu trạng thái của ${person.username}`}
                        disabled={draftStatus === person.status}
                        onClick={() => saveStatus(person.id)}
                        type="button"
                      >Lưu</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {people.length === 0 && <tr><td className="post-table__empty" colSpan={6}>Chưa có nhân sự nào.</td></tr>}
          </tbody>
        </table>
        <nav className="post-pagination" aria-label="Phân trang danh sách nhân sự">
          <span className="post-pagination__info">
            Trang {totalPages === 0 ? 0 : page + 1}/{totalPages} · Tổng {totalElements} nhân sự
          </span>
          <div className="post-pagination__buttons">
            <button disabled={page === 0} onClick={() => setRequestedPage(page - 1)} type="button">← Trước</button>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                aria-label={`Trang ${index + 1}`}
                aria-current={index === page ? 'page' : undefined}
                className={index === page ? 'is-active' : ''}
                key={index}
                onClick={() => setRequestedPage(index)}
                type="button"
              >{index + 1}</button>
            ))}
            <button disabled={isLast} onClick={() => setRequestedPage(page + 1)} type="button">Sau →</button>
          </div>
        </nav>
      </div>
    </section>
  )
}
