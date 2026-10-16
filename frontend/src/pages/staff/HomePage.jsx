// ============================================================
// PAGE: Trang chủ Staff (mobile prototype max-width 480px)
// Ca làm tiếp theo + đếm ngược + hành động nhanh + thông báo có phân trang
// ============================================================
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getHomeData } from '../../services/staff/homeService.js';

const ITEMS_PER_PAGE = 10;

// Thời gian tương đối tiếng Việt
function timeAgo(stamp) {
  // stamp dạng "2026-10-14 21:40" — quy về mốc giả lập 14/10/2026 22:00
  const [d, t] = stamp.split(' ');
  const [y, m, day] = d.split('-').map(Number);
  const [h, min] = t.split(':').map(Number);
  const then = new Date(y, m - 1, day, h, min).getTime();
  const now = new Date(2026, 9, 14, 22, 0).getTime();
  const diffMin = Math.round((now - then) / 60000);
  if (diffMin < 1) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)} giờ trước`;
  return `${Math.floor(diffMin / 1440)} ngày trước`;
}

// Icon hành động nhanh
const ACTION_ICONS = {
  mapPin: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  swap: <path d="M17 2l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 22l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3" />,
  minusCircle: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M8 12h8" />,
};

const NOTIF_TYPE_BADGE = {
  SCHEDULE: { label: 'Lịch', cls: 'bg-amber/10 text-amber' },
  OPEN_SHIFT: { label: 'Ca mở', cls: 'bg-amber/10 text-amber' },
  LEAVE: { label: 'Nghỉ phép', cls: 'bg-matcha/10 text-matcha' },
  SHIFT_SWAP: { label: 'Đổi ca', cls: 'bg-matcha/10 text-matcha' },
  ATTENDANCE: { label: 'Chấm công', cls: 'bg-danger/10 text-danger' },
  TIMESHEET: { label: 'Bảng công', cls: 'bg-oat text-ink' },
  SYSTEM: { label: 'Hệ thống', cls: 'bg-muted/10 text-muted' },
};

// Đếm ngược tới giờ bắt đầu ca (mốc giả lập: 14/10/2026 10:00)
function useCountdown(targetDate, targetTime) {
  const [text, setText] = useState('');
  useEffect(() => {
    function tick() {
      const [y, m, d] = targetDate.split('-').map(Number);
      const [h, min] = targetTime.split(':').map(Number);
      const target = new Date(y, m - 1, d, h, min).getTime();
      const now = new Date(2026, 9, 14, 10, 0).getTime(); // mốc giả lập ổn định
      const diff = target - now;
      if (diff <= 0) {
        setText('Đang diễn ra');
        return;
      }
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      setText(hours > 0 ? `Còn ${hours} giờ ${minutes} phút nữa` : `Còn ${minutes} phút nữa`);
    }
    tick();
    const timer = setInterval(tick, 60000);
    return () => clearInterval(timer);
  }, [targetDate, targetTime]);
  return text;
}

// Giá trị mặc định để hook luôn được gọi với đối số hợp lệ kể cả khi đang tải
const DEFAULT_SHIFT = { date: '2026-10-15', startTime: '12:00' };

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getHomeData()
      .then(setData)
      .catch(() => setError('Không tải được dữ liệu trang chủ. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  const nextShiftForCountdown = data?.nextShift ?? DEFAULT_SHIFT;
  const countdown = useCountdown(nextShiftForCountdown.date, nextShiftForCountdown.startTime);

  // Phân trang thông báo
  const notifications = data?.notifications ?? [];
  const totalPages = Math.max(1, Math.ceil(notifications.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const visibleNotifs = notifications.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
        <div className="flex flex-col items-center gap-3 py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải trang chủ...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">{error}</div>
      </div>
    );
  }

  const { nextShift, myStats, quickActions } = data;

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Chào mừng */}
      <header className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-amber">STORE-01 · F&B</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          Xin chào, {user?.fullName ?? 'bạn'}
        </h1>
        <p className="mt-0.5 text-sm text-muted">Hôm nay là thứ Ba, 14/10/2026</p>
      </header>

      {/* Thẻ ca tiếp theo */}
      <section className="mb-5 rounded-2xl bg-roast p-5 text-crema shadow-[0_16px_40px_rgba(19,16,14,0.35)]">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#f09a5e]">Ca làm tiếp theo</p>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
            nextShift.status === 'CONFIRMED' ? 'bg-matcha/25 text-green-300' : 'bg-amber/25 text-[#ffb07c]'
          }`}>
            {nextShift.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : 'CHỜ XÁC NHẬN'}
          </span>
        </div>
        <p className="mt-3 font-display text-3xl font-semibold">{nextShift.shiftName}</p>
        <p className="mt-1 font-mono text-lg text-[#f3a268]">
          {nextShift.startTime} – {nextShift.endTime}
        </p>
        <p className="mt-2 text-sm text-crema/70">
          {nextShift.date} · {nextShift.position} · {nextShift.store}
        </p>
        <p className="mt-1 text-xs text-crema/50">
          Check-in cho phép: {nextShift.checkInWindow} · GPS 100m
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-crema">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
            {countdown}
          </span>
          <Link
            to="/staff/schedule"
            className="rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber/90"
          >
            Xem lịch
          </Link>
        </div>
      </section>

      {/* Thống kê tuần */}
      <section className="mb-5 grid grid-cols-4 gap-2.5">
        {[
          { label: 'Giờ/tuần', value: `${myStats.hoursThisWeek}h` },
          { label: 'Ca/tuần', value: myStats.shiftsThisWeek },
          { label: 'Chờ duyệt', value: myStats.pendingRequests },
          { label: 'Nghỉ duyệt', value: myStats.approvedLeave },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-paper p-3 text-center">
            <p className="font-display text-lg font-semibold text-ink">{s.value}</p>
            <p className="text-[10px] text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Hành động nhanh */}
      <section className="mb-5 grid grid-cols-4 gap-2.5">
        {quickActions.map((a) => (
          <Link
            key={a.id}
            to={a.path}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-paper p-3 transition-all duration-150 active:scale-95 hover:border-amber/50 hover:bg-amber/5"
          >
            <svg className="h-5 w-5 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ACTION_ICONS[a.icon]}
            </svg>
            <span className="text-[10.5px] font-semibold text-ink">{a.label}</span>
          </Link>
        ))}
      </section>

      {/* Thông báo */}
      <section className="rounded-2xl border border-line bg-paper">
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5">
          <h2 className="text-sm font-semibold text-ink">Thông báo</h2>
          {unreadCount > 0 && (
            <span className="rounded-full bg-danger px-2 py-0.5 text-[10px] font-bold text-white">
              {unreadCount} mới
            </span>
          )}
        </div>
        <ul className="divide-y divide-line">
          {visibleNotifs.map((n) => {
            const badge = NOTIF_TYPE_BADGE[n.type] ?? NOTIF_TYPE_BADGE.SYSTEM;
            return (
              <li key={n.id} className="flex gap-3 px-4 py-3.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-line' : 'bg-danger'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate text-[13px] ${n.isRead ? 'text-muted' : 'font-semibold text-ink'}`}>{n.title}</p>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${badge.cls}`}>{badge.label}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted">{n.message}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted/60">{timeAgo(n.createdAt)}</p>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Phân trang thông báo */}
        {notifications.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <p className="text-[11px] text-muted">
              Trang {safePage}/{totalPages} · {notifications.length} thông báo
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
              >
                « Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 cursor-pointer rounded-full text-[11px] font-semibold transition-colors ${
                    page === safePage ? 'bg-amber text-white' : 'border border-line bg-white text-muted hover:border-amber hover:text-amber'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="cursor-pointer rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau »
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

