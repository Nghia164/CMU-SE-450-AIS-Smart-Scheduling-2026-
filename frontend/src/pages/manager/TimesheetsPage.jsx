// ============================================================
// PAGE: Bảng công (Manager)
// 4 thẻ thống kê + bảng duyệt có phân trang 10/trang
// Slide-in modal: chi tiết bảng công + form từ chối (lý do bắt buộc)
// ============================================================
import { useEffect, useState } from 'react';
import {
  listTimesheets,
  approveTimesheet,
  rejectTimesheet,
  bulkApprove,
  getSummary,
} from '../../services/manager/timesheetService.js';
import { STATUS_LABELS } from '../../mock/manager/TimesheetsPage.mock.js';

const ITEMS_PER_PAGE = 10;
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const STATUS_BADGE = {
  DRAFT: 'bg-muted/10 text-muted',
  PENDING_APPROVAL: 'bg-amber/10 text-amber',
  APPROVED: 'bg-matcha/10 text-matcha',
  REJECTED: 'bg-danger/10 text-danger',
  ADJUSTED: 'bg-oat text-ink',
};

// Slide-in panel dùng chung, trượt từ mép phải
function SlideInPanel({ open, mounted, onClose, title, subtitle, children, footer }) {
  if (!open) return null;
  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
          mounted ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between border-b border-line px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
            aria-label="Đóng"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="border-t border-line px-6 py-4">{footer}</div>}
      </aside>
    </div>
  );
}

