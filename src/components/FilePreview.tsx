import '../pages/UpdateProfilePage.css'

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

type FilePreviewProps = {
  file: File | null
  url: string
  variant: 'logo' | 'document'
}

export function FilePreview({ file, url, variant }: FilePreviewProps) {
  if (!file || !url) return null

  const isPdf = file.type === 'application/pdf'

  return (
    <figure className={`file-preview file-preview--${variant}`}>
      <div className="file-preview__media">
        {isPdf ? (
          <iframe src={`${url}#toolbar=0&navpanes=0`} title={`Xem trước ${file.name}`} />
        ) : (
          <img alt={`Xem trước ${file.name}`} src={url} />
        )}
      </div>
      <figcaption className="file-preview__meta">
        <span className="file-preview__badge">{isPdf ? 'PDF' : 'Ảnh'}</span>
        <span className="file-preview__name" title={file.name}>{file.name}</span>
        <span className="file-preview__size">{formatSize(file.size)}</span>
      </figcaption>
    </figure>
  )
}
