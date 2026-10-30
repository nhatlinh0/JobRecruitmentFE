import './Pagination.css'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  label: string
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, totalElements, label, onChange }: PaginationProps) {
  return <nav className="pagination" aria-label={`Phân trang ${label}`}>
    <span>Trang {totalPages ? page + 1 : 0}/{totalPages} · Tổng {totalElements} {label}</span>
    <div className="pagination__buttons">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)}>← Trước</button>
      {Array.from({ length: totalPages }, (_, index) => <button key={index} type="button" aria-label={`Trang ${index + 1}`} aria-current={index === page ? 'page' : undefined} className={index === page ? 'is-active' : ''} onClick={() => onChange(index)}>{index + 1}</button>)}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Sau →</button>
    </div>
  </nav>
}
