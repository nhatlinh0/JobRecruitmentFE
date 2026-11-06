import type { FormEvent } from 'react'
import { Icon } from '../ui/Icon'
import './HeroSection.css'

interface HeroSectionProps {
  keyword: string
  onKeywordChange: (value: string) => void
  onSearch: () => void
}

const popularKeywords = ['React', 'Java', 'Python', 'Remote']

export function HeroSection({
  keyword,
  onKeywordChange,
  onSearch,
}: HeroSectionProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSearch()
  }

  return (
    <section className="hero-section">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot" /> NƠI SỰ NGHIỆP CÔNG NGHỆ BẮT ĐẦU</div>
        <h1>
          Bước tiến mới.
          <br />
          <span>Sự nghiệp mới.</span>
          <br />
          Đúng chất IT.
        </h1>
        <p className="hero-description">
          Kết nối với hàng nghìn cơ hội công nghệ hấp dẫn từ những công ty hàng đầu Việt Nam.
        </p>
        <form className="search-panel" onSubmit={handleSubmit}>
          <label className="search-field">
            <Icon name="search" />
            <span className="visually-hidden">Tiêu đề công việc</span>
            <input
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Tiêu đề công việc"
              value={keyword}
            />
          </label>
          <button className="button button-primary search-button" type="submit">
            <Icon name="search" />
            <span>Tìm việc</span>
          </button>
        </form>
        <div className="popular-searches">
          <span>Phổ biến:</span>
          {popularKeywords.map((term) => (
            <button key={term} onClick={() => onKeywordChange(term)} type="button">
              {term}
            </button>
          ))}
        </div>
        <div className="hero-proof"><span className="hero-proof__icon"><Icon name="check" /></span><p>Khám phá công ty. <strong>Tìm đúng cơ hội của bạn.</strong></p></div>
      </div>

      <div className="hero-art" aria-hidden="true">
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="floating-code"><Icon name="code" /></div>
        <div className="floating-spark"><Icon name="spark" /></div>
        <div className="profile-card">
          <div className="profile-topline"><span /><span /><span /><small>career.tsx</small></div>
          <div className="profile-code">
            <span><i>01</i> <b>const</b> nextRole = {'{'}</span>
            <span><i>02</i> &nbsp;impact: <em>'meaningful'</em>,</span>
            <span><i>03</i> &nbsp;team: <em>'great people'</em>,</span>
            <span><i>04</i> &nbsp;growth: <em>'∞'</em></span>
            <span><i>05</i> {'}'}</span>
          </div>
          <div className="profile-footer"><span className="online-dot" /> Open to opportunities</div>
        </div>
        <div className="match-card">
          <span className="match-icon"><Icon name="spark" /></span>
          <span><strong>Công việc đúng chuyên môn</strong><small>Khám phá theo kỹ năng của bạn</small></span>
          <span className="match-arrow"><Icon name="arrow" /></span>
        </div>
        <div className="hero-stat-card">
          <span className="stat-icon"><Icon name="briefcase" /></span>
          <span><strong>Cơ hội tiếp theo</strong><small>Bắt đầu từ hôm nay</small></span>
          <span className="stat-trend"><Icon name="trend" /></span>
        </div>
        <div className="art-caption"><span />Your next chapter starts here</div>
      </div>
    </section>
  )
}
