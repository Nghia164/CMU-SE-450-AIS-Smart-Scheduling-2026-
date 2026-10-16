// File này là trang đăng nhập được thiết kế lại theo phong cách F&B cao cấp:
// gradient nền espresso, glassmorphism card, background pattern, animation tinh tế.
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { extractErrorMessage } from '../api/client.js';
import { mockUsers } from '../mock/users.js';

// Các vai trò để tạo nút điền nhanh tài khoản khi test.
const QUICK_ROLES = [
  { role: 'ADMIN', label: 'Admin', color: 'bg-amber' },
  { role: 'MANAGER', label: 'Manager', color: 'bg-matcha' },
  { role: 'STAFF', label: 'Staff', color: 'bg-ink' },
];

// Mô tả cho ba chỉ số ở chân khu giới thiệu.
const STORE_STATS = [
  { value: '12', label: ' Ca/ngày' },
  { value: '8', label: ' Nhân sự' },
  { value: '100m', label: ' GPS Geofence' },
];

// Danh sách logo placeholder cho phần footer giới thiệu.
const TEAM_AVATARS = [
  { initials: 'NB', role: 'Barista cao cấp', color: 'bg-gradient-to-br from-amber to-[#b95a1a]' },
  { initials: 'MT', role: 'Thu ngân', color: 'bg-gradient-to-br from-matcha to-[#22633d]' },
  { initials: 'PV', role: 'Phục vụ', color: 'bg-gradient-to-br from-ink to-[#403834]' },
];

// Hàm này định dạt Date thành chuỗi giờ HH:MM:SS theo chuẩn Việt Nam.
function formatClock(date) {
  return date.toLocaleTimeString('vi-VN', { hour12: false });
}

// Component này hiển thị đồng hồ số trực tiếp, cập nhật mỗi giây, đóng vai làm sống động cho nền.
function LiveClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-xs text-crema backdrop-blur-sm">
      <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]" />
      {formatClock(now)}
    </div>
  );
}

