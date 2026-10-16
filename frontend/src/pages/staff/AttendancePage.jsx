// ============================================================
// AttendancePage.jsx — Trang "Chấm công GPS" cho STAFF (Task 2.7)
// Mobile prototype: container max-w-[480px] căn giữa.
// Nút CHECK IN / CHECK OUT tròn lớn + GPS geofence 100m + lịch sử chấm công.
// ============================================================

import { useEffect, useState } from 'react';
import {
  getTodayAttendance,
  getHistory,
  checkIn,
  checkOut,
} from '../../services/staff/attendanceService.js';

const ITEMS_PER_PAGE = 10;
const GEOFENCE_RADIUS_M = 100;
const SIM_IN_RANGE_M = 35;   // Mô phỏng: đứng trong cửa hàng
const SIM_OUT_RANGE_M = 120; // Mô phỏng: đứng ngoài vùng cho phép

const HISTORY_STATUS = {
  ON_TIME: { label: 'Đúng giờ', cls: 'bg-matcha/10 text-matcha' },
  LATE: { label: 'Đi muộn', cls: 'bg-amber/10 text-amber' },
  ABSENT: { label: 'Vắng mặt', cls: 'bg-danger/10 text-danger' },
  COMPLETED: { label: 'Hoàn thành', cls: 'bg-matcha/10 text-matcha' },
  MISSING_CHECK_OUT: { label: 'Thiếu check-out', cls: 'bg-danger/10 text-danger' },
};

