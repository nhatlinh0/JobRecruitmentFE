import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './RecruitHome.css'

const quickActions = [
  {
    title: 'Quản lý công ty',
    description: 'Cập nhật thông tin, logo và giấy tờ xác minh công ty.',
    to: '/my-company',
  },
  {
    title: 'Thêm bài đăng',
    description: 'Đăng tin tuyển dụng mới để tiếp cận ứng viên phù hợp.',
    to: '/recruit/posts/new',
  },
  {
    title: 'Nâng cấp gói',
    description: 'Mở khóa thêm lượt đăng tin và tính năng nổi bật.',
    to: '/recruit/upgrade',
  },
]

export function RecruitHome() {
  const { user } = useAuth()

  return (
    <section className="recruit-home">
      <div className="recruit-home__hero">
        <span className="section-kicker">KÊNH NHÀ TUYỂN DỤNG</span>
        <h1>Xin chào, {user?.username ?? 'nhà tuyển dụng'}!</h1>
        <p>
          Chào mừng bạn đến với JobSeeker — nơi kết nối doanh nghiệp với hàng nghìn ứng viên
          công nghệ chất lượng. Cập nhật thông tin công ty và quản lý tin tuyển dụng
          trong một bảng điều khiển.
        </p>
      </div>

      <div className="recruit-home__grid">
        {quickActions.map((action) => (
          <Link className="recruit-home__card" key={action.to} to={action.to}>
            <h2>{action.title}</h2>
            <p>{action.description}</p>
            <span className="recruit-home__card-link">Truy cập →</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
