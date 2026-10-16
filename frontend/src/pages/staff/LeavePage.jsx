// ============================================================
// LeavePage.jsx — Trang "Xin nghỉ phép" cho STAFF (Task 2.6)
// Mobile prototype: container max-w-[480px] căn giữa.
// Thẻ số dư phép + slide-in modal tạo đơn + phân trang 10 items/trang.
// ============================================================

import { useEffect, useState } from 'react';
import {
  getLeaveData,
  createLeaveRequest,
  cancelLeaveRequest,
} from '../../services/staff/leaveService.js';

const ITEMS_PER_PAGE = 10;

const LEAVE_STATUS = {
  PENDING: { label: 'Chờ duyệt', cls: 'bg-amber/10 text-amber' },
  APPROVED: { label: 'Đã duyệt', cls: 'bg-matcha/10 text-matcha' },
  REJECTED: { label: 'Đã từ chối', cls: 'bg-danger/10 text-danger' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-muted/10 text-muted' },
};

const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Nghỉ phép năm' },
  { value: 'SICK', label: 'Nghỉ ốm' },
  { value: 'PERSONAL', label: 'Nghỉ việc riêng' },
  { value: 'UNPAID', label: 'Nghỉ không lương' },
  { value: 'EMERGENCY', label: 'Nghỉ khẩn cấp' },
  { value: 'OTHER', label: 'Lý do khác' },
];

// ---------- Icon ----------
const CloseIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const DocumentIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// ---------- Slide-in modal (trượt từ mép phải) ----------
function SlideInModal({ open, title, subtitle, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line bg-white px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-crema hover:text-danger"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 [scrollbar-width:thin]">{children}</div>
        <div className="border-t border-line bg-white px-5 py-4">{footer}</div>
      </div>
    </div>
  );
}

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

