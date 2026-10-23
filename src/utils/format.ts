import type { SalaryRange } from '../types/job'

export function formatSalary(salary: SalaryRange | null): string {
  if (!salary) return 'Thỏa thuận'
  return `${salary.min} - ${salary.max} triệu`
}

export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoDate))
}

export function normalize(text: string): string {
  return text.trim().toLocaleLowerCase('vi')
}
