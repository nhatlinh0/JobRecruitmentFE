import { useState, type FormEvent } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { navGroups } from '../data/navigation'
import { searchCandidates, type CandidateFilters } from '../data/candidates'
import './UpdateProfilePage.css'
import './JobPostListPage.css'
import './CandidateSearchPage.css'

const cities = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai', 'Hải Phòng', 'Cần Thơ', 'Bắc Ninh', 'Quảng Ninh', 'Thừa Thiên Huế']
const workTypes = ['FULL TIME', 'PART TIME', 'REMOTE', 'HYBRID', 'FLEXIBLE']
const fields = navGroups.find((group) => group.id === 'by-field')?.items ?? []
const skills = navGroups.find((group) => group.id === 'by-skill')?.items ?? []
const initialFilters: CandidateFilters = { city: '', workType: '', field: '', skills: [], salaryNegotiable: false, salary: [5, 10], experience: [1, 3] }
const PAGE_SIZE = 5

function RangeFilter({ label, unit, max, value, disabled = false, onChange }: {
  label: string; unit: string; max: number; value: [number, number]; disabled?: boolean; onChange: (value: [number, number]) => void
}) {
  return <div className="profile-field profile-field--full">
    <span>{label}</span>
    <Slider.Root aria-label={label} className={`salary-range${disabled ? ' salary-range--disabled' : ''}`} disabled={disabled} min={0} max={max} step={1} minStepsBetweenThumbs={1} preserveThumbOrder value={value} onValueChange={(values) => { if (values[0] !== undefined && values[1] !== undefined) onChange([values[0], values[1]]) }}>
      <Slider.Track className="salary-range__track"><Slider.Range className="salary-range__selected" /></Slider.Track>
      <Slider.Thumb className="salary-range__thumb salary-range__thumb--min" aria-label={`${label} tối thiểu`} />
      <Slider.Thumb className="salary-range__thumb salary-range__thumb--max" aria-label={`${label} tối đa`} />
    </Slider.Root>
    <div className="salary-range__values" aria-live="polite">
      <div className="salary-range__value-card salary-range__value-card--min"><span>TỐI THIỂU</span><strong>{disabled ? 'Thương lượng' : <>{value[0]}<small> {unit}</small></>}</strong></div>
      <span className="salary-range__separator">đến</span>
      <div className="salary-range__value-card salary-range__value-card--max"><span>TỐI ĐA</span><strong>{disabled ? 'Thương lượng' : <>{value[1]}<small> {unit}</small></>}</strong></div>
    </div>
  </div>
}

