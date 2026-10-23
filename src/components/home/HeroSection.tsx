import type { FormEvent } from 'react'
import { Icon } from '../ui/Icon'
import './HeroSection.css'

interface HeroSectionProps {
  keyword: string
  city: string
  onKeywordChange: (value: string) => void
  onCityChange: (value: string) => void
  onSearch: () => void
}

const popularKeywords = ['React', 'Java', 'Python', 'Remote']

export function HeroSection({
  keyword,
  city,
  onKeywordChange,
  onCityChange,
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
          Công việc tốt.
          <br />
          <span>Cơ hội mới.</span>
          <br />
          Đúng chất IT.
        </h1>
        <p className="hero-description">
          Kết nối với hàng nghìn cơ hội công nghệ hấp dẫn từ những công ty hàng đầu Việt Nam.
        </p>
        <form className="search-panel" onSubmit={handleSubmit}>
          <label className="search-field">
            <Icon name="search" />
            <span className="visually-hidden">Vị trí, kỹ năng hoặc công ty</span>
            <input
              onChange={(event) => onKeywordChange(event.target.value)}
              placeholder="Vị trí, kỹ năng hoặc công ty"
              value={keyword}
            />
          </label>
          <span className="search-divider" />
          <label className="search-field location-field">
            <Icon name="location" />
            <span className="visually-hidden">Thành phố</span>
            <input
              onChange={(event) => onCityChange(event.target.value)}
              placeholder="Thành phố"
              value={city}
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
        <div className="hero-proof">
          <div className="proof-avatars" aria-hidden="true">
            <span>H</span><span>L</span><span>M</span><span>+</span>
          </div>
          <p><strong>12.000+</strong> ứng viên đã tìm được việc phù hợp</p>
        </div>
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
          <span><strong>98% phù hợp</strong><small>Frontend Developer · Momo</small></span>
          <span className="match-arrow"><Icon name="arrow" /></span>
        </div>
        <div className="hero-stat-card">
          <span className="stat-icon"><Icon name="briefcase" /></span>
          <span><strong>2.450+</strong><small>Việc làm mới</small></span>
          <span className="stat-trend"><Icon name="trend" /></span>
        </div>
        <div className="art-caption"><span />Your next chapter starts here</div>
      </div>
    </section>
  )
}
