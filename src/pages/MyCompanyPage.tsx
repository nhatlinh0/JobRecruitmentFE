import { useState, type FormEvent } from 'react'
import { FilePreview } from '../components/FilePreview'
import { companyIndustries } from '../data/navigation'
import { useFilePicker } from '../hooks/useFilePicker'
import { slugify } from '../utils/slugify'
import './UpdateProfilePage.css'

const companySizes = ['1-50', '50-100', '100-200', '200-500', '500-1000', '1000+'] as const
const countries = ['Việt Nam', 'Singapore', 'Nhật Bản', 'Hàn Quốc', 'Hoa Kỳ', 'Úc', 'Khác']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function MyCompanyPage() {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [size, setSize] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('Việt Nam')
  const [industry, setIndustry] = useState('')
  const { file: logo, url: logoUrl, pick: pickLogo } = useFilePicker()
  const { file: license, url: licenseUrl, pick: pickLicense } = useFilePicker()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const slug = slugify(name)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!slug) {
      setError('Tên công ty phải có ít nhất một chữ cái hoặc chữ số.')
      return
    }

    if (!logo || !logo.type.startsWith('image/')) {
      setError('Logo công ty phải là tệp ảnh.')
      return
    }

    if (!license || (license.type !== 'application/pdf' && !license.type.startsWith('image/'))) {
      setError('Giấy tờ công ty phải là tệp ảnh hoặc PDF.')
      return
    }

    if (logo.size > MAX_FILE_SIZE || license.size > MAX_FILE_SIZE) {
      setError('Mỗi tệp tải lên có dung lượng tối đa 10 MB.')
      return
    }

    const company = { name, slug, address, size, phone, country, industry, logo, license }
    console.log('Thông tin công ty:', company)
    setSuccess('Thông tin đã được kiểm tra. Chức năng cập nhật API chưa được kết nối.')
  }

  return (
    <section className="profile-update">
      <div className="profile-update__heading">
        <span className="section-kicker">NHÀ TUYỂN DỤNG</span>
        <h1>Công ty của tôi</h1>
        <p>Cập nhật thông tin công ty để xây dựng thương hiệu tuyển dụng đáng tin cậy.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form__section">
          <h2>Thông tin công ty</h2>
          <div className="profile-form__grid">
            <label className="profile-field profile-field--full">
              <span>Tên công ty <b>*</b></span>
              <input
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Ngân hàng MB Bank"
                required
                value={name}
              />
            </label>

            <label className="profile-field profile-field--full">
              <span>Slug</span>
              <input aria-readonly="true" readOnly value={slug} />
            </label>

            <label className="profile-field">
              <span>Lĩnh vực <b>*</b></span>
              <select onChange={(event) => setIndustry(event.target.value)} required value={industry}>
                <option value="">Chọn lĩnh vực</option>
                {companyIndustries.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="profile-field">
              <span>Quy mô nhân sự <b>*</b></span>
              <select onChange={(event) => setSize(event.target.value)} required value={size}>
                <option value="">Chọn quy mô</option>
                {companySizes.map((item) => (
                  <option key={item} value={item}>{item} nhân sự</option>
                ))}
              </select>
            </label>

            <label className="profile-field">
              <span>Quốc gia <b>*</b></span>
              <select onChange={(event) => setCountry(event.target.value)} required value={country}>
                {countries.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="profile-field">
              <span>Số điện thoại <b>*</b></span>
              <input
                autoComplete="tel"
                inputMode="tel"
                onChange={(event) => setPhone(event.target.value)}
                pattern="\+?[0-9\s.\-]{8,20}"
                placeholder="Ví dụ: 0901234567"
                required
                type="tel"
                value={phone}
              />
            </label>

            <label className="profile-field profile-field--full">
              <span>Địa chỉ <b>*</b></span>
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
          <h2>Logo và giấy tờ</h2>
          <div className="profile-form__grid">
            <div className="profile-field">
              <span>Logo công ty <b>*</b></span>
              <label className="profile-file">
                <input accept="image/*" onChange={pickLogo} required type="file" />
                <span className="profile-file__button">Chọn logo</span>
                <span className="profile-file__name">{logo?.name ?? 'Chưa chọn tệp'}</span>
              </label>
              <FilePreview file={logo} url={logoUrl} variant="logo" />
            </div>

            <div className="profile-field">
              <span>Giấy tờ xác minh công ty <b>*</b></span>
              <label className="profile-file">
                <input
                  accept="image/*,.pdf,application/pdf"
                  onChange={pickLicense}
                  required
                  type="file"
                />
                <span className="profile-file__button">Chọn giấy tờ</span>
                <span className="profile-file__name">{license?.name ?? 'Chưa chọn tệp'}</span>
              </label>
              <FilePreview file={license} url={licenseUrl} variant="document" />
            </div>
          </div>
          <p className="profile-form__hint">Logo là ảnh; giấy tờ là ảnh hoặc PDF. Mỗi tệp tối đa 10 MB.</p>
        </div>

        {error && <p className="profile-form__message profile-form__message--error" role="alert">{error}</p>}
        {success && <p className="profile-form__message profile-form__message--success" role="status">{success}</p>}

        <div className="profile-form__actions">
          <button className="button button-primary profile-form__submit" type="submit">Lưu thông tin công ty</button>
        </div>
      </form>
    </section>
  )
}
