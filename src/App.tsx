import { Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MyCompanyPage } from './pages/MyCompanyPage'
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
      </Routes>
    </MainLayout>
  )
}

export default App
