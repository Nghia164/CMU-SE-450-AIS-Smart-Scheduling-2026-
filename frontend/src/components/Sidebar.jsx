// File này là thanh điều hướng bên trái: hiển thị thương hiệu, menu theo vai trò, thông tin người dùng và nút đăng xuất.
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Các icon SVG dùng cho menu, tra cứu theo tên.
const ICONS = {
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    </>
  ),
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
  plus: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  swap: (
    <>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </>
  ),
  minusCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  mapPin: (
    <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  receipt: (
    <>
      <path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 3 2V2l-3 2-3-2-3 2-3-2-3 2z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </>
  ),
  message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  home: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M16 13h2" />
      <path d="M2 10h20" />
    </>
  ),
  shiftList: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <line x1="7" y1="13" x2="17" y2="13" />
      <line x1="7" y1="17" x2="13" y2="17" />
    </>
  ),
};

// Cấu hình menu theo từng vai trò: trang chủ mặc định, nhãn vai trò, tiêu đề menu và danh sách trang đồng đều.
export const NAV_BY_ROLE = {
  ADMIN: {
    home: '/admin/accounts',
    roleLabel: 'Quản trị hệ thống',
    tagClass: 'bg-amber/25 text-[#ffb07c]',
    items: [
      { path: '/admin/accounts', label: 'Quản lý tài khoản', icon: 'users' },
      { path: '/admin/access', label: 'Phân quyền truy cập', icon: 'shield' },
      { path: '/manager/shifts', label: 'Quản lý ca làm', icon: 'clock' },
      { path: '/admin/health', label: 'Trạng thái dịch vụ', icon: 'activity' },
    ],
  },

  MANAGER: {
    home: '/manager/dashboard',
    roleLabel: 'Quản lý cửa hàng',
    tagClass: 'bg-matcha/35 text-green-300',
    items: [
      { path: '/manager/dashboard', label: 'Tổng quan', icon: 'grid' },
      { path: '/manager/employees', label: 'Quản lý nhân viên', icon: 'users' },
      { path: '/manager/shifts', label: 'Quản lý ca làm', icon: 'shiftList' },
      { path: '/manager/scheduling', label: 'Xếp lịch làm việc', icon: 'calendar' },
      { path: '/manager/requests', label: 'Duyệt nghỉ & Đổi ca', icon: 'swap' },
      { path: '/manager/open-shifts', label: 'Quản lý ca mở', icon: 'plus' },
      { path: '/manager/attendance', label: 'Chấm công', icon: 'mapPin' },
      { path: '/manager/timesheets', label: 'Xem bảng công', icon: 'receipt' },
      { path: '/manager/payroll', label: 'Tính lương', icon: 'wallet' },
      { path: '/manager/reports', label: 'Báo cáo vận hành', icon: 'download' },
      { path: '/manager/assistant', label: 'Trợ lý AI', icon: 'message' },
    ],
  },

  STAFF: {
    home: '/staff/home',
    roleLabel: 'Nhân viên cửa hàng',
    tagClass: 'bg-white/10 text-crema',
    items: [
      { path: '/staff/home', label: 'Trang chủ', icon: 'home' },
      { path: '/staff/schedule', label: 'Lịch làm của tôi', icon: 'calendar' },
      { path: '/staff/availability', label: 'Đăng ký lịch rảnh', icon: 'clock' },
      { path: '/staff/open-shifts', label: 'Nhận ca mở', icon: 'plus' },
      { path: '/staff/swap', label: 'Đổi ca', icon: 'swap' },
      { path: '/staff/leave', label: 'Xin nghỉ phép', icon: 'minusCircle' },
      { path: '/staff/attendance', label: 'Chấm công', icon: 'mapPin' },
      { path: '/staff/timesheets', label: 'Xem bảng công', icon: 'receipt' },
    ],
  },
};

// Hàm này trả về class cho một mục menu, tô sáng khi đường dẫn đang mở.
function linkClass(isActive) {
  return [
    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-[13px] font-semibold transition-all duration-150',
    isActive
      ? 'border-amber/40 bg-amber/15 text-white'
      : 'border-transparent text-crema/70 hover:border-white/10 hover:bg-white/5 hover:text-crema',
  ].join(' ');
}

// Component này hiển thị sidebar đầy đủ cho người dùng đang đăng nhập, menu được lấy theo vai trò của họ.
export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const config = NAV_BY_ROLE[user.role];

  // Hàm này đăng xuất và chuyển về trang đăng nhập.
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[272px] shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-roast text-crema">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber font-mono text-base font-bold text-white shadow-[0_8px_20px_rgba(217,107,39,0.35)]">
            SS
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 animate-pulse rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="font-mono text-[10px] tracking-[0.12em] text-crema/55"></span>
            <span className="truncate text-base font-bold tracking-tight">Smart Scheduling</span>
            <span className="truncate text-[11.5px] text-crema/55">Điều phối ca & Chấm công</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 font-mono text-[10.5px] text-crema/60">
          <span>07:00 – 22:00 • GPS 100m</span>
          <span className={`rounded px-2 py-0.5 font-semibold ${config.tagClass}`}>{user.role}</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <div className="px-3 pb-2 font-mono text-[10px] tracking-[0.08em] text-crema/40">{config.title}</div>
        {config.items.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => linkClass(isActive)}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[18px] w-[18px] shrink-0"
              aria-hidden="true"
            >
              {ICONS[item.icon]}
            </svg>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
          <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl p-3 transition-colors ${
              isActive ? 'bg-amber/15 ring-1 ring-amber/40' : 'bg-white/5 hover:bg-white/10'
            }`
          }
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber/20 font-mono text-sm font-bold text-[#ffb07c]">
            {user.fullName?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">{user.fullName}</p>
            <p className="truncate text-[11px] text-crema/50">{config.roleLabel}</p>
          </div>
        </NavLink>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] text-crema/70 transition-colors hover:bg-danger/20 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
            aria-hidden="true"
          >
            {ICONS.logout}
          </svg>
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}