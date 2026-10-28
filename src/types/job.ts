export type WorkType = 'Onsite' | 'Hybrid' | 'Remote'

export interface SalaryRange {
  min: number
  max: number
}

export interface Job {
  id: number
  title: string
  companyName: string
  companyColor: 'pink' | 'blue' | 'indigo' | 'orange' | 'green' | 'purple'
  city: string
  deadline: string
  workType: WorkType
  field: string
  skills: string[]
  salary: SalaryRange | null
  featured?: boolean
  priority?: number
  address?: string
  experience?: SalaryRange
  description?: string
  requirements?: string
  benefits?: string
  company?: {
    industry: string
    size: string
    country: string
    address?: string
    phone?: string
    description?: string
  }
}

export const ALL_FIELDS = 'Tất cả'
export const MAX_SKILLS = 6