// 'yyyy-MM-dd' (input date) → 'dd/MM/yyyy' (mock display)
function isoToDmy(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Số ngày nghỉ tính từ 2 ngày (yyyy-MM-dd), null nếu chưa hợp lệ
function calcDays(startIso, endIso) {
  if (!startIso || !endIso) return null;
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.round((end - start) / 86400000) + 1;
}

const initialForm = { leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' };

export default function LeavePage() {
  const [balance, setBalance] = useState(null);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);

  // Modal tạo đơn
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      const res = await getLeaveData();
      setBalance(res.leaveBalance);
      setMyLeaveRequests(res.myLeaveRequests);
    } catch (err) {
      setLoadError(err.message || 'Không thể tải dữ liệu nghỉ phép.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(myLeaveRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = myLeaveRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Số ngày tự sinh từ 2 input date
  const dayCount = calcDays(form.startDate, form.endDate);
  const invalidRange = dayCount !== null && form.endDate < form.startDate;

  function openCreateModal() {
    setForm(initialForm);
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.leaveType) {
      setFormError('Vui lòng chọn loại nghỉ.');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setFormError('Vui lòng chọn ngày bắt đầu và ngày kết thúc.');
      return;
    }
    if (form.endDate < form.startDate) {
      setFormError('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }
    if (!form.reason.trim()) {
      setFormError('Vui lòng nhập lý do nghỉ phép.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createLeaveRequest({
        leaveType: form.leaveType,
        startDate: isoToDmy(form.startDate),
        endDate: isoToDmy(form.endDate),
        reason: form.reason,
      });
      setMyLeaveRequests((prev) => [created, ...prev]);
      setModalOpen(false);
      setForm(initialForm);
      setCurrentPage(1);
      setToast({ type: 'success', text: `Đã gửi đơn ${created.typeLabel.toLowerCase()} (${created.days} ngày). Đang chờ duyệt.` });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(request) {
    if (!window.confirm(`Bạn có chắc muốn hủy đơn ${request.typeLabel.toLowerCase()} (${request.startDate})?`)) return;
    setCancellingId(request.id);
    try {
      const updated = await cancelLeaveRequest(request.id);
      setMyLeaveRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setToast({ type: 'success', text: 'Đã hủy đơn xin nghỉ.' });
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setCancellingId(null);
    }
  }

  // Cấu hình 3 thẻ số dư: còn lại / tổng + progress fill
  function balanceCards() {
    if (!balance) return [];
    const annualRemaining = balance.annual.total - balance.annual.used;
    const personalRemaining = balance.personal.total - balance.personal.used;
    return [
      {
        key: 'annual',
        title: 'Phép năm',
        remaining: annualRemaining,
        total: balance.annual.total,
        used: balance.annual.used,
        suffix: `/${balance.annual.total} ngày`,
        fillPct: Math.round((balance.annual.used / balance.annual.total) * 100),
        fillCls: 'bg-amber',
      },
      {
        key: 'sick',
        title: 'Nghỉ ốm',
        remaining: null, // không giới hạn
        total: 0,
        used: balance.sick.used,
        suffix: 'ngày',
        fillPct: 100,
        fillCls: 'bg-matcha',
      },
      {
        key: 'personal',
        title: 'Việc riêng',
        remaining: personalRemaining,
        total: balance.personal.total,
        used: balance.personal.used,
        suffix: `/${balance.personal.total} ngày`,
        fillPct: Math.round((balance.personal.used / balance.personal.total) * 100),
        fillCls: 'bg-amber',
      },
    ];
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">Nhân viên · Nghỉ phép</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">Xin nghỉ phép</h1>
        <p className="mt-1 text-[13px] text-muted">Gửi đơn xin nghỉ và theo dõi trạng thái duyệt.</p>
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
          <p className="mt-4 text-sm text-muted">Đang tải dữ liệu nghỉ phép...</p>
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

      {!loading && !loadError && (
        <>
          {/* ===== 3 thẻ số dư nghỉ phép ===== */}
          <section className="mb-6">
            <div className="grid grid-cols-3 gap-2.5">
              {balanceCards().map((card) => (
                <div key={card.key} className="rounded-2xl border border-line bg-paper p-3 shadow-[0_4px_16px_rgba(24,20,17,0.05)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{card.title}</p>
                  <p className="mt-1.5 font-display text-xl font-semibold leading-none text-ink">
                    {card.remaining === null ? '∞' : card.remaining}
                    <span className="text-[10px] font-medium text-muted">
                      {card.remaining === null ? ' tự do' : ` ${card.suffix}`}
                    </span>
                  </p>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-oat">
                    <div className={`h-full rounded-full ${card.fillCls}`} style={{ width: `${card.fillPct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[10px] leading-tight text-muted">
                    {card.remaining === null ? `Đã dùng ${card.used} · Không giới hạn` : `Đã dùng ${card.used} ngày`}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white"
            >
              <DocumentIcon /> Đơn xin nghỉ
            </button>
          </section>

          {/* ===== Lịch sử đơn ===== */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Lịch sử đơn</h2>
              <span className="rounded-full bg-oat px-2.5 py-1 text-[11px] font-semibold text-ink">{myLeaveRequests.length}</span>
            </div>

            {paginatedRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-paper py-10 text-center">
                <p className="text-sm text-muted">Bạn chưa gửi đơn xin nghỉ nào.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {paginatedRequests.map((req) => {
                  const meta = LEAVE_STATUS[req.status] || LEAVE_STATUS.PENDING;
                  return (
                    <div key={req.id} className="rounded-2xl border border-line bg-paper p-4 shadow-[0_4px_16px_rgba(24,20,17,0.05)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">{req.typeLabel}</p>
                          <p className="mt-0.5 text-xs text-muted">
                            {req.startDate === req.endDate
                              ? req.startDate
                              : `${req.startDate} → ${req.endDate}`}{' '}
                            · {req.days} ngày
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>

                      {req.reason && <p className="mt-2 text-xs italic leading-relaxed text-muted">Lý do: {req.reason}</p>}
                      {req.reviewedNote && (req.status === 'REJECTED' || req.status === 'APPROVED') && (
                        <p
                          className={`mt-2 rounded-lg px-3 py-2 text-xs leading-relaxed ${
                            req.status === 'REJECTED' ? 'bg-danger/10 text-danger' : 'bg-oat/60 text-ink'
                          }`}
                        >
                          Phản hồi quản lý: {req.reviewedNote}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-muted">Gửi lúc {req.createdAt}</p>

                      {req.status === 'PENDING' && (
                        <button
                          type="button"
                          disabled={cancellingId === req.id}
                          onClick={() => handleCancel(req)}
                          className="mt-3 h-9 w-full rounded-xl border border-danger/30 bg-danger/5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                        >
                          {cancellingId === req.id ? 'Đang hủy...' : 'Hủy đơn'}
                        </button>
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

      {/* ===== Slide-in modal: Đơn xin nghỉ ===== */}
      <SlideInModal
        open={modalOpen}
        title="Đơn xin nghỉ"
        subtitle="Điền thông tin và gửi cho quản lý duyệt."
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-11 flex-1 rounded-xl border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-crema"
            >
              Đóng
            </button>
            <button
              type="submit"
              form="leaveForm"
              disabled={submitting}
              className="h-11 flex-1 rounded-xl bg-amber text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đơn'}
            </button>
          </div>
        }
      >
        <form id="leaveForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block text-[13px] font-medium text-ink">
            Loại nghỉ <span className="text-danger">*</span>
            <select
              value={form.leaveType}
              onChange={(e) => setForm((prev) => ({ ...prev, leaveType: e.target.value }))}
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-[13px] font-medium text-ink">
              Từ ngày <span className="text-danger">*</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
              />
            </label>
            <label className="block text-[13px] font-medium text-ink">
              Đến ngày <span className="text-danger">*</span>
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
              />
            </label>
          </div>

          {/* Số ngày tự sinh */}
          {dayCount !== null && !invalidRange && (
            <div className="rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm font-semibold text-amber">
              Số ngày: {dayCount} ngày
            </div>
          )}
          {invalidRange && (
            <div className="rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">
              Ngày kết thúc phải sau ngày bắt đầu
            </div>
          )}

          <label className="block text-[13px] font-medium text-ink">
            Lý do <span className="text-danger">*</span>
            <textarea
              rows={4}
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Ví dụ: Gia đình có việc cần về quê 2 ngày..."
              className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/70 focus:border-amber focus:outline-none"
            />
          </label>

          {formError && (
            <p className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2.5 text-[13px] font-medium text-danger">
              {formError}
            </p>
          )}
        </form>
      </SlideInModal>
    </div>
  );
}
