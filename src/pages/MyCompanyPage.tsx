import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { FilePreview } from '../components/FilePreview'
import { useAuth } from '../hooks/useAuth'
import { fetchIndustries, fetchMyCompany, saveCompany } from '../services/company'
import type { ProfileOption } from '../services/userInfo'
import { Toast, type ToastMessage } from '../components/ui/Toast'
import { useFilePicker } from '../hooks/useFilePicker'
import { slugify } from '../utils/slugify'
import './UpdateProfilePage.css'

const companySizes = ['1-50', '50-100', '100-200', '200-500', '500-1000', '1000+'] as const
const countries = ['Việt Nam', 'Singapore', 'Nhật Bản', 'Hàn Quốc', 'Hoa Kỳ', 'Úc', 'Khác']
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function MyCompanyPage() {
  const { token, user } = useAuth()
  const [industries, setIndustries] = useState<ProfileOption[]>([])
  const [existingLogo, setExistingLogo] = useState('')
  const [existingLicense, setExistingLicense] = useState('')
  const [storedSlug, setStoredSlug] = useState('')
  const [exists, setExists] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const [retry, setRetry] = useState(0)
  const [notification, setNotification] = useState<ToastMessage | null>(null)
  const closeToast = useCallback(() => setNotification(null), [])
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [size, setSize] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('Việt Nam')
  const [industry, setIndustry] = useState('')
  const [description, setDescription] = useState('')
  const { file: logo, url: logoUrl, pick: pickLogo } = useFilePicker()
  const { file: license, url: licenseUrl, pick: pickLicense } = useFilePicker()
  const [error, setError] = useState('')
  const slug = storedSlug || slugify(name)

  useEffect(() => {
    if (!token || user?.role !== 'RECRUIT') return
    const controller = new AbortController()
    Promise.all([fetchIndustries(controller.signal), fetchMyCompany(token, controller.signal)]).then(([options, company]) => {
      if (controller.signal.aborted) return
      setIndustries(company?.industry && !options.some((item) => item.id === company.industry!.id) ? [...options, company.industry] : options)
      setExists(company !== null)
      if (company) {
        setName(company.name); setStoredSlug(company.slug); setAddress(company.address)
        setSize(company.companySize); setPhone(company.phone); setCountry(company.country)
        setIndustry(company.industryId ? String(company.industryId) : '')
        setDescription(company.description); setExistingLogo(company.logoUrl); setExistingLicense(company.profilePDFUrl)
      }
      setReady(true)
    }).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : 'Không thể tải thông tin công ty.'
        setError(message); setNotification({ type: 'error', message })
      }
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [token, user?.role, retry])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!token || !ready || savingRef.current) return

    if (!slug) {
      setError('Tên công ty phải có ít nhất một chữ cái hoặc chữ số.')
      return
    }

    if (logo && !logo.type.startsWith('image/')) {
      setError('Logo công ty phải là tệp ảnh.')
      return
    }

    if (license && !license.type.startsWith('image/')) {
      setError('Giấy tờ công ty phải là tệp ảnh, không hỗ trợ PDF.')
      return
    }

    if ((logo && logo.size > MAX_FILE_SIZE) || (license && license.size > MAX_FILE_SIZE)) {
      setError('Mỗi tệp tải lên có dung lượng tối đa 10 MB.')
      return
    }

    savingRef.current = true
    setSaving(true)
    setNotification(null)
    try {
      await saveCompany(token, exists, { name, slug, address, companySize: size, phone, country, industryId: Number(industry), description }, logo, license)
      setExists(true)
      setNotification({ type: 'success', message: 'Đã lưu thông tin công ty.' })
    } catch (error) {
      setNotification({ type: 'error', message: error instanceof Error ? error.message : 'Không thể lưu thông tin công ty.' })
    } finally { savingRef.current = false; setSaving(false) }
  }

  if (!token) return <Navigate to="/login" replace />
  if (!user?.role) return <p role="status">Đang tải thông tin người dùng...</p>
  if (user.role !== 'RECRUIT') return <Navigate to="/" replace />

  return (
    <section className="profile-update">
      <Toast notification={notification} onClose={closeToast} />
      <div className="profile-update__heading">
        <span className="section-kicker">NHÀ TUYỂN DỤNG</span>
        <h1>Công ty của tôi</h1>
        <p>Cập nhật thông tin công ty để xây dựng thương hiệu tuyển dụng đáng tin cậy.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        {loading && <p role="status">Đang tải thông tin công ty...</p>}
        {!loading && !ready && <><p role="alert">{error}</p><button type="button" className="button button-outline" onClick={() => { setLoading(true); setError(''); setRetry((value) => value + 1) }}>Thử lại</button></>}
        <fieldset disabled={loading || !ready || saving} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: 'grid', gap: 24 }}>
        <div className="profile-form__section">
          <h2>Thông tin công ty</h2>
          <div className="profile-form__grid">
            <label className="profile-field profile-field--full">
              <span>Tên công ty <b>*</b></span>
              <input
                onChange={(event) => { setName(event.target.value); setStoredSlug('') }}
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
                {industries.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>

            <label className="profile-field">
              <span>Quy mô nhân sự <b>*</b></span>
              <select onChange={(event) => setSize(event.target.value)} required value={size}>
                <option value="">Chọn quy mô</option>
                {size && !companySizes.some((item) => item === size) && <option value={size}>{size} nhân sự</option>}
                {companySizes.map((item) => (
                  <option key={item} value={item}>{item} nhân sự</option>
                ))}
              </select>
            </label>

            <label className="profile-field">
              <span>Quốc gia <b>*</b></span>
              <select onChange={(event) => setCountry(event.target.value)} required value={country}>
                {country && !countries.includes(country) && <option value={country}>{country}</option>}
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

            <label className="profile-field profile-field--full">
              <span>Mô tả công ty <b>*</b></span>
              <textarea
                className="profile-textarea"
                onChange={(event) => setDescription(event.target.value)}
                placeholder={'Giới thiệu về công ty, văn hóa làm việc, sản phẩm...\n\nVí dụ:\nCông ty ABC là đơn vị tiên phong trong lĩnh vực...\n\nChúng tôi đang tìm kiếm những ứng viên...'}
                required
                rows={8}
                value={description}
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
                <input accept="image/*" onChange={pickLogo} type="file" />
                <span className="profile-file__button">Chọn logo</span>
                <span className="profile-file__name">{logo?.name ?? 'Chưa chọn tệp'}</span>
              </label>
              <FilePreview file={logo} url={logoUrl} variant="logo" />
              {!logo && /^https?:\/\//i.test(existingLogo) && <img src={existingLogo} alt="Logo công ty hiện tại" style={{ maxWidth: 180, maxHeight: 180, objectFit: 'contain' }} />}
            </div>

            <div className="profile-field">
              <span>Giấy tờ xác minh công ty <b>*</b></span>
              <label className="profile-file">
                <input
                  accept="image/*"
                  onChange={pickLicense}
                  type="file"
                />
                <span className="profile-file__button">Chọn giấy tờ</span>
                <span className="profile-file__name">{license?.name ?? 'Chưa chọn tệp'}</span>
              </label>
              <FilePreview file={license} url={licenseUrl} variant="document" />
              {!license && /^https?:\/\//i.test(existingLicense) && <img src={existingLicense} alt="Giấy tờ công ty hiện tại" style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }} />}
            </div>
          </div>
          <p className="profile-form__hint">Logo và giấy tờ chỉ chấp nhận ảnh. Mỗi tệp tối đa 10 MB.</p>
        </div>

        {error && <p className="profile-form__message profile-form__message--error" role="alert">{error}</p>}

        <div className="profile-form__actions">
          <button className="button button-primary profile-form__submit" type="submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thông tin công ty'}</button>
        </div>
        </fieldset>
      </form>
    </section>
  )
}
