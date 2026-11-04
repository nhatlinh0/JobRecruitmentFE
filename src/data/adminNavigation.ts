export const adminNavigation = [
  { id: 'reset-password', label: 'Đặt lại mật khẩu', to: '/admin/reset-password', icon: 'settings', description: 'Đặt lại mật khẩu tài khoản bằng địa chỉ email.' },
  { id: 'companies', label: 'Quản lý công ty', to: '/admin/companies', icon: 'briefcase', description: 'Theo dõi thông tin và trạng thái các công ty trên hệ thống.' },
  { id: 'users', label: 'Quản lý người dùng', to: '/admin/users', icon: 'settings', description: 'Quản lý thông tin tài khoản và trạng thái người dùng.' },
  { id: 'jobs', label: 'Quản lý công việc', to: '/admin/jobs', icon: 'code', description: 'Theo dõi nội dung và trạng thái các công việc trên hệ thống.' },
] as const
