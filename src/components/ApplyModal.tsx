import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FilePreview } from './FilePreview'
import { useFilePicker } from '../hooks/useFilePicker'
import './ApplyModal.css'
import { useAuth } from '../hooks/useAuth'
import { profileRequest } from '../services/userInfo'
import { submitApplication } from '../services/applications'

const MAX_FILE_SIZE = 10 * 1024 * 1024

interface ApplyModalProps {
  jobId: number
  jobTitle: string
  onClose: () => void
}

export function ApplyModal({ jobId, jobTitle, onClose }: ApplyModalProps) {
  const { token } = useAuth()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const submitting = useRef(false)
  const [saving, setSaving] = useState(false)
  const [profileCv, setProfileCv] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [profileRetry, setProfileRetry] = useState(0)
  const [introduction, setIntroduction] = useState('')
  const [useProfileCv, setUseProfileCv] = useState(false)
  const { file: cv, url: cvUrl, pick: pickCv } = useFilePicker()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    if (!token) return
    const controller = new AbortController()
    profileRequest('user-infos', token, { signal: controller.signal }).then((body) => {
      if (controller.signal.aborted) return
      const image = body && typeof body === 'object' ? ('image' in body ? body.image : 'imageUrl' in body ? body.imageUrl : null) : null
      setProfileCv(typeof image === 'string' ? image.trim() : '')
    }).catch((error: unknown) => { if (!controller.signal.aborted) setProfileError(error instanceof Error ? error.message : 'Không thể tải CV hồ sơ.') })
      .finally(() => { if (!controller.signal.aborted) setProfileLoading(false) })
    return () => controller.abort()
  }, [token, profileRetry])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!token || submitting.current) return
    if (useProfileCv && (profileLoading || profileError || !profileCv)) { setError('Hồ sơ chưa có CV hợp lệ. Vui lòng tải ảnh CV lên.'); return }

    if (!useProfileCv && !cv) {
      setError('Vui lòng thêm CV hoặc chọn dùng CV trong hồ sơ.')
      return
    }

    if (!useProfileCv && cv && !cv.type.startsWith('image/')) {
      setError('CV phải là tệp ảnh, không hỗ trợ PDF.')
      return
    }

    if (!useProfileCv && cv && cv.size > MAX_FILE_SIZE) {
      setError('Tệp CV vượt quá dung lượng tối đa 10 MB.')
      return
    }

    submitting.current = true
    setSaving(true)
    try {
      await submitApplication(token, jobId, introduction, useProfileCv ? profileCv : cv!)
      setSuccess('Đã gửi đơn ứng tuyển thành công.')
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'success', message: 'Đã gửi đơn ứng tuyển thành công.' } }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi đơn ứng tuyển.'
      setError(message)
      window.dispatchEvent(new CustomEvent('app-toast', { detail: { type: 'error', message } }))
    } finally { submitting.current = false; setSaving(false) }
  }

  return (
    <dialog ref={dialogRef} className="apply-dialog" aria-labelledby="apply-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose() }} onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
      <div className="apply-modal__dialog">
        <div className="apply-modal__header">
          <div>
            <h2 id="apply-title">Ứng tuyển</h2>
            <p>{jobTitle}</p>
          </div>
          <button disabled={saving} aria-label="Đóng" className="apply-modal__close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="apply-modal__form" onSubmit={handleSubmit}>
          <fieldset className="apply-modal__fields" disabled={saving || Boolean(success)}>
          <label className="profile-field">
            <span>Thư giới thiệu (Cover letter)</span>
            <textarea
              className="profile-textarea"
              onChange={(event) => setIntroduction(event.target.value)}
              placeholder="Giới thiệu ngắn gọn về kinh nghiệm và kỹ năng nổi bật của bạn..."
              rows={5}
              value={introduction}
            />
          </label>

          <fieldset className="apply-modal__choices"><legend>Chọn CV ứng tuyển</legend>
          <label className="profile-checkbox"><input type="radio" name="cvSource" checked={!useProfileCv} onChange={() => { setUseProfileCv(false); setError('') }} /><span>Tải ảnh CV lên</span></label>
          <label className="profile-checkbox">
            <input
              checked={useProfileCv}
              onChange={() => { setUseProfileCv(true); setError('') }}
              disabled={profileLoading || Boolean(profileError) || !profileCv}
              type="radio"
              name="cvSource"
            />
            <span>Dùng CV trong hồ sơ</span>
            <small>{profileLoading ? 'Đang tải CV hồ sơ...' : profileError || (!profileCv ? 'Hồ sơ chưa có CV. Vui lòng tải ảnh lên hoặc cập nhật hồ sơ.' : 'Sử dụng CV hiện có trong hồ sơ cá nhân.')}</small>
          </label>
          {profileError && <button type="button" className="button button-outline" onClick={() => { setProfileError(''); setProfileLoading(true); setProfileRetry((value) => value + 1) }}>Tải lại CV hồ sơ</button>}
          </fieldset>

          <div className="profile-field">
            <span>Thêm CV {!useProfileCv && <b>*</b>}</span>
            <label className={`profile-file${useProfileCv ? ' profile-file--disabled' : ''}`}>
              <input
                accept="image/*"
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
            {useProfileCv && profileCv && <img className="apply-modal__profile-cv" src={profileCv} alt="CV trong hồ sơ" />}
            <p className="profile-form__hint">Chỉ chấp nhận tệp ảnh, dung lượng tối đa 10 MB.</p>
          </div>

          {error && <p className="profile-form__message profile-form__message--error" role="alert">{error}</p>}
          {success && <p className="profile-form__message profile-form__message--success" role="status">{success}</p>}

          <div className="apply-modal__actions">
            <button className="button button-primary" type="submit" disabled={saving || Boolean(success)}>{saving ? 'Đang gửi...' : 'Gửi ứng tuyển'}</button>
          </div>
          </fieldset>
        </form>
      </div>
    </dialog>
  )
}
