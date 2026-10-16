// ============================================================
// TimesheetsPage.jsx — Trang "Bảng công" cho STAFF (Task 2.8)
// Mobile prototype: container max-w-[480px] căn giữa.
// Thẻ tổng hợp kỳ công + chi tiết giờ công (phân trang 10 items/trang).
// ============================================================

import { useEffect, useState } from 'react';
import { getMyTimesheets } from '../../services/staff/timesheetService.js';

const ITEMS_PER_PAGE = 10;

const moneyFormat = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const TIMESHEET_STATUS = {
  APPROVED: { label: 'Đã duyệt', cls: 'bg-matcha/10 text-matcha' },
  PENDING_APPROVAL: { label: 'Chờ duyệt', cls: 'bg-amber/10 text-amber' },
  REJECTED: { label: 'Từ chối', cls: 'bg-danger/10 text-danger' },
  DRAFT: { label: 'Nháp', cls: 'bg-muted/10 text-muted' },
  ADJUSTED: { label: 'Đã điều chỉnh', cls: 'bg-oat text-ink' },
};

const FILTERS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
  { value: 'REJECTED', label: 'Từ chối' },
  { value: 'DRAFT', label: 'Nháp' },
  { value: 'ADJUSTED', label: 'Điều chỉnh' },
];

// Định dạng số giờ: 4.5 → "4.5h"
const fmtHours = (h) => `${Number(h).toFixed(1)}h`;

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

export default function TimesheetsPage() {
  const [summary, setSummary] = useState(null);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await getMyTimesheets();
      setSummary(res.summary);
      setTimesheets(res.timesheets);
    } catch (err) {
      setLoadError(err.message || 'Không thể tải bảng công.');
    } finally {
      setLoading(false);
    }
  }

  // Lọc theo trạng thái
  const filtered = filter === 'ALL' ? timesheets : timesheets.filter((t) => t.status === filter);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTimesheets = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function handleFilterChange(value) {
    setFilter(value);
    setCurrentPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">Nhân viên · Bảng công</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">Bảng công của tôi</h1>
        <p className="mt-1 text-[13px] text-muted">Tổng hợp giờ thường, tăng ca và lương ước tính theo kỳ.</p>
      </header>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-oat border-t-amber" />
          <p className="mt-4 text-sm text-muted">Đang tải bảng công...</p>
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

      {!loading && !loadError && summary && (
        <>
          {/* ===== Thẻ tổng hợp kỳ công ===== */}
          <section className="mb-6 rounded-2xl bg-roast p-5 text-crema shadow-[0_16px_40px_rgba(19,16,14,0.35)]">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">{summary.periodLabel}</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-xl bg-white/5 px-2 py-3">
                <p className="font-display text-xl font-semibold leading-none">{fmtHours(summary.regularHours)}</p>
                <p className="mt-1.5 text-[11px] text-crema/60">Giờ thường</p>
              </div>
              <div className="rounded-xl bg-amber/15 px-2 py-3">
                <p className="font-display text-xl font-semibold leading-none text-amber">{fmtHours(summary.overtimeHours)}</p>
                <p className="mt-1.5 text-[11px] text-crema/60">Tăng ca</p>
              </div>
              <div className="rounded-xl bg-white/5 px-2 py-3">
                <p className="font-display text-lg font-semibold leading-none text-crema">{moneyFormat.format(summary.estimatedPay)}</p>
                <p className="mt-1.5 text-[11px] text-crema/60">Lương ước tính</p>
              </div>
            </div>
            <p className="mt-3.5 border-t border-white/10 pt-3 text-[11px] text-crema/55">
              Đã duyệt <span className="font-semibold text-crema/85">{fmtHours(summary.approvedHours)}</span> · Chờ duyệt{' '}
              <span className="font-semibold text-amber">{fmtHours(summary.pendingHours)}</span>
            </p>
          </section>

          {/* ===== Bộ lọc trạng thái ===== */}
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => handleFilterChange(f.value)}
                className={`h-8 shrink-0 rounded-full px-3.5 text-xs font-semibold transition-colors ${
                  filter === f.value
                    ? 'bg-amber text-white shadow-[0_4px_12px_rgba(217,107,39,0.3)]'
                    : 'border border-line bg-white text-muted hover:bg-crema hover:text-ink'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* ===== Chi tiết giờ công ===== */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Chi tiết giờ công</h2>
              <span className="rounded-full bg-oat px-2.5 py-1 text-[11px] font-semibold text-ink">{filtered.length}</span>
            </div>

            {paginatedTimesheets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-paper py-10 text-center">
                <p className="text-sm text-muted">Không có bản ghi giờ công nào cho bộ lọc này.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {paginatedTimesheets.map((t) => {
                  const meta = TIMESHEET_STATUS[t.status] || TIMESHEET_STATUS.DRAFT;
                  return (
                    <div key={t.id} className="rounded-xl border border-line bg-paper p-4 shadow-[0_4px_16px_rgba(24,20,17,0.05)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold text-ink">{t.workDate}</p>
                          <p className="mt-0.5 text-xs text-muted">{t.shiftName}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-lg bg-crema px-2.5 py-1 font-mono text-ink">
                          {t.actualStart || '--:--'} → {t.actualEnd || '--:--'}
                        </span>
                        <span className="text-muted">Nghỉ {t.breakMinutes}p</span>
                      </div>

                      <div className="mt-2 flex items-end justify-between gap-2">
                        <p className="text-xs text-muted">
                          Thường <span className="font-semibold text-ink">{fmtHours(t.regularHours)}</span> · Tăng ca{' '}
                          <span className="font-semibold text-amber">{fmtHours(t.overtimeHours)}</span>
                        </p>
                        <p className="shrink-0 font-display text-sm font-semibold text-ink">
                          {moneyFormat.format(t.estimatedAmount)}
                        </p>
                      </div>

                      {t.adjustmentReason && (t.status === 'REJECTED' || t.status === 'ADJUSTED') && (
                        <p
                          className={`mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                            t.status === 'REJECTED' ? 'bg-danger/10 text-danger' : 'bg-oat/70 text-ink'
                          }`}
                        >
                          {t.status === 'REJECTED' ? 'Lý do từ chối: ' : 'Ghi chú điều chỉnh: '}
                          {t.adjustmentReason}
                        </p>
                      )}
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
