import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyCompanyPage } from './pages/MyCompanyPage'
import { JobPostCreatePage } from './pages/JobPostCreatePage'
import { JobPostListPage } from './pages/JobPostListPage'
import { JobPostViewPage } from './pages/JobPostViewPage'
import { JobApplicantsPage } from './pages/JobApplicantsPage'
import { JobDetailPage } from './pages/JobDetailPage'
import { CompanyDetailPage } from './pages/CompanyDetailPage'
import { FieldJobsPage, SkillJobsPage, CompanyJobsPage } from './pages/TagJobsPage'
import { IndustryCompaniesPage } from './pages/IndustryCompaniesPage'
import { NavGroupPage } from './pages/NavGroupPage'
import { RegisterPage } from './pages/RegisterPage'
import { UpdateProfilePage } from './pages/UpdateProfilePage'
import { ChangePasswordPage } from './pages/ChangePasswordPage'
import { UserJobsPage } from './pages/UserJobsPage'
import { AppliedJobsPage } from './pages/AppliedJobsPage'
import { AdminPage } from './pages/AdminPage'
import { AdminCompaniesPage } from './pages/AdminCompaniesPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminJobsPage } from './pages/AdminJobsPage'
import { AdminResetPasswordPage } from './pages/AdminResetPasswordPage'
import { AdminIndustriesPage } from './pages/AdminIndustriesPage'
import { AdminDomainsPage } from './pages/AdminDomainsPage'
import { AdminSkillsPage } from './pages/AdminSkillsPage'
import { JobSearchPage } from './pages/JobSearchPage'
import { UpgradePackagesPage } from './pages/UpgradePackagesPage'

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/companies" element={<AdminCompaniesPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/jobs" element={<AdminJobsPage />} />
        <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
        <Route path="/admin/industries" element={<AdminIndustriesPage />} />
        <Route path="/admin/domains" element={<AdminDomainsPage />} />
        <Route path="/admin/skills" element={<AdminSkillsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/saved-jobs" element={<UserJobsPage kind="saved" />} />
        <Route path="/applied-jobs" element={<AppliedJobsPage />} />
        <Route path="/categories/:groupId" element={<NavGroupPage />} />
        <Route path="/update-profile" element={<UpdateProfilePage />} />
        <Route path="/my-company" element={<MyCompanyPage />} />
        <Route path="/recruit/upgrade" element={<UpgradePackagesPage />} />
        <Route path="/recruit/posts/new" element={<JobPostCreatePage />} />
        <Route path="/recruit/posts/:id/edit" element={<JobPostCreatePage />} />
        <Route path="/recruit/posts/:id/applicants" element={<JobApplicantsPage />} />
        <Route path="/recruit/posts/:id" element={<JobPostViewPage />} />
        <Route path="/recruit/posts" element={<JobPostListPage />} />
        <Route path="/jobs/search" element={<JobSearchPage />} />
        <Route path="/jobs/filter" element={<JobSearchPage filtered />} />
        <Route path="/jobs/:slug" element={<JobDetailPage />} />
        <Route path="/companies/:slug" element={<CompanyDetailPage />} />
        <Route path="/companies/:slug/jobs" element={<CompanyJobsPage />} />
        <Route path="/industries/:slug" element={<IndustryCompaniesPage />} />
        <Route path="/skills/:slug" element={<SkillJobsPage />} />
        <Route path="/fields/:slug" element={<FieldJobsPage />} />
      </Routes>
    </MainLayout>
  )
}

export default App