export function CandidateSearchPage() {
  const [draft, setDraft] = useState<CandidateFilters>(initialFilters)
  const [filters, setFilters] = useState<CandidateFilters | null>(null)
  const [requestedPage, setRequestedPage] = useState(0)
  const [previewId, setPreviewId] = useState<number | null>(null)
  const result = searchCandidates(filters, requestedPage, PAGE_SIZE)
  const preview = result.content.find((candidate) => candidate.id === previewId)

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFilters({ ...draft, skills: [...draft.skills] })
    setRequestedPage(0)
    setPreviewId(null)
  }

  function changePage(page: number) {
    setRequestedPage(page)
    setPreviewId(null)
  }

  return <section className="profile-update candidate-search">
    <div className="profile-update__heading"><span className="section-kicker">NHÀ TUYỂN DỤNG</span><h1>Tìm kiếm ứng viên</h1><p>Chọn tiêu chí để tìm ứng viên phù hợp với công việc.</p></div>
    <form className="profile-form" onSubmit={handleSearch}>
      <div className="profile-form__section"><h2>Thông tin công việc</h2><div className="profile-form__grid">
        <label className="profile-field"><span>Thành phố</span><select value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })}><option value="">Tất cả thành phố</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
        <label className="profile-field"><span>Hình thức làm việc</span><select value={draft.workType} onChange={(event) => setDraft({ ...draft, workType: event.target.value })}><option value="">Tất cả hình thức</option>{workTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
      </div></div>
      <div className="profile-form__section"><h2>Mong muốn công việc</h2>
        <label className="profile-checkbox"><input type="checkbox" checked={draft.salaryNegotiable} onChange={(event) => setDraft({ ...draft, salaryNegotiable: event.target.checked })} /><span>Lương có thể thương lượng</span><small>Bỏ giới hạn khoảng lương khi tìm ứng viên.</small></label>
        <div className="profile-form__grid profile-form__grid--ranges">
          <RangeFilter label="Khoảng lương" unit="triệu" max={100} value={draft.salary} disabled={draft.salaryNegotiable} onChange={(salary) => setDraft({ ...draft, salary })} />
          <RangeFilter label="Khoảng kinh nghiệm" unit="năm" max={10} value={draft.experience} onChange={(experience) => setDraft({ ...draft, experience })} />
        </div>
      </div>
      <div className="profile-form__section"><h2>Chuyên môn và kỹ năng</h2><div className="profile-form__grid">
        <label className="profile-field"><span>Chuyên môn</span><select value={draft.field} onChange={(event) => setDraft({ ...draft, field: event.target.value })}><option value="">Tất cả chuyên môn</option>{fields.map((field) => <option key={field.label}>{field.label}</option>)}</select></label>
        <div className="profile-field"><label htmlFor="candidate-skills">Kỹ năng (tối đa 10)</label><select id="candidate-skills" value="" disabled={draft.skills.length >= 10} onChange={(event) => { const skill = event.target.value; if (skill && !draft.skills.includes(skill)) setDraft({ ...draft, skills: [...draft.skills, skill] }) }}><option value="">Chọn kỹ năng</option>{skills.filter((skill) => !draft.skills.includes(skill.label)).map((skill) => <option key={skill.label}>{skill.label}</option>)}</select>
          <div className="skill-chips">{draft.skills.map((skill) => <span className="skill-chip" key={skill}>{skill}<button className="skill-chip__remove" type="button" aria-label={`Xóa kỹ năng ${skill}`} onClick={() => setDraft({ ...draft, skills: draft.skills.filter((item) => item !== skill) })}>×</button></span>)}</div>
          <span className="profile-form__hint">Đã chọn {draft.skills.length}/10 kỹ năng. Ứng viên cần có đủ các kỹ năng đã chọn.</span>
        </div>
      </div></div>
      <div className="profile-form__actions"><button className="button button-primary profile-form__submit" type="submit">Tìm ứng viên</button></div>
    </form>
    <section className="candidate-search__results" aria-labelledby="candidate-results">
      <h2 id="candidate-results">Ứng viên phù hợp</h2>
      <p role="status">{filters ? `${result.totalElements} ứng viên phù hợp` : 'Danh sách ứng viên mẫu. Bấm Tìm ứng viên để áp dụng bộ lọc.'}</p>
      <div className="post-list__card"><table className="post-table"><thead><tr><th scope="col">STT</th><th scope="col">ID</th><th scope="col">Tên</th><th scope="col">Email</th><th scope="col">Thao tác</th></tr></thead><tbody>
        {result.content.map((candidate, index) => <tr key={candidate.id}><td>{result.page * result.size + index + 1}</td><td>#{candidate.id}</td><td className="post-table__title">{candidate.name}</td><td>{candidate.email}</td><td><button className="button button-outline" type="button" aria-expanded={previewId === candidate.id} aria-controls="candidate-cv" onClick={() => setPreviewId(previewId === candidate.id ? null : candidate.id)}>Xem CV</button></td></tr>)}
        {result.content.length === 0 && <tr><td className="post-table__empty" colSpan={5}>Không tìm thấy ứng viên phù hợp với bộ lọc.</td></tr>}
      </tbody></table>
      <nav className="post-pagination" aria-label="Phân trang ứng viên"><span className="post-pagination__info">Trang {result.totalPages ? result.page + 1 : 0}/{result.totalPages} · Tổng {result.totalElements} ứng viên</span><div className="post-pagination__buttons"><button type="button" disabled={result.page === 0} onClick={() => changePage(result.page - 1)}>← Trước</button>{Array.from({ length: result.totalPages }, (_, page) => <button key={page} type="button" aria-label={`Trang ${page + 1}`} aria-current={page === result.page ? 'page' : undefined} className={page === result.page ? 'is-active' : ''} onClick={() => changePage(page)}>{page + 1}</button>)}<button type="button" disabled={result.isLast} onClick={() => changePage(result.page + 1)}>Sau →</button></div></nav>
      </div>
      <div id="candidate-cv" hidden={!preview}>{preview && <article className="profile-form candidate-search__cv"><h2>Hồ sơ mẫu — {preview.name}</h2><p>{preview.email}</p><p>{preview.field} · {preview.city} · {preview.workType}</p><p>Kinh nghiệm: {preview.experience} năm · Lương mong muốn: {preview.salary} triệu</p><p>Kỹ năng: {preview.skills.join(', ')}</p><p>Chưa có tệp CV đính kèm. Tệp CV sẽ được lấy từ API sau.</p><button className="button button-outline" type="button" onClick={() => setPreviewId(null)}>Đóng</button></article>}</div>
    </section>
  </section>
}
