import { useEffect, useState, type FormEvent } from 'react'
import { FilePreview } from './FilePreview'
import { useFilePicker } from '../hooks/useFilePicker'
import './ApplyModal.css'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface ApplyModalProps {
  jobTitle: string
  onClose: () => void
}

export function ApplyModal({ jobTitle, onClose }: ApplyModalProps) {
  const [introduction, setIntroduction] = useState('')
  const [useProfileCv, setUseProfileCv] = useState(false)
  const { file: cv, url: cvUrl, pick: pickCv } = useFilePicker()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!useProfileCv && !cv) {
      setError('Vui lòng thêm CV hoặc chọn dùng CV trong hồ sơ.')
      return
    }

    if (cv && cv.type !== 'application/pdf' && !cv.type.startsWith('image/')) {
      setError('CV phải là tệp ảnh hoặc PDF.')
      return
    }

    if (cv && cv.size > MAX_FILE_SIZE) {
      setError('Tệp CV vượt quá dung lượng tối đa 10 MB.')
      return
    }

    const application = {
      jobTitle,
      introduction,
      useProfileCv,
      cv: useProfileCv ? null : cv,
    }
    console.log('Đơn ứng tuyển:', application)
    setSuccess('Đơn ứng tuyển đã được kiểm tra. Chức năng gửi CV chưa được kết nối API.')
  }

  return (
    <div className="apply-modal" onClick={onClose} role="presentation">
      <div
        aria-modal="true"
        className="apply-modal__dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="apply-modal__header">
          <div>
            <h2>Ứng tuyển</h2>
            <p>{jobTitle}</p>
          </div>
          <button aria-label="Đóng" className="apply-modal__close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="apply-modal__form" onSubmit={handleSubmit}>
          <label className="profile-field">
            <span>Giới thiệu bản thân</span>
            <textarea
              className="profile-textarea"
              onChange={(event) => setIntroduction(event.target.value)}
              placeholder="Giới thiệu ngắn gọn về kinh nghiệm và kỹ năng nổi bật của bạn..."
              rows={5}
              value={introduction}
            />
          </label>

          <label className="profile-checkbox">
            <input
              checked={useProfileCv}
              onChange={(event) => setUseProfileCv(event.target.checked)}
              type="checkbox"
            />
            <span>Dùng CV trong hồ sơ</span>
            <small>Khi bật, hệ thống sẽ dùng CV bạn đã tải lên trong hồ sơ cá nhân.</small>
          </label>

          <div className="profile-field">
            <span>Thêm CV {!useProfileCv && <b>*</b>}</span>
            <label className={`profile-file${useProfileCv ? ' profile-file--disabled' : ''}`}>
              <input
                accept="image/*,.pdf,application/pdf"
                disabled={useProfileCv}
                onChange={pickCv}
                type="file"
              />
              <span className="profile-file__button">Chọn tệp</span>
              <span className="profile-file__name">
                {useProfileCv ? 'Đang dùng CV trong hồ sơ' : (cv?.name ?? 'Chưa chọn tệp')}
              </span>
            </label>
            {!useProfileCv && <FilePreview file={cv} url={cvUrl} variant="document" />}
            <p className="profile-form__hint">Chấp nhận tệp ảnh hoặc PDF, dung lượng tối đa 10 MB.</p>
          </div>

          {error && <p className="profile-form__message profile-form__message--error" role="alert">{error}</p>}
          {success && <p className="profile-form__message profile-form__message--success" role="status">{success}</p>}

          <div className="apply-modal__actions">
            <button className="button button-primary" type="submit">Gửi CV</button>
          </div>
        </form>
      </div>
    </div>
  )
}
