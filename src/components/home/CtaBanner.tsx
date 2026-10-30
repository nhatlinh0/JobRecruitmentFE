import { Icon } from '../ui/Icon'
import './CtaBanner.css'

export function CtaBanner() {
  return (
    <section className="cta-banner" id="post-job">
      <div className="cta-icon"><Icon name="spark" /></div>
      <div className="cta-copy">
        <span className="section-kicker">ĐỪNG BỎ LỠ CƠ HỘI</span>
        <h2>Công việc phù hợp sẽ tìm đến bạn.</h2>
        <p>Nhận việc làm IT mới nhất, được chọn riêng theo kỹ năng của bạn.</p>
      </div>
      <a className="button button-light cta-button" href="/register">
        Tạo hồ sơ miễn phí <Icon name="arrow" />
      </a>
      <span className="cta-decoration decoration-one" />
      <span className="cta-decoration decoration-two" />
    </section>
  )
}
