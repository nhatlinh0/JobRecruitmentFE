import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyCompanyPage } from './pages/MyCompanyPage'
import { JobPostCreatePage } from './pages/JobPostCreatePage'
import { JobPostListPage } from './pages/JobPostListPage'
import { JobPostViewPage } from './pages/JobPostViewPage'
import { JobDetailPage } from './pages/JobDetailPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'
import { FieldJobsPage, SkillJobsPage } from './pages/TagJobsPage'
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
        <Route path="/recruit/posts/:id/edit" element={<JobPostCreatePage />} />
        <Route path="/recruit/posts/:id" element={<JobPostViewPage />} />
        <Route path="/recruit/posts" element={<JobPostListPage />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />
        <Route path="/companies/:slug" element={<CompanyDetailPage />} />
        <Route path="/skills/:slug" element={<SkillJobsPage />} />
        <Route path="/fields/:slug" element={<FieldJobsPage />} />
      </Routes>
    </MainLayout>
  )
}

export default App
