// File này cấu hình định tuyến (routing), kiểm tra phân quyền (RequireAuth), bố cục chung (Sidebar, NotificationBell) và kết nối toàn bộ các trang của ứng dụng.
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NAV_BY_ROLE, Sidebar } from './components/Sidebar.jsx';
import NotificationBell from './components/NotificationBell.jsx';

// Các trang dùng chung
import { LoginPage } from './pages/LoginPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

// Các trang của Admin (4 file)
import AccessPage from './pages/admin/AccessPage.jsx';
import AccountsPage from './pages/admin/AccountsPage.jsx';
import HealthPage from './pages/admin/HealthPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';

// Các trang của Manager (11 file)
import AssistantPage from './pages/manager/AssistantPage.jsx';
import ManagerAttendancePage from './pages/manager/AttendancePage.jsx';
import DashboardPage from './pages/manager/DashboardPage.jsx';
import EmployeesPage from './pages/manager/EmployeesPage.jsx';
import ManagerOpenShiftsPage from './pages/manager/OpenShiftsPage.jsx';
import PayrollPage from './pages/manager/PayrollPage.jsx';
import ReportsPage from './pages/manager/ReportsPage.jsx';
import RequestsPage from './pages/manager/RequestsPage.jsx';
import SchedulingPage from './pages/manager/SchedulingPage.jsx';
import ShiftsPage from './pages/manager/ShiftsPage.jsx';
import ManagerTimesheetsPage from './pages/manager/TimesheetsPage.jsx';

// Các trang của Staff (8 file)
import StaffAttendancePage from './pages/staff/AttendancePage.jsx';
import AvailabilityPage from './pages/staff/AvailabilityPage.jsx';
import HomePage from './pages/staff/HomePage.jsx';
import LeavePage from './pages/staff/LeavePage.jsx';
import StaffOpenShiftsPage from './pages/staff/OpenShiftsPage.jsx';
import SchedulePage from './pages/staff/SchedulePage.jsx';
import SwapPage from './pages/staff/SwapPage.jsx';
import StaffTimesheetsPage from './pages/staff/TimesheetsPage.jsx';

// Component này chuyển hướng đường dẫn gốc '/' về trang chủ mặc định theo vai trò của người dùng.
function HomeRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const target = NAV_BY_ROLE[user.role]?.home ?? '/login';
  return <Navigate to={target} replace />;
}

// Component này bảo vệ các route yêu cầu đăng nhập và kiểm tra vai trò được phép truy cập.
function RequireAuth({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = NAV_BY_ROLE[user.role]?.home ?? '/';
    return <Navigate to={fallback} replace />;
  }

  return children ?? <Outlet />;
}

// Component này dựng khung giao diện chính gồm Sidebar bên trái, thanh tiêu đề chứa chuông thông báo và vùng nội dung trang.
function AppLayout() {
  const { user } = useAuth();
  const roleLabel = NAV_BY_ROLE[user.role]?.roleLabel ?? user.role;

  return (
    <div className="flex min-h-screen bg-crema font-sans text-ink">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-paper/90 px-8 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 text-xs text-muted">
            <span className="font-mono uppercase tracking-[0.08em] text-amber">STORE-01</span>
            <span>•</span>
            <span className="font-medium text-ink">{roleLabel}</span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Component này bọc toàn bộ hệ thống định tuyến trong AuthProvider và BrowserRouter.
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang đăng nhập công khai */}
          <Route path="/login" element={<LoginPage />} />

          {/* Điều hướng mặc định theo vai trò */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Các trang bên trong hệ thống (yêu cầu đã đăng nhập) */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            {/* Trang hồ sơ cá nhân dùng chung cho mọi vai trò */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Nhóm route dành cho ADMIN */}
            <Route element={<RequireAuth roles={['ADMIN']} />}>
              <Route path="/admin/accounts" element={<AccountsPage />} />
              <Route path="/admin/access" element={<AccessPage />} />
              <Route path="/admin/health" element={<HealthPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
            </Route>

            {/* Trang Quản lý ca làm cho phép cả ADMIN và MANAGER truy cập theo cấu hình Sidebar */}
            <Route element={<RequireAuth roles={['ADMIN', 'MANAGER']} />}>
              <Route path="/manager/shifts" element={<ShiftsPage />} />
            </Route>

            {/* Nhóm route dành cho MANAGER */}
            <Route element={<RequireAuth roles={['MANAGER']} />}>
              <Route path="/manager/dashboard" element={<DashboardPage />} />
              <Route path="/manager/employees" element={<EmployeesPage />} />
              <Route path="/manager/scheduling" element={<SchedulingPage />} />
              <Route path="/manager/requests" element={<RequestsPage />} />
              <Route path="/manager/open-shifts" element={<ManagerOpenShiftsPage />} />
              <Route path="/manager/attendance" element={<ManagerAttendancePage />} />
              <Route path="/manager/timesheets" element={<ManagerTimesheetsPage />} />
              <Route path="/manager/payroll" element={<PayrollPage />} />
              <Route path="/manager/reports" element={<ReportsPage />} />
              <Route path="/manager/assistant" element={<AssistantPage />} />
            </Route>

            {/* Nhóm route dành cho STAFF */}
            <Route element={<RequireAuth roles={['STAFF']} />}>
              <Route path="/staff/home" element={<HomePage />} />
              <Route path="/staff/schedule" element={<SchedulePage />} />
              <Route path="/staff/availability" element={<AvailabilityPage />} />
              <Route path="/staff/open-shifts" element={<StaffOpenShiftsPage />} />
              <Route path="/staff/swap" element={<SwapPage />} />
              <Route path="/staff/leave" element={<LeavePage />} />
              <Route path="/staff/attendance" element={<StaffAttendancePage />} />
              <Route path="/staff/timesheets" element={<StaffTimesheetsPage />} />
            </Route>
          </Route>

          {/* Đường dẫn không tồn tại tự động quay về trang gốc */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}