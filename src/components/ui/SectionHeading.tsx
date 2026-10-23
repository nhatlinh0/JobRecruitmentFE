import type { ReactNode } from 'react'
import './SectionHeading.css'

interface SectionHeadingProps {
  kicker: string
  title: ReactNode
  description?: string
  action?: ReactNode
}

export function SectionHeading({ kicker, title, description, action }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}
