import { useEffect, useRef, useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { navGroups } from '../../data/navigation'
import { ALL_FIELDS, type WorkType } from '../../types/job'
import { defaultJobFilters, type JobFilters } from '../../types/jobFilters'
import '../../pages/UpdateProfilePage.css'
import './JobFilterOverlay.css'

const workTypes: WorkType[] = ['Onsite', 'Hybrid', 'Remote']

function FilterRange({ label, value, max, unit, disabled = false, onChange }: { label: string; value: [number, number]; max: number; unit: string; disabled?: boolean; onChange: (value: [number, number]) => void }) {
  return <div className="profile-field profile-field--full">
    <span>{label}</span>
    <Slider.Root className={`salary-range${disabled ? ' salary-range--disabled' : ''}`} aria-label={label} min={0} max={max} step={1} minStepsBetweenThumbs={1} preserveThumbOrder disabled={disabled} value={value} onValueChange={(values) => { if (values[0] !== undefined && values[1] !== undefined) onChange([values[0], values[1]]) }}>
      <Slider.Track className="salary-range__track"><Slider.Range className="salary-range__selected" /></Slider.Track>
      <Slider.Thumb className="salary-range__thumb salary-range__thumb--min" aria-label={`${label} tối thiểu`} /><Slider.Thumb className="salary-range__thumb salary-range__thumb--max" aria-label={`${label} tối đa`} />
    </Slider.Root>
    <div className="job-filter__range-values" aria-live="polite"><span>Tối thiểu <strong>{disabled ? 'Thỏa thuận' : `${value[0]} ${unit}`}</strong></span><span>Tối đa <strong>{disabled ? 'Thỏa thuận' : `${value[1]} ${unit}`}</strong></span></div>
  </div>
}

export function JobFilterOverlay({ value, onApply, onClose }: { value: JobFilters; onApply: (filters: JobFilters) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current!
    dialog.showModal()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous; dialog.close() }
  }, [])
  const fields = navGroups.find((group) => group.id === 'by-field')?.items ?? []
  const skills = navGroups.find((group) => group.id === 'by-skill')?.items ?? []
  return <dialog ref={ref} className="job-filter" aria-labelledby="job-filter-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <div className="job-filter__surface">
      <header className="job-filter__header"><div><span className="section-kicker">TÌM CƠ HỘI PHÙ HỢP</span><h2 id="job-filter-title">Bộ lọc việc làm</h2></div><button type="button" className="job-filter__close" aria-label="Đóng bộ lọc" onClick={onClose}>×</button></header>
      <form onSubmit={(event) => { event.preventDefault(); onApply(draft) }}>
        <div className="job-filter__body profile-form__grid">
          <label className="profile-field"><span>Hình thức làm việc</span><select value={draft.workType} onChange={(event) => setDraft({ ...draft, workType: event.target.value })}><option value="">Tất cả hình thức</option>{workTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="profile-field"><span>Lĩnh vực</span><select value={draft.field} onChange={(event) => setDraft({ ...draft, field: event.target.value })}><option value={ALL_FIELDS}>Tất cả lĩnh vực</option>{fields.map((field) => <option key={field.label}>{field.label}</option>)}</select></label>
          <FilterRange label="Khoảng kinh nghiệm" value={draft.experience} max={10} unit="năm" onChange={(experience) => setDraft({ ...draft, experience })} />
          <label className="profile-checkbox profile-field--full"><input type="checkbox" checked={draft.negotiable} onChange={(event) => setDraft({ ...draft, negotiable: event.target.checked })} /><span>Lương thỏa thuận</span><small>Chỉ hiển thị việc làm có lương thỏa thuận.</small></label>
          <FilterRange label="Khoảng lương" value={draft.salary} max={100} unit="triệu" disabled={draft.negotiable} onChange={(salary) => setDraft({ ...draft, salary })} />
          <div className="profile-field profile-field--full"><label htmlFor="job-filter-skills">Kỹ năng <small>({draft.skills.length}/6)</small></label><select id="job-filter-skills" value="" disabled={draft.skills.length >= 6} onChange={(event) => { const skill = event.target.value; if (skill && !draft.skills.includes(skill)) setDraft({ ...draft, skills: [...draft.skills, skill] }) }}><option value="">{draft.skills.length >= 6 ? 'Đã chọn tối đa 6 kỹ năng' : 'Chọn kỹ năng'}</option>{skills.filter((skill) => !draft.skills.includes(skill.label)).map((skill) => <option key={skill.label}>{skill.label}</option>)}</select><div className="skill-chips">{draft.skills.map((skill) => <span className="skill-chip" key={skill}>{skill}<button type="button" className="skill-chip__remove" aria-label={`Xóa ${skill}`} onClick={() => setDraft({ ...draft, skills: draft.skills.filter((item) => item !== skill) })}>×</button></span>)}</div></div>
        </div>
        <footer className="job-filter__footer"><button type="button" className="button button-outline" onClick={() => setDraft(defaultJobFilters)}>Đặt lại</button><button type="submit" className="button button-primary">Lọc</button></footer>
      </form>
    </div>
  </dialog>
}
