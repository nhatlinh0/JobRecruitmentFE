export type IconName =
  | 'arrow'
  | 'bookmark'
  | 'briefcase'
  | 'calendar'
  | 'chevron'
  | 'code'
  | 'laptop'
  | 'location'
  | 'menu'
  | 'search'
  | 'spark'
  | 'trend'

const iconPaths: Record<IconName, string> = {
  arrow: 'M7 17 17 7M7 7h10v10',
  bookmark: 'M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-4-6 4V4.75Z',
  briefcase: 'M3 8.5h18v11H3zM8 8.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2.5M3 12h18m-11 0v2h4v-2',
  calendar: 'M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  chevron: 'm7 10 5 5 5-5',
  code: 'm8 8-4 4 4 4m8-8 4 4-4 4m-3-11-2 14',
  laptop: 'M5 6h14v9H5zM2 19h20',
  location: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-8 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  search: 'm20 20-4.5-4.5M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z',
  spark: 'm12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z',
  trend: 'm3 17 6-6 4 4 8-9m-6 0h6v6',
}

interface IconProps {
  name: IconName
  className?: string
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}
