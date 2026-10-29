import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { jobs } from '../data/jobs'
import { formatDate, formatSalary } from '../utils/format'
import { Icon } from '../components/ui/Icon'
import './JobPostViewPage.css'

export function JobPostViewPage() {
  const { id } = useParams<{ id: string }>()
  const post = jobs.find((job) => job.id === Number(id))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!post) {
    return (
      <section className="post-view">
        <div className="post-view__not-found">
          <h1>Không tìm thấy bài đăng</h1>
          <Link className="button button-primary" to="/recruit/posts">← Quay lại danh sách</Link>
        </div>
      </section>
    )
  }

  const experienceText = post.experience
    ? `${post.experience.min} - ${post.experience.max} năm`
    : 'Không yêu cầu'

  return (
    <section className="post-view">
      <Link className="post-view__back" to="/recruit/posts">← Quay lại danh sách</Link>

      <div className="post-view__header">
        <div className="post-view__mark" data-color={post.companyColor}>
          {post.companyName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{post.title}</h1>
          <p>{post.companyName} · Mã bài đăng #{post.id}</p>
        </div>
        {post.featured && <span className="post-view__featured"><Icon name="spark" /> Nổi bật</span>}
      </div>

      <dl className="post-view__meta">
        <div><dt>Địa chỉ</dt><dd>{post.address ?? post.city}</dd></div>
        <div><dt>Ngày kết thúc</dt><dd>{formatDate(post.deadline)}</dd></div>
        <div><dt>Hình thức làm việc</dt><dd>{post.workType}</dd></div>
        <div><dt>Kinh nghiệm</dt><dd>{experienceText}</dd></div>
        <div><dt>Mức lương</dt><dd>{formatSalary(post.salary)}</dd></div>
        <div><dt>Thành phố</dt><dd>{post.city}</dd></div>
        <div><dt>Lĩnh vực</dt><dd>{post.field}</dd></div>
      </dl>

      <div className="post-view__block">
        <h2>Kỹ năng yêu cầu</h2>
        <ul className="post-view__skills">
          {post.skills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </div>

      <div className="post-view__block">
        <h2>Mô tả công việc</h2>
        <p className="post-view__text">{post.description}</p>
      </div>

      <div className="post-view__block">
        <h2>Yêu cầu ứng viên</h2>
        <p className="post-view__text">{post.requirements}</p>
      </div>

      <div className="post-view__block">
        <h2>Quyền lợi khi gia nhập</h2>
        <p className="post-view__text">{post.benefits}</p>
      </div>
    </section>
  )
}
