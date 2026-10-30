import { ALL_FIELDS } from './job'

export interface JobFilters {
  workType: string
  field: string
  experience: [number, number]
  salary: [number, number]
  negotiable: boolean
  skills: string[]
}

export const defaultJobFilters: JobFilters = { workType: '', field: ALL_FIELDS, experience: [0, 10], salary: [0, 100], negotiable: false, skills: [] }
