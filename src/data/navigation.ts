import { slugify } from '../utils/slugify'

export interface NavItem {
  label: string
  href: string
}
export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const NAV_PREVIEW_LIMIT = 20

export const companyIndustries = [
  'Game',
  'Tài chính - Ngân hàng',
  'Phần mềm',
  'Kinh doanh - Bán hàng',
  'Thương mại điện tử',
  'Giáo dục - Đào tạo',
  'Y tế - Sức khỏe',
  'Viễn thông',
  'Logistics - Vận tải',
  'Marketing - Truyền thông',
] as const

export const navItems: NavItem[] = [{ label: 'Tìm việc làm', href: '#jobs' }]

type FilterParam = 'field' | 'q'

function filterLink(param: FilterParam, value: string): NavItem {
  return { label: value, href: `/?${param}=${encodeURIComponent(value)}#jobs` }
}

function skillLink(value: string): NavItem {
  return { label: value, href: `/skills/${slugify(value)}` }
}

function fieldLink(value: string): NavItem {
  return { label: value, href: `/fields/${slugify(value)}` }
}

export const navGroups: NavGroup[] = [
  {
    id: 'by-field',
    label: 'Việc làm theo chuyên môn',
    items: [
      'Backend Engineer',
      'Frontend Engineer',
      'Fullstack Engineer',
      'DevOps Engineer',
      'Mobile Engineer',
      'QA Engineer',
      'Data & AI',
      'Business Analyst',
      'Product Manager',
      'UI/UX Designer',
      'Security Engineer',
      'Project Manager',
    ].map((value) => fieldLink(value)),
  },
  {
    id: 'by-skill',
    label: 'Việc làm theo kỹ năng',
    items: [
      'Java',
      'PHP',
      'JavaScript',
      'TypeScript',
      'Python',
      'React',
      'Node.js',
      '.NET',
      'Go',
      'Kotlin',
      'AWS',
      'Docker',
    ].map((value) => skillLink(value)),
  },
  {
    id: 'by-company',
    label: 'Việc làm theo công ty',
    items: [
      'MB Bank',
      'NAVER',
      'FPT Software',
      'VNG',
      'Momo',
      'Tiki',
      'Shopee',
      'Grab',
      'Zalo',
      'VPBank',
      'Viettel',
      'VNPay',
    ].map((value) => filterLink('q', value)),
  },
]