// ---------- Phân trang 10 items/trang (ẩn khi ≤ 1 trang) ----------
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-center gap-1.5" aria-label="Phân trang">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="h-8 rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink transition-colors hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
      >
        « Trước
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`flex h-8 min-w-[2rem] items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors ${
            p === page
              ? 'bg-amber text-white shadow-[0_4px_12px_rgba(217,107,39,0.35)]'
              : 'border border-line bg-white text-ink hover:bg-crema'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="h-8 rounded-full border border-line bg-white px-3 text-xs font-semibold text-ink transition-colors hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sau »
      </button>
    </nav>
  );
}

const pad = (n) => String(n).padStart(2, '0');

export default function AttendancePage() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);
  const [busy, setBusy] = useState(false); // đang gọi check-in/out
  const [currentPage, setCurrentPage] = useState(1);
  const [simDistance, setSimDistance] = useState(SIM_IN_RANGE_M); // GPS mô phỏng

  // Đồng hồ thời gian thực (tick 1 giây)
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  // Toast tự ẩn sau 4 giây
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    try {
      const [t, h] = await Promise.all([getTodayAttendance(), getHistory()]);
      setToday(t);
      setHistory(h);
    } catch (err) {
      setLoadError(err.message || 'Không thể tải dữ liệu chấm công.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const clock = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateLabel = now
    .toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
    .replace(/^\w/, (c) => c.toUpperCase());

  const outOfRange = simDistance > GEOFENCE_RADIUS_M;
  const status = today?.status || 'NOT_CHECKED_IN';

  // Nhãn + màu nút tròn lớn theo trạng thái
  function bigButtonState() {
    if (status === 'NOT_CHECKED_IN') {
      return {
        text: 'CHECK IN',
        cls: 'bg-amber text-white shadow-[0_0_40px_rgba(217,107,39,0.4)] hover:brightness-110',
        enabled: true,
      };
    }
    if (status === 'CHECKED_IN') {
      return {
        text: 'CHECK OUT',
        cls: 'bg-matcha text-white shadow-[0_0_40px_rgba(45,122,77,0.45)] hover:brightness-110',
        enabled: true,
      };
    }
    return { text: 'HOÀN THÀNH', cls: 'bg-white/10 text-crema/60 cursor-not-allowed', enabled: false };
  }
  const btn = bigButtonState();

  async function handleCheckIn() {
    setBusy(true);
    try {
      const res = await checkIn({ distance: simDistance });
      if (!res.success) {
        setToast({ type: 'error', text: res.message });
      } else {
        setToday((prev) => ({ ...prev, checkedInAt: res.time, checkInDistance: res.distance, status: 'CHECKED_IN' }));
        setToast({ type: 'success', text: `Check-in thành công lúc ${res.time} · cách ${res.distance}m.` });
      }
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleCheckOut() {
    setBusy(true);
    try {
      const res = await checkOut({ distance: simDistance });
      if (!res.success) {
        setToast({ type: 'error', text: res.message });
      } else {
        setToday((prev) => ({ ...prev, checkedOutAt: res.time, status: 'COMPLETED' }));
        setToast({ type: 'success', text: `Check-out thành công lúc ${res.time}. Ca làm hoàn tất!` });
        // Làm mới lịch sử sau khi ca được ghi nhận
        const h = await getHistory();
        setHistory(h);
        setCurrentPage(1);
      }
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }

  function handleBigButton() {
    if (status === 'CHECKED_IN') handleCheckOut();
    else handleCheckIn();
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">Nhân viên · Chấm công</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">Điểm danh ca làm</h1>
        <p className="mt-1 text-[13px] text-muted">Check-in/out bằng GPS trong vùng cửa hàng {GEOFENCE_RADIUS_M}m.</p>
      </header>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 rounded-xl border px-4 py-3 text-center text-sm font-semibold shadow-lg backdrop-blur-sm ${
            toast.type === 'success'
              ? 'border-matcha/30 bg-matcha/10 text-matcha'
              : 'border-danger/30 bg-danger/10 text-danger'
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-oat border-t-amber" />
          <p className="mt-4 text-sm text-muted">Đang tải dữ liệu chấm công...</p>
        </div>
      )}

      {/* Lỗi tải dữ liệu */}
      {!loading && loadError && (
        <div className="mb-5 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3">
          <p className="text-sm font-medium text-danger">{loadError}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-2 text-xs font-semibold text-danger underline underline-offset-2 hover:opacity-75"
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !loadError && today && (
        <>
          {/* ===== Thẻ check-in trung tâm ===== */}
          <section className="mb-8 rounded-3xl bg-roast p-8 text-center text-crema shadow-[0_16px_40px_rgba(19,16,14,0.35)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">Hôm nay</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{today.shiftName}</h2>
            <p className="mt-1 text-sm text-crema/70">
              {today.scheduledStart} – {today.scheduledEnd}
            </p>

            {/* Đồng hồ hiện tại */}
            <p className="mt-5 font-mono text-4xl font-semibold tracking-tight">{clock}</p>
            <p className="mt-1 text-[11px] text-crema/50">{dateLabel}</p>

            {/* Nút tròn lớn */}
            <div className="mt-7 flex justify-center">
              <button
                type="button"
                onClick={handleBigButton}
                disabled={!btn.enabled || busy}
                className={`flex h-40 w-40 items-center justify-center rounded-full font-display text-xl font-bold transition-all active:scale-95 ${btn.cls} ${
                  busy ? 'cursor-wait opacity-80' : ''
                }`}
              >
                {busy ? (
                  <span className="h-7 w-7 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-label="Đang xử lý" />
                ) : (
                  btn.text
                )}
              </button>
            </div>

            {/* Trạng thái GPS mô phỏng */}
            {outOfRange ? (
              <div className="mx-auto mt-5 max-w-[300px] rounded-xl bg-danger/20 px-4 py-2.5 text-sm font-medium text-[#ffb0a3]">
                Ngoài vùng {GEOFENCE_RADIUS_M}m — không thể chấm công
              </div>
            ) : (
              <p className="mt-5 text-sm text-crema/80">📍 Cách cửa hàng {simDistance}m · Trong vùng cho phép</p>
            )}
            <button
              type="button"
              onClick={() => setSimDistance((d) => (d > GEOFENCE_RADIUS_M ? SIM_IN_RANGE_M : SIM_OUT_RANGE_M))}
              className="mt-2.5 text-[11px] font-medium text-crema/45 underline underline-offset-2 transition-colors hover:text-crema/80"
            >
              {outOfRange ? 'Mô phỏng: quay lại trong cửa hàng' : 'Mô phỏng: di chuyển ra ngoài vùng GPS'}
            </button>

            {/* Khối kết quả đã chấm công */}
            {(today.checkedInAt || today.checkedOutAt) && (
              <div className="mx-auto mt-5 max-w-[320px] space-y-1 rounded-xl bg-white/5 px-4 py-3 text-sm text-crema/85">
                {today.checkedInAt && (
                  <p>
                    Đã check-in lúc <span className="font-mono font-semibold text-crema">{today.checkedInAt}</span>
                    {today.checkInDistance !== null && <span className="text-crema/60"> · cách {today.checkInDistance}m</span>}
                  </p>
                )}
                {today.checkedOutAt && (
                  <p>
                    Đã check-out lúc <span className="font-mono font-semibold text-crema">{today.checkedOutAt}</span>
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ===== Lịch sử chấm công ===== */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Lịch sử chấm công</h2>
              <span className="rounded-full bg-oat px-2.5 py-1 text-[11px] font-semibold text-ink">{history.length}</span>
            </div>

            {paginatedHistory.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-paper py-10 text-center">
                <p className="text-sm text-muted">Chưa có bản ghi chấm công nào.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {paginatedHistory.map((rec) => {
                  const meta = HISTORY_STATUS[rec.status] || HISTORY_STATUS.ON_TIME;
                  return (
                    <div key={rec.id} className="rounded-2xl border border-line bg-paper p-4 shadow-[0_4px_16px_rgba(24,20,17,0.05)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-ink">{rec.date}</p>
                          <p className="mt-0.5 text-xs text-muted">{rec.shiftName}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-center gap-2 text-xs">
                        <span className="rounded-lg bg-crema px-2.5 py-1 font-mono text-ink">
                          {rec.checkInAt || '--:--'} → {rec.checkOutAt || '--:--'}
                        </span>
                        {rec.checkInDistance !== null && (
                          <span className="text-muted">· {rec.checkInDistance}m từ cửa hàng</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
          </section>
        </>
      )}
    </div>
  );
}
