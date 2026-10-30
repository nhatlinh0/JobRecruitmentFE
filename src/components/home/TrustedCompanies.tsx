import './TrustedCompanies.css'

const companies = [
  { name: 'MoMo', className: 'logo-momo' },
  { name: 'tiki', className: 'logo-tiki' },
  { name: 'VNG', className: 'logo-vng' },
  { name: 'Shopee', className: 'logo-shopee' },
  { name: 'FPT Software', className: 'logo-fpt' },
  { name: 'Zalo', className: 'logo-zalo' },
]

export function TrustedCompanies() {
  return (
    <section className="trust-strip" aria-label="Đối tác tuyển dụng">
      <p>ĐƯỢC TIN DÙNG BỞI NHỮNG ĐỘI NGŨ TUYỆT VỜI</p>
      <div className="company-logos">
        {companies.map((company) => (
          <span className={company.className} key={company.name}>{company.name}</span>
        ))}
      </div>
    </section>
  )
}
