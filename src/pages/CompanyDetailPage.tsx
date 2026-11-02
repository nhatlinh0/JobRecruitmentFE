import { useParams } from 'react-router-dom'
import { CompanyApiDetail } from './CompanyApiDetail'
import './CompanyDetailPage.css'

export function CompanyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  return <CompanyApiDetail key={slug} slug={slug ?? ''} />
}