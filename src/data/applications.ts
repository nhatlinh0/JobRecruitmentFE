export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface Application {
  id: number
  jobId: number
  senderName: string
  email: string
  submittedAt: string
  status: ApplicationStatus
  introduction: string
}

export interface ApplicationsPage {
  content: Application[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  isLast: boolean
}

// Giả lập response phân trang của server; page bắt đầu từ 0.
export function getApplicationsPage(
  jobId: number,
  page: number,
  size: number,
  statusFilter: 'all' | ApplicationStatus = 'all',
  statuses: Record<number, ApplicationStatus> = {},
): ApplicationsPage {
  const matches = applications
    .filter((application) => application.jobId === jobId)
    .map((application) => ({ ...application, status: statuses[application.id] ?? application.status }))
    .filter((application) => statusFilter === 'all' || application.status === statusFilter)
  const totalElements = matches.length
  const totalPages = Math.ceil(totalElements / size)
  const currentPage = Math.max(0, Math.min(page, totalPages - 1))
  return {
    content: matches.slice(currentPage * size, (currentPage + 1) * size),
    page: currentPage,
    size,
    totalElements,
    totalPages,
    isLast: currentPage >= totalPages - 1,
  }
}

// Dữ liệu mẫu để trình bày giao diện trước khi kết nối API.
export const applications: Application[] = [
  { id: 101, jobId: 1, senderName: 'Nguyễn Minh Anh', email: 'minhanh@example.com', submittedAt: '2026-10-28', status: 'pending', introduction: 'Tôi có 3 năm kinh nghiệm phát triển giao diện với React và TypeScript, mong muốn được trao đổi thêm về vị trí này.' },
  { id: 102, jobId: 1, senderName: 'Trần Hoàng Nam', email: 'hoangnam@example.com', submittedAt: '2026-10-27', status: 'approved', introduction: 'Tôi có kinh nghiệm xây dựng ứng dụng web và làm việc trong đội ngũ Agile.' },
  { id: 103, jobId: 1, senderName: 'Lê Thu Hà', email: 'thuha@example.com', submittedAt: '2026-10-26', status: 'rejected', introduction: 'Tôi quan tâm đến sản phẩm của công ty và mong muốn đóng góp kỹ năng phát triển frontend.' },
  { id: 104, jobId: 2, senderName: 'Phạm Đức Huy', email: 'duchuy@example.com', submittedAt: '2026-10-29', status: 'pending', introduction: 'Tôi có kinh nghiệm phát triển API bằng Node.js và làm việc với PostgreSQL.' },
  { id: 105, jobId: 1, senderName: 'Vũ Quang Minh', email: 'quangminh@example.com', submittedAt: '2026-10-25', status: 'pending', introduction: 'Tôi có kinh nghiệm xây dựng giao diện responsive bằng React.' },
  { id: 106, jobId: 1, senderName: 'Đặng Ngọc Mai', email: 'ngocmai@example.com', submittedAt: '2026-10-24', status: 'pending', introduction: 'Tôi mong muốn ứng tuyển và trao đổi thêm về công việc.' },
  { id: 107, jobId: 1, senderName: 'Bùi Thanh Tùng', email: 'thanhtung@example.com', submittedAt: '2026-10-23', status: 'approved', introduction: 'Tôi có kinh nghiệm với TypeScript và tối ưu hiệu năng ứng dụng web.' },
  { id: 108, jobId: 1, senderName: 'Đỗ Hải Yến', email: 'haiyen@example.com', submittedAt: '2026-10-22', status: 'pending', introduction: 'Tôi quan tâm đến vị trí frontend và môi trường làm việc tại công ty.' },
]
