import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyCompanyPage } from './pages/MyCompanyPage'
import { JobPostCreatePage } from './pages/JobPostCreatePage'
import { JobDetailPage } from './pages/JobDetailPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'
import { NavGroupPage } from './pages/NavGroupPage'
import { RegisterPage } from './pages/RegisterPage'
import { UpdateProfilePage } from './pages/UpdateProfilePage'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/categories/:groupId" element={<NavGroupPage />} />
        <Route path="/update-profile" element={<UpdateProfilePage />} />
        <Route path="/my-company" element={<MyCompanyPage />} />
        <Route path="/recruit/posts/new" element={<JobPostCreatePage />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />
        <Route path="/companies/:slug" element={<CompanyDetailPage />} />
      </Routes>
    </MainLayout>
  )
}

export default App
