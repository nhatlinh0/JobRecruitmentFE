import { useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import * as Slider from '@radix-ui/react-slider'
import { jobs } from '../data/jobs'
import { navGroups } from '../data/navigation'
import { slugify } from '../utils/slugify'
import './JobPostViewPage.css'
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

const fields = navGroups.find((group) => group.id === 'by-field')?.items ?? []
const skills = navGroups.find((group) => group.id === 'by-skill')?.items ?? []
const MAX_SKILLS = 6

export function JobPostCreatePage() {
  const { id } = useParams<{ id: string }>()
  const editingPost = id ? jobs.find((job) => job.id === Number(id)) : undefined
  const isEdit = Boolean(editingPost)

  const [title, setTitle] = useState(editingPost?.title ?? '')
  const [address, setAddress] = useState(editingPost?.address ?? '')
  const [deadline, setDeadline] = useState(editingPost?.deadline ?? '')
  const [workType, setWorkType] = useState(editingPost?.workType.toUpperCase().replace('ONSITE', 'FULL_TIME') ?? '')
  const [description, setDescription] = useState(editingPost?.description ?? '')
  const [requirements, setRequirements] = useState(editingPost?.requirements ?? '')
  const [benefits, setBenefits] = useState(editingPost?.benefits ?? '')
  const [field, setField] = useState(editingPost?.field ?? '')
  const [city, setCity] = useState(editingPost?.city ?? '')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(editingPost?.skills ?? [])
  const [[experienceMin, experienceMax], setExperienceRange] = useState<[number, number]>(
    editingPost?.experience ? [editingPost.experience.min, editingPost.experience.max] : [1, 3],
  )
  const [salaryNegotiable, setSalaryNegotiable] = useState(editingPost ? editingPost.salary === null : false)
  const [[salaryMin, salaryMax], setSalaryRange] = useState<[number, number]>(
    editingPost?.salary ? [editingPost.salary.min, editingPost.salary.max] : [5, 10],
  )
  const [featured, setFeatured] = useState(editingPost?.featured ?? false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const slug = slugify(title)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!slug) {
      setError('Tên công việc phải có ít nhất một chữ cái hoặc chữ số.')
      return
    }

    if (selectedSkills.length === 0) {
      setError('Vui lòng chọn ít nhất một kỹ năng.')
      return
    }

    const post = {
      title,
      slug,
      address,
      deadline,
      workType,
      description,
      requirements,
      benefits,
      field,
      city,
      skills: selectedSkills,
      experienceMin,
      experienceMax,
      salaryNegotiable,
      salaryMin: salaryNegotiable ? null : salaryMin,
      salaryMax: salaryNegotiable ? null : salaryMax,
      featured,
    }

    console.log(isEdit ? 'Cập nhật bài đăng:' : 'Bài đăng tuyển dụng:', post)
    setSuccess(
      isEdit
        ? 'Thông tin đã được kiểm tra. Chức năng cập nhật chưa được kết nối API.'
        : 'Thông tin đã được kiểm tra. Chức năng đăng bài chưa được kết nối API.',
    )
  }

  return (
    <section className="profile-update">
      {isEdit && <Link className="post-view__back" to="/recruit/posts">← Quay lại danh sách</Link>}
      <div className="profile-update__heading">
        <span className="section-kicker">NHÀ TUYỂN DỤNG</span>
        <h1>{isEdit ? 'Sửa bài đăng' : 'Thêm bài đăng'}</h1>
        <p>{isEdit ? `Cập nhật tin tuyển dụng #${id}.` : 'Đăng tin tuyển dụng mới để tiếp cận ứng viên phù hợp.'}</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form__section">
          <h2>Thông tin công việc</h2>
          <div className="profile-form__grid">
            <label className="profile-field profile-field--full">
              <span>Tên công việc <b>*</b></span>
              <input
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ví dụ: Senior Frontend Engineer"
                required
                value={title}
              />
            </label>

            <label className="profile-field profile-field--full">
              <span>Slug</span>
              <input aria-readonly="true" readOnly value={slug} />
            </label>

            <label className="profile-field">
              <span>Lĩnh vực <b>*</b></span>
              <select onChange={(event) => setField(event.target.value)} required value={field}>
                <option value="">Chọn lĩnh vực</option>
                {fields.map((item) => (
                  <option key={item.label} value={item.label}>{item.label}</option>
                ))}
              </select>
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

            <label className="profile-field">
              <span>Ngày kết thúc <b>*</b></span>
              <input
                onChange={(event) => setDeadline(event.target.value)}
                required
                type="date"
                value={deadline}
              />
            </label>

            <label className="profile-field profile-field--full">
              <span>Địa chỉ làm việc <b>*</b></span>
              <input
                autoComplete="street-address"
                onChange={(event) => setAddress(event.target.value)}
                placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                required
                value={address}
              />
            </label>
          </div>
        </div>

        <div className="profile-form__section">
          <h2>Nội dung tuyển dụng</h2>
          <div className="profile-form__grid">
            <label className="profile-field profile-field--full">
              <span>Mô tả công việc <b>*</b></span>
              <textarea
                className="profile-textarea"
                onChange={(event) => setDescription(event.target.value)}
                placeholder={'Mô tả chi tiết công việc, trách nhiệm chính...\n\nVí dụ:\n- Phát triển và duy trì các tính năng...\n- Phối hợp với team Backend...'}
                required
                rows={8}
                value={description}
              />
            </label>

            <label className="profile-field profile-field--full">
              <span>Yêu cầu ứng viên <b>*</b></span>
              <textarea
                className="profile-textarea"
                onChange={(event) => setRequirements(event.target.value)}
                placeholder={'Các yêu cầu về kỹ năng, kinh nghiệm...\n\nVí dụ:\n- 3+ năm kinh nghiệm với React...\n- Thành thạo TypeScript...'}
                required
                rows={8}
                value={requirements}
              />
            </label>

            <label className="profile-field profile-field--full">
              <span>Quyền lợi khi gia nhập <b>*</b></span>
              <textarea
                className="profile-textarea"
                onChange={(event) => setBenefits(event.target.value)}
                placeholder={'Các quyền lợi, chế độ đãi ngộ...\n\nVí dụ:\n- Lương tháng 13, thưởng dự án...\n- Bảo hiểm sức khỏe cao cấp...'}
                required
                rows={8}
                value={benefits}
              />
            </label>
          </div>
        </div>

        <div className="profile-form__section">
          <h2>Kỹ năng và kinh nghiệm</h2>
          <div className="profile-form__grid">
            <div className="profile-field profile-field--full">
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
          <h2>Mức lương</h2>
          <label className="profile-checkbox">
            <input
              checked={featured}
              disabled={isEdit}
              onChange={(event) => setFeatured(event.target.checked)}
              type="checkbox"
            />
            <span>Việc làm nổi bật</span>
            <small>
              {isEdit
                ? 'Không thể thay đổi trạng thái nổi bật của bài đăng đã tạo.'
                : 'Bài đăng nổi bật sẽ được ưu tiên hiển thị lên đầu trang chủ.'}
            </small>
          </label>

          <label className="profile-checkbox">
            <input
              checked={salaryNegotiable}
              onChange={(event) => setSalaryNegotiable(event.target.checked)}
              type="checkbox"
            />
            <span>Lương thỏa thuận</span>
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
                    {salaryNegotiable ? 'Thỏa thuận' : <>{salaryMin}<small> triệu</small></>}
                  </strong>
                </div>
                <span className="salary-range__separator" aria-hidden="true">đến</span>
                <div className="salary-range__value-card salary-range__value-card--max">
                  <span>LƯƠNG TỐI ĐA</span>
                  <strong>
                    {salaryNegotiable ? 'Thỏa thuận' : <>{salaryMax}<small> triệu</small></>}
                  </strong>
                </div>
              </div>
              <p className="salary-range__hint">
                {salaryNegotiable
                  ? 'Khoảng lương không áp dụng khi chọn thỏa thuận.'
                  : 'Kéo nút trái để đổi mức tối thiểu, nút phải để đổi mức tối đa. Hai nút không thể vượt qua nhau; lương tối đa luôn cao hơn tối thiểu.'}
              </p>
            </div>
          </div>
        </div>

        {error && <p className="profile-form__message profile-form__message--error" role="alert">{error}</p>}
        {success && <p className="profile-form__message profile-form__message--success" role="status">{success}</p>}

        <div className="profile-form__actions">
          <button className="button button-primary profile-form__submit" type="submit">
            {isEdit ? 'Lưu thay đổi' : 'Đăng bài tuyển dụng'}
          </button>
        </div>
      </form>
    </section>
  )
}
