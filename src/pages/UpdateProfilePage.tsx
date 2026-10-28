import { useState, type FormEvent } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { navGroups } from '../data/navigation'
import { FilePreview } from '../components/FilePreview'
import { useFilePicker } from '../hooks/useFilePicker'
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

const workTypes = ['FULL TIME', 'PART TIME', 'REMOTE', 'HYBRID', 'FLEXIBLE'] as const

const fields = navGroups.find((group) => group.id === 'by-field')?.items ?? []
const skills = navGroups.find((group) => group.id === 'by-skill')?.items ?? []
const MAX_SKILLS = 10

export function UpdateProfilePage() {
  const [username, setUsername] = useState('')
  const [salaryNegotiable, setSalaryNegotiable] = useState(false)
  const [[salaryMin, salaryMax], setSalaryRange] = useState<[number, number]>([5, 10])
  const [[experienceMin, experienceMax], setExperienceRange] = useState<[number, number]>([1, 3])
  const [city, setCity] = useState('')
  const [workType, setWorkType] = useState('')
  const [field, setField] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const { file: cv, url: cvUrl, pick: pickCv } = useFilePicker()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (selectedSkills.length === 0) {
      setError('Vui lòng chọn ít nhất một kỹ năng.')
      return
    }

    if (cv && cv.size > 10 * 1024 * 1024) {
      setError('Tệp CV vượt quá dung lượng tối đa 10 MB.')
      return
    }

    if (cv && cv.type !== 'application/pdf' && !cv.type.startsWith('image/')) {
      setError('CV phải là tệp ảnh hoặc PDF.')
      return
    }

    const salaryMinimum = salaryMin
    const salaryMaximum = salaryMax
    const profile = {
      username,
      salaryNegotiable,
      salaryMin: salaryNegotiable ? null : salaryMinimum,
      salaryMax: salaryNegotiable ? null : salaryMaximum,
      city,
      experienceMin,
      experienceMax,
      workType,
      cv,
      field,
      skills: selectedSkills,
    }

    console.log('Thông tin hồ sơ cập nhật:', profile)
    setSuccess('Thông tin đã được kiểm tra. Chức năng cập nhật API chưa được kết nối.')
  }

  return (
    <section className="profile-update">
      <div className="profile-update__heading">
        <span className="section-kicker">HỒ SƠ ỨNG VIÊN</span>
        <h1>Cập nhật thông tin</h1>
        <p>Hoàn thiện hồ sơ để nhà tuyển dụng tìm thấy bạn phù hợp hơn.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
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
                  <option key={type} value={type}>{type}</option>
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
                  max={100}
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
                max={10}
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
              <select onChange={(event) => setField(event.target.value)} required value={field}>
                <option value="">Chọn chuyên môn</option>
                {fields.map((item) => (
                  <option key={item.label} value={item.label}>{item.label}</option>
                ))}
              </select>
            </label>

            <div className="profile-field">
              <span>Kỹ năng <b>*</b> (tối đa {MAX_SKILLS})</span>
              <select
                disabled={selectedSkills.length >= MAX_SKILLS}
                onChange={(event) => {
                  const value = event.target.value
                  if (value && !selectedSkills.includes(value)) {
                    setSelectedSkills([...selectedSkills, value])
                  }
                  event.target.value = ''
                }}
                value=""
              >
                <option value="">
                  {selectedSkills.length >= MAX_SKILLS ? 'Đã chọn tối đa' : 'Chọn kỹ năng'}
                </option>
                {skills
                  .filter((item) => !selectedSkills.includes(item.label))
                  .map((item) => (
                    <option key={item.label} value={item.label}>{item.label}</option>
                  ))}
              </select>
              {selectedSkills.length > 0 && (
                <div className="skill-chips">
                  {selectedSkills.map((item) => (
                    <span className="skill-chip" key={item}>
                      {item}
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
            </div>
          </div>
        </div>

        <div className="profile-form__section">
          <h2>CV / hồ sơ đính kèm</h2>
          <label className="profile-file">
            <input
              accept="image/*,.pdf,application/pdf"
              onChange={pickCv}
              type="file"
            />
            <span className="profile-file__button">Chọn tệp</span>
            <span className="profile-file__name">{cv?.name ?? 'Chưa chọn tệp'}</span>
          </label>
          <FilePreview file={cv} url={cvUrl} variant="document" />
          <p className="profile-form__hint">Chấp nhận tệp ảnh hoặc PDF, dung lượng tối đa 10 MB.</p>
        </div>

        {error && <p className="profile-form__message profile-form__message--error" role="alert">{error}</p>}
        {success && <p className="profile-form__message profile-form__message--success" role="status">{success}</p>}

        <div className="profile-form__actions">
          <button className="button button-primary profile-form__submit" type="submit">Lưu thông tin</button>
        </div>
      </form>
    </section>
  )
}