export default function TimesheetsPage() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkApproving, setBulkApproving] = useState(false);

  // Modal chi tiết
  const [detail, setDetail] = useState(null);
  const [detailMounted, setDetailMounted] = useState(false);

  // Modal từ chối
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejectMounted, setRejectMounted] = useState(false);
  const [rejectSaving, setRejectSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Escape đóng modal
  useEffect(() => {
    if (!detailMounted && !rejectMounted) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (rejectMounted) closeReject();
        else closeDetail();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [detailMounted, rejectMounted]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [list, sum] = await Promise.all([
        listTimesheets({ status: statusFilter, search }),
        getSummary(),
      ]);
      setRows(list);
      setSummary(sum);
    } catch (err) {
      setError('Không tải được bảng công. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ---------- Chi tiết ----------
  function openDetail(row) {
    setDetail(row);
    requestAnimationFrame(() => setDetailMounted(true));
  }
  function closeDetail() {
    setDetailMounted(false);
    setTimeout(() => setDetail(null), 300);
  }

  // ---------- Từ chối ----------
  function openReject(row) {
    setRejecting(row);
    setRejectReason('');
    setRejectError('');
    requestAnimationFrame(() => setRejectMounted(true));
  }
  function closeReject() {
    setRejectMounted(false);
    setTimeout(() => setRejecting(null), 300);
  }

  async function handleApprove(row) {
    try {
      const updated = await approveTimesheet(row.id);
      setRows((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      getSummary().then(setSummary).catch(() => {});
      setNotice(`Đã duyệt bảng công của ${updated.employeeName} (${updated.workDate}).`);
    } catch (err) {
      setNotice(`Lỗi: ${err.message}`);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setRejectSaving(true);
    setRejectError('');
    try {
      const updated = await rejectTimesheet(rejecting.id, rejectReason);
      setRows((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      getSummary().then(setSummary).catch(() => {});
      setNotice(`Đã từ chối bảng công của ${updated.employeeName}.`);
      closeReject();
    } catch (err) {
      setRejectError(err.message);
    } finally {
      setRejectSaving(false);
    }
  }

  async function handleBulkApprove() {
    const pending = summary?.pendingCount ?? 0;
    if (pending === 0) {
      setNotice('Không có bảng công nào đang chờ duyệt.');
      return;
    }
    if (!window.confirm(`Duyệt ${pending} bảng công đang chờ?`)) return;
    setBulkApproving(true);
    try {
      const count = await bulkApprove();
      await loadData();
      setNotice(`Đã duyệt hàng loạt ${count} bảng công.`);
    } catch (err) {
      setNotice(`Lỗi: ${err.message}`);
    } finally {
      setBulkApproving(false);
    }
  }

  // ---------- Lọc + phân trang ----------
  const filtered = rows; // service đã lọc sẵn
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const statCards = summary
    ? [
        { label: 'Tổng giờ thường', value: `${summary.totalRegularHours}h`, tone: 'text-ink' },
        { label: 'Tổng giờ tăng ca', value: `${summary.totalOvertimeHours}h`, tone: 'text-amber' },
        { label: 'Tổng chi phí', value: vnd.format(summary.totalAmount), tone: 'text-matcha' },
        { label: 'Chờ duyệt', value: summary.pendingCount, tone: 'text-danger' },
      ]
    : [];

  return (
    <div className="space-y-5 p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-6 shadow-[0_8px_24px_rgba(24,20,17,0.05)]">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Bảng công</h1>
          <p className="mt-1 text-sm text-muted">
            Tổng hợp giờ thường &amp; tăng ca từ dữ liệu chấm công — duyệt trước khi tính lương
          </p>
        </div>
        <button
          type="button"
          onClick={handleBulkApprove}
          disabled={bulkApproving || !summary?.pendingCount}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-matcha px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-matcha/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bulkApproving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Đang duyệt...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Duyệt tất cả đang chờ
            </>
          )}
        </button>
      </header>

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-xs font-medium text-muted">{c.label}</p>
            <p className={`mt-2 font-display text-2xl font-semibold ${c.tone}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {notice && (
        <div className="rounded-xl border border-matcha/30 bg-matcha/10 px-4 py-3 text-sm font-medium text-matcha">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper p-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
            setTimeout(loadData, 0);
          }}
          className="h-10 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
          aria-label="Lọc trạng thái"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="PENDING_APPROVAL">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
          <option value="ADJUSTED">Đã điều chỉnh</option>
          <option value="DRAFT">Nháp</option>
        </select>
        <div className="relative min-w-[220px] flex-1">
          <svg className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            placeholder="Tìm nhân viên theo tên hoặc mã..."
            className="h-10 w-full rounded-xl border-[1.5px] border-line bg-white pr-4 pl-10 text-sm text-ink focus:border-amber focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={loadData}
          className="h-10 cursor-pointer rounded-xl bg-amber px-5 text-sm font-semibold text-white transition-colors hover:bg-amber/90"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Bảng */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải bảng công...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-12 text-center">
          <svg className="mx-auto mb-3 h-12 w-12 text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
          <h3 className="font-display text-lg font-semibold text-ink">Không có bảng công nào</h3>
          <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-paper/95 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Ca</th>
                  <th className="px-4 py-3">Giờ thực tế</th>
                  <th className="px-4 py-3">Thường / Tăng ca</th>
                  <th className="px-4 py-3">Số tiền</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((t) => (
                  <tr key={t.id} className="transition-colors hover:bg-amber/5">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{t.employeeName}</p>
                      <p className="font-mono text-[11px] text-muted">{t.employeeCode}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{t.workDate}</td>
                    <td className="px-4 py-3 text-ink">{t.shiftName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">
                      {t.actualStart ?? '—'} – {t.actualEnd ?? '—'}
                      <span className="ml-1 text-[10px]">({t.breakMinutes}′ nghỉ)</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm text-ink">{t.regularHours}h</span>
                      {t.overtimeHours > 0 && (
                        <span className="ml-1.5 font-mono text-xs text-amber">+{t.overtimeHours}h</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm font-semibold text-ink">
                      {vnd.format(t.estimatedAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[t.status]}`}>
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {t.status === 'PENDING_APPROVAL' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApprove(t)}
                              title="Duyệt"
                              className="cursor-pointer rounded-lg border border-matcha/40 bg-matcha/10 px-3 py-1.5 text-xs font-semibold text-matcha transition-colors hover:bg-matcha hover:text-white"
                            >
                              ✓ Duyệt
                            </button>
                            <button
                              type="button"
                              onClick={() => openReject(t)}
                              title="Từ chối"
                              className="cursor-pointer rounded-lg border border-danger/40 bg-danger/10 px-3 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
                            >
                              ✗ Từ chối
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openDetail(t)}
                            className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-amber hover:text-white"
                          >
                            Chi tiết
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {filtered.length > ITEMS_PER_PAGE && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
              <p className="text-xs text-muted">
                Hiển thị {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} trong {filtered.length} bản ghi
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
                >
                  « Trang trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 cursor-pointer rounded-lg text-xs font-semibold transition-colors ${
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
                  className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trang sau »
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slide-in modal: CHI TIẾT BẢNG CÔNG */}
      <SlideInPanel
        open={!!detail}
        mounted={detailMounted}
        onClose={closeDetail}
        title="Chi tiết bảng công"
        subtitle={detail ? `${detail.employeeName} · ${detail.workDate}` : ''}
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeDetail}
              className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60"
            >
              Đóng
            </button>
          </div>
        }
      >
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Nhân viên', `${detail.employeeName} (${detail.employeeCode})`],
                ['Ngày công', detail.workDate],
                ['Ca làm', detail.shiftName],
                ['Giờ thực tế', `${detail.actualStart ?? '—'} – ${detail.actualEnd ?? '—'}`],
                ['Thời gian nghỉ', `${detail.breakMinutes} phút`],
                ['Giờ thường', `${detail.regularHours} giờ`],
                ['Giờ tăng ca', `${detail.overtimeHours} giờ`],
                ['Lương/giờ (chốt)', vnd.format(detail.hourlyRate)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-oat/50 p-3">
                  <p className="text-[11px] text-muted">{label}</p>
                  <p className="mt-0.5 font-semibold text-ink">{value}</p>
                </div>
              ))}
            </div>

            {/* Công thức tính tiền */}
            <div className="rounded-xl border border-line bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Cách tính</p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-ink">
                {detail.regularHours}h × {vnd.format(detail.hourlyRate)}
                {detail.overtimeHours > 0 && ` + ${detail.overtimeHours}h × ${vnd.format(detail.hourlyRate)} × 1.5`}
                {' = '}
                <strong className="text-amber">{vnd.format(detail.estimatedAmount)}</strong>
              </p>
            </div>

            {detail.adjustmentReason && (
              <div className="rounded-xl bg-danger/10 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-danger">Lý do điều chỉnh / từ chối</p>
                <p className="mt-1 text-sm text-ink">{detail.adjustmentReason}</p>
              </div>
            )}

            {detail.approvedBy && (
              <p className="text-xs text-muted">
                Duyệt bởi <strong className="text-ink">{detail.approvedBy}</strong> lúc {detail.approvedAt}
              </p>
            )}
          </div>
        )}
      </SlideInPanel>

      {/* Slide-in modal: TỪ CHỐI */}
      <SlideInPanel
        open={!!rejecting}
        mounted={rejectMounted}
        onClose={closeReject}
        title="Từ chối bảng công"
        subtitle={rejecting ? `${rejecting.employeeName} · ${rejecting.workDate} · ${rejecting.shiftName}` : ''}
      >
        {rejecting && (
          <form onSubmit={handleRejectSubmit} className="flex h-full flex-col">
            <div className="mb-4 rounded-xl bg-oat/50 p-4 text-sm">
              <p className="font-semibold text-ink">
                {rejecting.employeeName}{' '}
                <span className="font-mono text-xs text-muted">({rejecting.employeeCode})</span>
              </p>
              <p className="mt-1 text-muted">
                {rejecting.workDate} · {rejecting.shiftName} · {rejecting.regularHours}h thường +{' '}
                {rejecting.overtimeHours}h tăng ca · {vnd.format(rejecting.estimatedAmount)}
              </p>
            </div>
            <label htmlFor="reject-reason" className="text-sm font-semibold text-ink">
              Lý do từ chối <span className="text-danger">*</span>
            </label>
            <textarea
              id="reject-reason"
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Thiếu dữ liệu check-out GPS, chờ nhân viên xác nhận..."
              className="mt-1.5 rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-amber focus:outline-none"
            />
            {rejectError && (
              <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-3 py-2.5 text-sm font-medium text-danger">
                {rejectError}
              </p>
            )}
            <div className="mt-auto flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={closeReject}
                className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={rejectSaving}
                className="cursor-pointer rounded-xl bg-danger px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejectSaving ? 'Đang lưu...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </form>
        )}
      </SlideInPanel>
    </div>
  );
}
