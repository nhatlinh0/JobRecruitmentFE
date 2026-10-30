export type StaffStatus = 'ACTIVE' | 'SUSPENDED'

export interface Staff {
  id: number
  email: string
  username: string
  status: StaffStatus
}

export interface StaffPage {
  content: Staff[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  isLast: boolean
}

// Giả lập response server; số trang bắt đầu từ 0.
export function getStaffPage(people: Staff[], page: number, size: number): StaffPage {
  const totalElements = people.length
  const totalPages = Math.ceil(totalElements / size)
  const currentPage = Math.max(0, Math.min(page, totalPages - 1))
  return {
    content: people.slice(currentPage * size, (currentPage + 1) * size),
    page: currentPage,
    size,
    totalElements,
    totalPages,
    isLast: currentPage >= totalPages - 1,
  }
}

// Dữ liệu mẫu, thay bằng danh sách nhân sự từ API sau.
export const staff: Staff[] = [
  { id: 1, email: 'minhanh@example.com', username: 'nguyenminhanh', status: 'ACTIVE' },
  { id: 2, email: 'hoangnam@example.com', username: 'tranhoangnam', status: 'ACTIVE' },
  { id: 3, email: 'thuha@example.com', username: 'lethuha', status: 'SUSPENDED' },
  { id: 4, email: 'duchuy@example.com', username: 'phamduchuy', status: 'ACTIVE' },
  { id: 5, email: 'ngocmai@example.com', username: 'dangngocmai', status: 'SUSPENDED' },
  { id: 6, email: 'quangminh@example.com', username: 'vuquangminh', status: 'ACTIVE' },
  { id: 7, email: 'haiyen@example.com', username: 'dohaiyen', status: 'ACTIVE' },
]