// Component này là thẻ nhỏ hiển thị thời gian làm việc của ca trong showcase bên trái.
function ShiftPreview({ label, hours, staff, status }) {
  const statusClass = {
    full: 'border-green-400/30 bg-green-400/10 text-green-300',
    open: 'border-amber/40 bg-amber/20 text-[#ffb07c]',
  };
  return (
    <div className="group relative flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition-all duration-300 hover:border-amber/30 hover:bg-amber/5">
      <div>
        <p className="font-mono text-xs font-semibold tracking-[0.06em] text-amber">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-crema">{hours}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-crema/60">{staff} / 2 nhân sự</p>
        <span className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold ${statusClass[status]}`}>
          {status === 'full' ? 'ĐÃ CHẤT' : 'CÒN MỞ'}
        </span>
      </div>
      <div className="absolute inset-0 -z-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-amber/5 to-transparent" />
    </div>
  );
}

// Component này hiển thị khu giới thiệu bên trái: logo, tiêu đề, số liệu, bảng ca mẫu.
function ShowcasePanel() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden border-r border-white/10 bg-[linear-gradient(165deg,rgba(15,12,10,0.75)_0%,rgba(25,19,16,0.9)_100%)] px-12 py-12 text-crema max-[1024px]:hidden">
      {/* Nền có pattern */}
      <div className="absolute inset-0 bg-[length:60px_60px] bg-[linear-gradient(to_right,rgba(217,107,39,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(217,107,39,0.04)_1px,transparent_1px)]" />
      <div className="absolute top-0 right-0 h-96 w-96 translate-x-20 -translate-y-20 rounded-full bg-amber/10 blur-[120px] filter" />
      <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-20 translate-y-20 rounded-full bg-matcha/10 blur-[100px]" />

      {/* Header: Logo + Live Clock */}
      <div className="relative flex items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-amber font-mono text-xl font-bold tracking-[-0.03em] text-white shadow-[0_12px_32px_rgba(217,107,39,0.35)]">
              SS
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-green-400 shadow-[0_0_10px_#4ade80]" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-xs tracking-[0.12em] text-[#f09a5e]">F&B WORKFORCE</span>
            <span className="text-2xl font-bold tracking-tight text-crema">Smart Scheduling</span>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* Hero headline */}
      <div className="relative my-10">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-[#f09a5e]">
          ĐIỀU PHỐI CA LÀM THÔNG MINH
        </p>
        <h2 className="mb-4 font-display text-[2.6rem] leading-[1.1] font-bold tracking-tight text-white">
          Xếp lịch <span className="text-[#f3a268]">đúng người</span>,<br />
          <span className="text-amber">đúng ca</span>, đúng quy tắc.
        </h2>
        <p className="max-w-[540px] text-[15.5px] leading-[1.7] text-crema/70">
          Quản lý ca làm, khả năng nhận ca, xin nghỉ, đổi ca và{' '}
          <strong className="font-semibold text-crema">chấm công GPS</strong>{' '}
          trên một nền tảng duy nhất cho cửa hàng F&B của bạn.
        </p>
      </div>

      {/* Store Stats */}
      <div className="relative mb-10 grid grid-cols-3 gap-2.5">
        {STORE_STATS.map((stat) => (
          <div key={stat.label} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-[2px]">
            <span className="font-display text-2xl font-bold text-amber">{stat.value}</span>
            <span className="text-xs text-crema/55">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Shift Preview */}
      <div className="relative space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-crema/40">
          BẢNG ĐIỀU PHỐI HÔM NAY
        </p>
        <div className="rounded-[18px] border border-white/10 bg-[rgba(8,6,5,0.55)] p-4 backdrop-blur-sm">
          <ShiftPreview label="CA-SÁNG" hours="07:00–12:00" staff="2" status="full" />
          <ShiftPreview label="CA-CHIỀU" hours="12:00–17:00" staff="1" status="open" />
          <ShiftPreview label="CA-TỐI" hours="17:00–22:00" staff="1" status="open" />
        </div>
      </div>

      {/* Team Avatars */}
      <div className="relative mt-10 flex items-center gap-5">
        <span className="text-[10px] font-mono uppercase tracking-[0.06em] text-crema/45">Đội ngũ hiện tại</span>
        <div className="flex -space-x-2">
          {TEAM_AVATARS.map((avatar) => (
            <div
              key={avatar.initials}
              className={`relative h-10 w-10 rounded-full ${avatar.color} grid place-items-center font-mono text-xs font-bold text-white ring-2 ring-ink`}
              title={`${avatar.initials} — ${avatar.role}`}
            >
              {avatar.initials}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Component này là thẻ đăng nhập phía bên phải.
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Hàm này gửi thông tin đăng nhập; thành công thì chuyển đến trang được yêu cầu, thất bại thì hiện lỗi.
  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      const from = location.state?.from ?? '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Hàm này điền sẵn tài khoản mẫu của một vai trò vào form để test nhanh.
  function fillRole(role) {
    const account = mockUsers.find((u) => u.role === role);
    if (!account) return;
    setIdentifier(account.username);
    setPassword(account.password);
    setError(null);
  }

  // Xác định vai trò đang được điền trong form để tô màu nút tương ứng.
  const activeRole = mockUsers.find(
    (u) => u.username === identifier && u.password === password,
  )?.role;

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-espresso font-sans text-ink">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(217,107,39,0.18),transparent_42%),radial-gradient(circle_at_88%_82%,rgba(45,122,77,0.12),transparent_45%)]" />
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-[length:48px_48px] bg-[linear-gradient(to_right,rgba(246,241,231,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(246,241,231,0.04)_1px,transparent_1px)]" />
      {/* Floating orbs for depth */}
      <div className="absolute top-1/4 -left-48 h-96 w-96 rounded-full bg-amber/5 blur-[100px] filter" />
      <div className="absolute bottom-1/4 right-0 h-80 w-80 rounded-full bg-matcha/5 blur-[100px]" />

      {/* Central card */}
      <div className="relative z-10 my-8 grid w-full max-w-[1180px] grid-cols-[1.2fr_0.8fr] overflow-hidden rounded-[28px] border border-white/10 bg-roast/70 shadow-[0_32px_80px_rgba(0,0,0,0.55)] max-[1024px]:my-0 max-[1024px]:max-w-[460px] max-[1024px]:grid-cols-1">
        <ShowcasePanel />

        <section className="flex items-center justify-center p-10 max-[1024px]:p-6">
          {/* Glassmorphism form card */}
          <div className="relative w-full max-w-[380px] space-y-6">
            {/* Form card with glass effect */}
            <div className="rounded-[20px] border border-white/10 bg-paper/70 p-8 shadow-[0_16px_40px_rgba(24,20,17,0.15)] backdrop-blur-[8px]">
              {/* Badge header */}
              <div className="mb-[18px] flex justify-between border-b border-white/5 pb-3 font-mono text-[9px] uppercase tracking-[0.08em] text-muted/60">
                <span>PHIÊN ĐĂNG NHẬP</span>
                <span>STORE-01</span>
              </div>

              {/* Auth label */}
              <div className="mb-5 flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink font-mono text-xs font-bold text-crema">
                  SS
                </span>
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-amber">
                  XÁC THỰC
                </span>
              </div>

              {/* Headline */}
              <div className="mb-5">
                <h1 className="font-display text-[26px] font-semibold tracking-tight text-ink">
                  Chào mừng trở lại
                </h1>
                <p className="mt-1.5 text-sm text-muted">
                  Đăng nhập để xem lịch làm và chấm công của bạn.
                </p>
              </div>

              {/* Form */}
              <form className="space-y-[18px]" onSubmit={handleSubmit} noValidate>
                {/* Identifier field */}
                <div className="flex flex-col gap-[7px]">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="identifier" className="text-[13px] font-semibold text-ink">
                      Tên đăng nhập hoặc email
                    </label>
                    <span className="font-mono text-[10px] text-muted">01</span>
                  </div>
                  <div className="relative flex items-center">
                    <svg
                      className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-muted"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                    </svg>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border-[1.5px] border-line bg-white/60 px-4 pl-11 font-sans text-sm text-ink placeholder:text-muted/40 backdrop-blur-[4px] transition-all focus:border-amber focus:shadow-[0_0_0_4px_rgba(217,107,39,0.16)] focus:outline-none"
                      placeholder="Nhập tên tài khoản"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="flex flex-col gap-[7px]">
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="password" className="text-[13px] font-semibold text-ink">
                      Mật khẩu
                    </label>
                    <span className="font-mono text-[10px] text-muted">02</span>
                  </div>
                  <div className="relative flex items-center">
                    <svg
                      className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-muted"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <rect x="5" y="11" width="14" height="10" rx="2" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                    </svg>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 w-full rounded-xl border-[1.5px] border-line bg-white/60 px-4 pl-11 pr-[72px] font-sans text-sm text-ink placeholder:text-muted/40 backdrop-blur-[4px] transition-all focus:border-amber focus:shadow-[0_0_0_4px_rgba(217,107,39,0.16)] focus:outline-none"
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      className="absolute right-2.5 cursor-pointer rounded-[7px] border border-line bg-crema px-[9px] py-[5px] font-mono text-[10px] font-semibold text-ink transition-colors hover:bg-oat"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? 'ẨN' : 'HIỆN'}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <p
                    role="alert"
                    className="m-0 flex items-center gap-2.5 rounded-xl border border-[#f5c2bc] bg-[#fef2f0] px-3.5 py-3 text-[13px] font-medium text-danger"
                  >
                    <span className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full bg-danger font-mono text-xs font-bold text-white">
                      !
                    </span>
                    {error}
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-2 flex h-[50px] w-full cursor-pointer items-center justify-between rounded-xl bg-ink px-5 text-[14.5px] font-semibold text-crema transition-all duration-200 enabled:hover:bg-amber enabled:hover:text-white enabled:hover:shadow-[0_10px_24px_rgba(217,107,39,0.3)] disabled:cursor-not-allowed disabled:opacity-65"
                >
                  <span>{submitting ? 'Đang xác thực...' : 'Đăng nhập'}</span>
                  <span className="font-mono text-lg transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </form>
            </div>

            {/* Quick role selection */}
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-[6px]">
              <div className="mb-2.5 flex items-center justify-between font-mono text-[10px] text-muted/70">
                <span>TÀI KHOẢN TEST</span>
                <span className="text-amber">chọn để điền nhanh</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_ROLES.map(({ role, label, color }) => {
                  const isActive = activeRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => fillRole(role)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-[9px] border px-2.5 py-2.5 text-[10.5px] transition-all duration-150 ${
                        isActive
                          ? `border-transparent ${color} text-white shadow-[0_4px_12px_rgba(0,0,0,0.25)]`
                          : 'border-line bg-white/60 text-ink hover:border-amber hover:bg-amber/5'
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${isActive ? 'bg-white' : 'bg-amber'} ${
                          isActive ? 'animate-pulse' : ''
                        }`}
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10.5px] text-muted/70">
              <span>Kết nối bảo mật</span>
              <span className="mx-1">·</span>
              <span>v1.0</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
