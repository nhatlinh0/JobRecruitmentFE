import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import * as Slider from '@radix-ui/react-slider'
import { useAuth } from '../hooks/useAuth'
import { fetchProfileOptions, parseUserInfo, profileRequest, type ProfileOption, type UserInfoPayload } from '../services/userInfo'
import { useFilePicker } from '../hooks/useFilePicker'
import { FilePreview } from '../components/FilePreview'
import './UpdateProfilePage.css'

const cities = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Bình Dương',
  'Đồng Nai',
  'Hải Phòng',
  'Cần Thơ',
  'Bắc Ninh',
  'Quảng Ninh',
  'Thừa Thiên Huế',
]

const workTypes = ['FULL_TIME', 'PART_TIME', 'REMOTE', 'HYBRID', 'FLEXIBLE'] as const

const MAX_SKILLS = 10

export function UpdateProfilePage() {
  const { user, token } = useAuth()
  const [username, setUsername] = useState('')
  const [salaryNegotiable, setSalaryNegotiable] = useState(false)
  const [[salaryMin, salaryMax], setSalaryRange] = useState<[number, number]>([5, 10])
  const [[experienceMin, experienceMax], setExperienceRange] = useState<[number, number]>([1, 3])
  const [city, setCity] = useState('')
  const [workType, setWorkType] = useState('')
  const [field, setField] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [image, setImage] = useState('')
  const { file: cv, url: cvUrl, pick: pickCv } = useFilePicker()
  const [fields, setFields] = useState<ProfileOption[]>([])
  const [skills, setSkills] = useState<ProfileOption[]>([])
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [skillsError, setSkillsError] = useState('')
  const [exists, setExists] = useState(false)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [retry, setRetry] = useState(0)
  const [skillsRetry, setSkillsRetry] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!token || user?.role !== 'USER') return
    const controller = new AbortController()
    Promise.all([
      fetchProfileOptions('domains', token, controller.signal),
      profileRequest('user-infos', token, { signal: controller.signal }).then(parseUserInfo),
    ]).then(([domains, info]) => {
      if (controller.signal.aborted) return
      setFields(info?.domain && !domains.some((domain) => domain.id === info.domain!.id) ? [...domains, info.domain] : domains)
      setExists(info !== null)
      setUsername(info?.username || user.username || '')
      setSalaryNegotiable(info?.salaryNegotiable ?? false)
      setSalaryRange([Math.round(info?.salaryMin ?? 5), Math.round(info?.salaryMax ?? 10)])
      setExperienceRange([info?.experienceMin ?? 1, info?.experienceMax ?? 3])
      setCity(info?.city ?? '')
      setWorkType(info?.workingType ?? '')
      setField(info?.domainId ? String(info.domainId) : '')
      setSelectedSkills(info?.skill_ids ?? [])
      setSkills(info?.skills ?? [])
      setSkillsLoading(Boolean(info?.domainId))
      setSkillsError('')
      setImage(info?.image ?? '')
      setReady(true)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Không thể tải hồ sơ.')
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, user?.role, user?.username, retry])

  useEffect(() => {
    if (!token || !field || user?.role !== 'USER') return
    const controller = new AbortController()
    fetchProfileOptions(`domains/${field}`, token, controller.signal).then((options) => {
      if (!controller.signal.aborted) {
        setSkills(options)
        setSelectedSkills((current) => current.filter((id) => options.some((item) => item.id === id)))
      }
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) setSkillsError(error instanceof Error ? error.message : 'Không thể tải kỹ năng.')
    }).finally(() => { if (!controller.signal.aborted) setSkillsLoading(false) })
    return () => controller.abort()
  }, [field, token, user?.role, skillsRetry])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token || !ready || savingRef.current || skillsLoading || skillsError) return
    if (!username.trim()) { setError('Vui lòng nhập họ tên.'); return }
    if (!salaryNegotiable && salaryMin >= salaryMax) {
      setError('Lương tối thiểu phải nhỏ hơn lương tối đa.')
      return
    }
    if (experienceMin >= experienceMax) {
      setError('Kinh nghiệm tối thiểu phải nhỏ hơn kinh nghiệm tối đa.')
      return
    }
    if (cv) {
      if (cv.type !== 'application/pdf' && !cv.type.startsWith('image/')) { setError('CV phải là tệp ảnh hoặc PDF.'); return }
      if (cv.size > 10 * 1024 * 1024) { setError('Tệp CV vượt quá dung lượng tối đa 10 MB.'); return }
    }
    if (!field || selectedSkills.length === 0) {
      setError('Vui lòng chọn ít nhất một kỹ năng.')
      return
    }

    const profile: UserInfoPayload = {
      username: username.trim(),
      salaryNegotiable,
      salaryMin: salaryNegotiable ? null : salaryMin,
      salaryMax: salaryNegotiable ? null : salaryMax,
      city,
      experienceMin,
      experienceMax,
      workingType: workType,
      // Đường dẫn demo; thay bằng URL cloud do server trả về khi có API upload.
      image: '/demo/cv/sample.pdf',
      domainId: Number(field),
      skill_ids: selectedSkills,
    }

    savingRef.current = true
    setSaving(true)
    try {
      await profileRequest('user-infos', token, { method: exists ? 'PUT' : 'POST', body: JSON.stringify(profile) })
      setExists(true)
      setSuccess('Đã lưu thông tin hồ sơ. Trường image sử dụng đường dẫn demo cố định.')
    } catch (error) { setError(error instanceof Error ? error.message : 'Không thể lưu hồ sơ.') }
    finally { savingRef.current = false; setSaving(false) }
  }

  if (!token) return <Navigate to="/login" replace />
  if (!user || !user.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'USER') return <Navigate to="/" replace />

  return (
    <section className="profile-update">
      <div className="profile-update__heading">
        <span className="section-kicker">HỒ SƠ ỨNG VIÊN</span>
        <h1>Cập nhật thông tin</h1>
        <p>Hoàn thiện hồ sơ để nhà tuyển dụng tìm thấy bạn phù hợp hơn.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        {loading && <p role="status">Đang tải hồ sơ...</p>}
        {!loading && !ready && <><p role="alert">{error}</p><button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></>}
        <fieldset disabled={loading || !ready || saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: 'grid', gap: 24 }}>
        <div className="profile-form__section">
          <h2>Thông tin cá nhân</h2>
          <div className="profile-form__grid">
            <label className="profile-field profile-field--full">
              <span>Họ và tên <b>*</b></span>
              <input
                autoComplete="name"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Nhập họ và tên"
                required
                value={username}
              />
            </label>

            <label className="profile-field">
              <span>Thành phố <b>*</b></span>
              <select onChange={(event) => setCity(event.target.value)} required value={city}>
                <option value="">Chọn thành phố</option>
                {cities.map((cityName) => (
                  <option key={cityName} value={cityName}>{cityName}</option>
                ))}
              </select>
            </label>

            <label className="profile-field">
              <span>Hình thức làm việc <b>*</b></span>
              <select onChange={(event) => setWorkType(event.target.value)} required value={workType}>
                <option value="">Chọn hình thức</option>
                {workTypes.map((type) => (
                  <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="profile-form__section">
          <h2>Mong muốn công việc</h2>
          <label className="profile-checkbox">
            <input
              checked={salaryNegotiable}
              onChange={(event) => setSalaryNegotiable(event.target.checked)}
              type="checkbox"
            />
            <span>Lương có thể thương lượng</span>
            <small>Khi bật, thanh lương sẽ bị vô hiệu hóa và lương tối thiểu/tối đa được gửi là null.</small>
          </label>

          <div className="profile-form__grid profile-form__grid--ranges">
              <div className="profile-field profile-field--full">
                <span>Khoảng lương {!salaryNegotiable && <b>*</b>}</span>
                <Slider.Root
                  aria-label="Khoảng lương"
                  className={`salary-range${salaryNegotiable ? ' salary-range--disabled' : ''}`}
                  disabled={salaryNegotiable}
                  max={Math.max(100, salaryMax)}
                  min={0}
                  minStepsBetweenThumbs={1}
                  preserveThumbOrder
                  onValueChange={(values) => {
                    const [minimum, maximum] = values
                    if (minimum !== undefined && maximum !== undefined) {
                      setSalaryRange([minimum, maximum])
                    }
                  }}
                  step={1}
                  value={[salaryMin, salaryMax]}
                >
                  <Slider.Track className="salary-range__track">
                    <Slider.Range className="salary-range__selected" />
                  </Slider.Track>
                  <Slider.Thumb
                    aria-label="Lương tối thiểu"
                    className="salary-range__thumb salary-range__thumb--min"
                  />
                  <Slider.Thumb
                    aria-label="Lương tối đa"
                    className="salary-range__thumb salary-range__thumb--max"
                  />
                </Slider.Root>
                <div aria-live="polite" className="salary-range__values">
                  <div className="salary-range__value-card salary-range__value-card--min">
                    <span>LƯƠNG TỐI THIỂU</span>
                    <strong>
                      {salaryNegotiable ? 'Thương lượng' : <>{salaryMin}<small> triệu</small></>}
                    </strong>
                  </div>
                  <span className="salary-range__separator" aria-hidden="true">đến</span>
                  <div className="salary-range__value-card salary-range__value-card--max">
                    <span>LƯƠNG TỐI ĐA</span>
                    <strong>
                      {salaryNegotiable ? 'Thương lượng' : <>{salaryMax}<small> triệu</small></>}
                    </strong>
                  </div>
                </div>
 
                <p className="salary-range__hint">
                  {salaryNegotiable
                    ? 'Khoảng lương không áp dụng khi chọn thương lượng.'
                    : 'Kéo nút trái để đổi mức tối thiểu, nút phải để đổi mức tối đa. Hai nút không thể vượt qua nhau; lương tối đa luôn cao hơn tối thiểu.'}
                </p>
              </div>

            <div className="profile-field profile-field--full">
              <span>Khoảng kinh nghiệm <b>*</b></span>
              <Slider.Root
                aria-label="Khoảng kinh nghiệm"
                className="salary-range experience-range"
                max={Math.max(10, experienceMax)}
                min={0}
                minStepsBetweenThumbs={1}
                onValueChange={(values) => {
                  const [minimum, maximum] = values
                  if (minimum !== undefined && maximum !== undefined) {
                    setExperienceRange([minimum, maximum])
                  }
                }}
                preserveThumbOrder
                step={1}
                value={[experienceMin, experienceMax]}
              >
                <Slider.Track className="salary-range__track">
                  <Slider.Range className="salary-range__selected" />
                </Slider.Track>
                <Slider.Thumb
                  aria-label="Kinh nghiệm tối thiểu"
                  className="salary-range__thumb salary-range__thumb--min"
                />
                <Slider.Thumb
                  aria-label="Kinh nghiệm tối đa"
                  className="salary-range__thumb salary-range__thumb--max"
                />
              </Slider.Root>
              <div aria-live="polite" className="salary-range__values">
                <div className="salary-range__value-card salary-range__value-card--min">
                  <span>KINH NGHIỆM TỐI THIỂU</span>
                  <strong>{experienceMin}<small> năm</small></strong>
                </div>
                <span className="salary-range__separator" aria-hidden="true">đến</span>
                <div className="salary-range__value-card salary-range__value-card--max">
                  <span>KINH NGHIỆM TỐI ĐA</span>
                  <strong>{experienceMax}<small> năm</small></strong>
                </div>
              </div>
       
              <p className="salary-range__hint">Kéo nút trái để đổi kinh nghiệm tối thiểu, nút phải để đổi tối đa. Hai nút không thể vượt qua nhau.</p>
            </div>
          </div>
        </div>

        <div className="profile-form__section">
          <h2>Chuyên môn và kỹ năng</h2>
          <div className="profile-form__grid">
            <label className="profile-field">
              <span>Chuyên môn <b>*</b></span>
              <select onChange={(event) => { setField(event.target.value); setSelectedSkills([]); setSkills([]); setSkillsError(''); setSkillsLoading(Boolean(event.target.value)) }} required value={field}>
                <option value="">Chọn chuyên môn</option>
                {fields.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>

            <div className="profile-field">
              <span>Kỹ năng <b>*</b> (tối đa {MAX_SKILLS})</span>
              <select
                disabled={!field || skillsLoading || Boolean(skillsError) || selectedSkills.length >= MAX_SKILLS}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  if (value && !selectedSkills.includes(value)) {
                    setSelectedSkills([...selectedSkills, value])
                  }
                  event.target.value = ''
                }}
                value=""
              >
                <option value="">
                  {!field ? 'Chọn chuyên môn trước' : skillsLoading ? 'Đang tải kỹ năng...' : selectedSkills.length >= MAX_SKILLS ? 'Đã chọn tối đa' : 'Chọn kỹ năng'}
                </option>
                {skills
                  .filter((item) => !selectedSkills.includes(item.id))
                  .map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
              </select>
              {selectedSkills.length > 0 && (
                <div className="skill-chips">
                  {selectedSkills.map((item) => (
                    <span className="skill-chip" key={item}>
                      {skills.find((skill) => skill.id === item)?.name ?? `Kỹ năng #${item}`}
                      <button
                        aria-label={`Xóa kỹ năng ${item}`}
                        className="skill-chip__remove"
                        onClick={() => setSelectedSkills(selectedSkills.filter((s) => s !== item))}
                        type="button"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <span className="profile-form__hint">Đã chọn {selectedSkills.length}/{MAX_SKILLS} kỹ năng.</span>
              {skillsError && <><p role="alert">{skillsError}</p><button type="button" onClick={() => { setSkillsLoading(true); setSkillsError(''); setSkillsRetry((value) => value + 1) }}>Tải lại kỹ năng</button></>}
            </div>
          </div>
        </div>

        <div className="profile-form__section">
          <h2>CV / hồ sơ đính kèm</h2>
          <label className="profile-file">
            <input type="file" accept="image/*,.pdf,application/pdf" onChange={pickCv} />
            <span className="profile-file__button">Chọn tệp</span>
            <span className="profile-file__name">{cv?.name ?? 'Chưa chọn tệp'}</span>
          </label>
          <FilePreview file={cv} url={cvUrl} variant="document" />
          {!cv && /^https?:\/\//i.test(image) && <a href={image} target="_blank" rel="noopener noreferrer">Xem CV hiện tại</a>}
          <p className="profile-form__hint">Chấp nhận ảnh hoặc PDF, tối đa 10 MB. Khi lưu, hệ thống gửi đường dẫn CV demo; tệp chưa được upload.</p>
        </div>

        {error && <p className="profile-form__message profile-form__message--error" role="alert">{error}</p>}
        {success && <p className="profile-form__message profile-form__message--success" role="status">{success}</p>}

        <div className="profile-form__actions">
          <button className="button button-primary profile-form__submit" type="submit" disabled={saving || skillsLoading || Boolean(skillsError)}>{saving ? 'Đang lưu...' : 'Lưu thông tin'}</button>
        </div>
        </fieldset>
      </form>
    </section>
  )
}
