// File này là chuông thông báo: hiển thị số thông báo chưa đọc và danh sách thông báo theo tài khoản đang đăng nhập.
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { mockNotifications } from '../mock/notifications.js';

// Nhãn tiếng Việt cho từng loại thông báo.
const TYPE_LABEL = {
  SCHEDULE: 'Lịch làm',
  LEAVE: 'Nghỉ phép',
  SHIFT_SWAP: 'Đổi ca',
  OPEN_SHIFT: 'Ca mở',
  ATTENDANCE: 'Chấm công',
  TIMESHEET: 'Bảng công',
  SYSTEM: 'Hệ thống',
};

// Hàm này đổi thời điểm sang chuỗi ngày giờ ngắn gọn theo chuẩn Việt Nam.
function formatTime(iso) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Component này là chuông thông báo: bấm để mở danh sách, bấm vào một thông báo để đánh dấu đã đọc.
export default function NotificationBell() {
  const { user } = useAuth();
  const [items, setItems] = useState(() => mockNotifications[user.id] ?? []);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const unreadCount = items.filter((n) => !n.isRead).length;

  // Hiệu ứng này đóng danh sách khi bấm ra ngoài hoặc nhấn phím Escape.
  useEffect(() => {
    if (!open) return;

    // Hàm này đóng danh sách khi người dùng bấm ra ngoài vùng chuông.
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    // Hàm này đóng danh sách khi người dùng nhấn Escape.
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Hàm này đánh dấu một thông báo là đã đọc.
  function markAsRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  // Hàm này đánh dấu tất cả thông báo là đã đọc.
  function markAllAsRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        title="Thông báo"
        aria-label="Thông báo"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-line bg-paper text-ink transition-colors hover:bg-oat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-danger px-1.5 font-mono text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 flex max-h-[440px] w-[360px] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_16px_40px_rgba(24,20,17,0.16)]">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-semibold text-ink">Thông báo</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="cursor-pointer text-xs font-semibold text-amber hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>

          <div className="overflow-y-auto">
            {items.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">Chưa có thông báo nào.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markAsRead(n.id)}
                  className={`flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-crema ${
                    n.isRead ? 'opacity-70' : ''
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-amber'}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted">
                        {TYPE_LABEL[n.type]}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-muted">{formatTime(n.createdAt)}</span>
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold text-ink">{n.title}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-muted">{n.message}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}