export interface CandidateFilters {
  city: string
  workType: string
  field: string
  skills: string[]
  salaryNegotiable: boolean
  salary: [number, number]
  experience: [number, number]
}

export interface Candidate {
  id: number
  name: string
  email: string
  city: string
  workType: string
  field: string
  skills: string[]
  salary: number
  experience: number
}

// Hồ sơ mẫu trước khi kết nối API tìm kiếm và tải CV.
export const candidates: Candidate[] = [
  { id: 1, name: 'Nguyễn Minh Anh', email: 'minhanh@example.com', city: 'Hồ Chí Minh', workType: 'FULL TIME', field: 'Frontend Engineer', skills: ['React', 'TypeScript'], salary: 8, experience: 2 },
  { id: 2, name: 'Trần Hoàng Nam', email: 'hoangnam@example.com', city: 'Hà Nội', workType: 'REMOTE', field: 'Backend Engineer', skills: ['Java', 'Docker'], salary: 25, experience: 4 },
  { id: 3, name: 'Lê Thu Hà', email: 'thuha@example.com', city: 'Đà Nẵng', workType: 'HYBRID', field: 'Frontend Engineer', skills: ['React', 'JavaScript'], salary: 10, experience: 3 },
  { id: 4, name: 'Phạm Đức Huy', email: 'duchuy@example.com', city: 'Hà Nội', workType: 'FULL TIME', field: 'Backend Engineer', skills: ['Node.js', 'AWS'], salary: 18, experience: 3 },
  { id: 5, name: 'Đặng Ngọc Mai', email: 'ngocmai@example.com', city: 'Hồ Chí Minh', workType: 'PART TIME', field: 'Frontend Engineer', skills: ['React', 'TypeScript'], salary: 7, experience: 1 },
  { id: 6, name: 'Vũ Quang Minh', email: 'quangminh@example.com', city: 'Hà Nội', workType: 'FULL TIME', field: 'Frontend Engineer', skills: ['React', 'TypeScript'], salary: 9, experience: 2 },
  { id: 7, name: 'Đỗ Hải Yến', email: 'haiyen@example.com', city: 'Đà Nẵng', workType: 'REMOTE', field: 'Data & AI', skills: ['Python', 'AWS'], salary: 30, experience: 5 },
]

export function searchCandidates(filters: CandidateFilters | null, requestedPage: number, size: number) {
  const matches = candidates.filter((candidate) => !filters || (
    (!filters.city || candidate.city === filters.city)
    && (!filters.workType || candidate.workType === filters.workType)
    && (!filters.field || candidate.field === filters.field)
    && filters.skills.every((skill) => candidate.skills.includes(skill))
    && (filters.salaryNegotiable || (candidate.salary >= filters.salary[0] && candidate.salary <= filters.salary[1]))
    && candidate.experience >= filters.experience[0] && candidate.experience <= filters.experience[1]
  ))
  const totalElements = matches.length
  const totalPages = Math.ceil(totalElements / size)
  const page = Math.max(0, Math.min(requestedPage, totalPages - 1))
  return { content: matches.slice(page * size, (page + 1) * size), page, size, totalElements, totalPages, isLast: page >= totalPages - 1 }
}
