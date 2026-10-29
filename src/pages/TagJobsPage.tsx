import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { JobList } from '../components/jobs/JobList'
import { jobs } from '../data/jobs'
import { navGroups } from '../data/navigation'
import { useSavedJobs } from '../hooks/useSavedJobs'
import { slugify } from '../utils/slugify'
import './TagJobsPage.css'

const skillOptions = navGroups.find((group) => group.id === 'by-skill')?.items.map((item) => item.label) ?? []
const fieldOptions = navGroups.find((group) => group.id === 'by-field')?.items.map((item) => item.label) ?? []

function resolveLabel(slug: string, options: string[], jobValues: string[]): string {
  return [...options, ...jobValues].find((value) => slugify(value) === slug) ?? slug
}

interface TagJobsPageProps {
  kind: 'skill' | 'field'
}

function TagJobsPage({ kind }: TagJobsPageProps) {
  const { slug = '' } = useParams<{ slug: string }>()
  const { savedIds, toggleSaved } = useSavedJobs()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  const label =
    kind === 'skill'
      ? resolveLabel(slug, skillOptions, jobs.flatMap((job) => job.skills))
      : resolveLabel(slug, fieldOptions, jobs.map((job) => job.field))

  const matchedJobs = jobs.filter((job) =>
    kind === 'skill'
      ? job.skills.some((skill) => slugify(skill) === slug)
      : slugify(job.field) === slug,
  )

  const title = kind === 'skill' ? `Việc làm ${label}` : `Việc làm theo ${label}`

  return (
    <section className="tag-jobs">
      <div className="tag-jobs__heading">
        <span className="section-kicker">{kind === 'skill' ? 'KỸ NĂNG' : 'CHUYÊN MÔN'}</span>
        <h1>{title}</h1>
        <p>{matchedJobs.length} vị trí đang tuyển dụng.</p>
      </div>

      {matchedJobs.length > 0 ? (
        <JobList jobs={matchedJobs} onReset={() => {}} onToggleSave={toggleSaved} savedIds={savedIds} />
      ) : (
        <div className="tag-jobs__empty">
          <h2>Chưa có việc làm phù hợp</h2>
          <p>Hiện chưa có tin tuyển dụng nào cho {label}. Quay lại sau nhé.</p>
          <Link className="button button-primary" to="/">Khám phá việc làm khác</Link>
        </div>
      )}
    </section>
  )
}

export function SkillJobsPage() {
  return <TagJobsPage kind="skill" />
}

export function FieldJobsPage() {
  return <TagJobsPage kind="field" />
}
