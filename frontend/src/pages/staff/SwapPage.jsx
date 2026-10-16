// ============================================================
// SwapPage.jsx — Trang "Đổi ca" cho STAFF (Task 2.5)
// Mobile prototype: container max-w-[480px] căn giữa.
// Slide-in modal tạo yêu cầu đổi ca + phân trang 10 items/trang.
// ============================================================

import { useEffect, useState } from 'react';
import {
  getSwapData,
  createSwapRequest,
  cancelSwapRequest,
  respondIncoming,
} from '../../services/staff/swapService.js';

const ITEMS_PER_PAGE = 10;

const SWAP_STATUS = {
  PENDING: { label: 'Chờ phản hồi', cls: 'bg-amber/10 text-amber' },
  ACCEPTED_BY_STAFF: { label: 'Đồng nghiệp đã đồng ý', cls: 'bg-matcha/10 text-matcha' },
  APPROVED: { label: 'Quản lý đã duyệt', cls: 'bg-matcha/10 text-matcha' },
  REJECTED: { label: 'Đã từ chối', cls: 'bg-danger/10 text-danger' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-muted/10 text-muted' },
};

const TARGET_SLOTS = ['Ca sáng', 'Ca chiều', 'Ca tối'];

// ---------- Icon ----------
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const CloseIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const SwapArrowsIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
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
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Panel trượt từ phải */}
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

const initialForm = { myShiftId: '', targetId: '', targetShiftLabel: '', reason: '' };

export default function SwapPage() {
  const [myShifts, setMyShifts] = useState([]);
  const [colleagues, setColleagues] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text }
  const [currentPage, setCurrentPage] = useState(1);
  const [respondingId, setRespondingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // Modal tạo yêu cầu
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
      const res = await getSwapData();
      setMyShifts(res.myShifts);
      setColleagues(res.colleagues);
      setSwapRequests(res.swapRequests);
      setIncomingRequests(res.incomingRequests);
    } catch (err) {
      setLoadError(err.message || 'Không thể tải dữ liệu đổi ca.');
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(swapRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedRequests = swapRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Ca của tôi được chọn trong form → sinh danh sách ca muốn đổi lấy (label tự sinh)
  const selectedShift = myShifts.find((s) => String(s.id) === String(form.myShiftId));
  const targetShiftOptions = selectedShift
    ? TARGET_SLOTS.map((name) => `${name} · ${selectedShift.date}`)
    : [];

  function openCreateModal() {
    setForm(initialForm);
    setFormError(null);
    setModalOpen(true);
  }

  function handleMyShiftChange(e) {
    const shiftId = e.target.value;
    const shift = myShifts.find((s) => String(s.id) === shiftId);
    setForm((prev) => ({
      ...prev,
      myShiftId: shiftId,
      targetShiftLabel: shift ? `${TARGET_SLOTS[0]} · ${shift.date}` : '',
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.myShiftId) {
      setFormError('Vui lòng chọn ca của bạn.');
      return;
    }
    if (!form.targetId) {
      setFormError('Vui lòng chọn đồng nghiệp.');
      return;
    }
    if (!form.reason.trim()) {
      setFormError('Vui lòng nhập lý do');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createSwapRequest({
        myShiftId: Number(form.myShiftId),
        targetId: Number(form.targetId),
        targetShiftLabel: form.targetShiftLabel,
        reason: form.reason,
      });
      setSwapRequests((prev) => [created, ...prev]);
      setModalOpen(false);
      setForm(initialForm);
      setCurrentPage(1);
      setToast({ type: 'success', text: `Đã gửi yêu cầu đổi ca tới ${created.targetName}. Đang chờ phản hồi.` });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(request) {
    if (!window.confirm(`Bạn có chắc muốn hủy yêu cầu đổi ca với ${request.targetName} (${request.myShiftLabel})?`)) return;
    setCancellingId(request.id);
    try {
      const updated = await cancelSwapRequest(request.id);
      setSwapRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setToast({ type: 'success', text: 'Đã hủy yêu cầu đổi ca.' });
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setCancellingId(null);
    }
  }

  async function handleRespond(incoming, accept) {
    if (!accept && !window.confirm(`Từ chối lời đề nghị đổi ca của ${incoming.fromName}?`)) return;
    setRespondingId(incoming.id);
    try {
      const updated = await respondIncoming(incoming.id, accept);
      setIncomingRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setToast({
        type: 'success',
        text: accept
          ? `Đã đồng ý đổi ca với ${incoming.fromName}. Quản lý sẽ phê duyệt sớm.`
          : `Đã từ chối đề nghị đổi ca của ${incoming.fromName}.`,
      });
    } catch (err) {
      setToast({ type: 'error', text: err.message });
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Header */}
      <header className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-amber">Nhân viên · Đổi ca</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink">Đổi ca làm việc</h1>
        <p className="mt-1 text-[13px] text-muted">Trao đổi ca với đồng nghiệp và theo dõi phê duyệt của quản lý.</p>
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
          <p className="mt-4 text-sm text-muted">Đang tải dữ liệu đổi ca...</p>
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
          {/* ===== Yêu cầu đến từ đồng nghiệp ===== */}
          <section className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Yêu cầu đến từ đồng nghiệp</h2>
              <span className="rounded-full bg-oat px-2.5 py-1 text-[11px] font-semibold text-ink">
                {incomingRequests.filter((r) => r.status === 'PENDING').length} mới
              </span>
            </div>

            {incomingRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-paper py-10 text-center">
                <p className="text-sm text-muted">Chưa có ai gửi lời đề nghị đổi ca tới bạn.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {incomingRequests.map((req) => {
                  const initial = req.fromName.trim().split(' ').pop()?.charAt(0) || '?';
                  return (
                    <div key={req.id} className="rounded-2xl border border-line bg-paper p-4 shadow-[0_4px_16px_rgba(24,20,17,0.05)]">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber/10 font-display text-sm font-semibold text-amber">
                          {initial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{req.fromName}</p>
                          <p className="text-[11px] text-muted">Muốn đổi ca với bạn</p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-1.5 rounded-xl bg-crema/70 px-3 py-2.5 text-xs">
                        <p className="flex items-center gap-1.5">
                          <span className="shrink-0 text-muted">Ca của họ:</span>
                          <span className="font-semibold text-ink">{req.fromShiftLabel}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <SwapArrowsIcon />
                          <span className="shrink-0 text-muted">Muốn lấy ca:</span>
                          <span className="font-semibold text-ink">{req.wantShiftLabel}</span>
                        </p>
                      </div>

                      {req.message && <p className="mt-2.5 text-xs italic leading-relaxed text-muted">“{req.message}”</p>}

                      {req.status === 'PENDING' ? (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req, true)}
                            className="h-10 rounded-xl bg-matcha text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                          >
                            {respondingId === req.id ? 'Đang xử lý...' : 'Đồng ý'}
                          </button>
                          <button
                            type="button"
                            disabled={respondingId === req.id}
                            onClick={() => handleRespond(req, false)}
                            className="h-10 rounded-xl bg-danger/10 text-sm font-semibold text-danger transition-all hover:bg-danger/20 active:scale-[0.98] disabled:opacity-50"
                          >
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <p className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${SWAP_STATUS[req.status]?.cls || 'bg-oat text-ink'}`}>
                          {req.status === 'ACCEPTED_BY_STAFF'
                            ? 'Bạn đã đồng ý đổi ca — đang chờ quản lý duyệt.'
                            : 'Bạn đã từ chối đề nghị này.'}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ===== Yêu cầu đã gửi ===== */}
          <section>
            <button
              type="button"
              onClick={openCreateModal}
              className="mb-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white"
            >
              <PlusIcon /> Tạo yêu cầu đổi ca
            </button>

            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Yêu cầu đã gửi</h2>
              <span className="rounded-full bg-oat px-2.5 py-1 text-[11px] font-semibold text-ink">{swapRequests.length}</span>
            </div>

            {paginatedRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-paper py-10 text-center">
                <p className="text-sm text-muted">Bạn chưa gửi yêu cầu đổi ca nào.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {paginatedRequests.map((req) => {
                  const meta = SWAP_STATUS[req.status] || SWAP_STATUS.PENDING;
                  return (
                    <div key={req.id} className="rounded-2xl border border-line bg-paper p-4 shadow-[0_4px_16px_rgba(24,20,17,0.05)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">{req.myShiftLabel}</p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                            <SwapArrowsIcon /> {req.targetShiftLabel}
                          </p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
                          {meta.label}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-muted">
                        Gửi tới: <span className="font-medium text-ink">{req.targetName}</span> · {req.createdAt}
                      </p>
                      {req.reason && <p className="mt-1 text-xs italic leading-relaxed text-muted">Lý do: {req.reason}</p>}
                      {req.reviewedNote && req.status !== 'PENDING' && req.status !== 'CANCELLED' && (
                        <p className="mt-2 rounded-lg bg-oat/60 px-3 py-2 text-xs leading-relaxed text-ink">
                          Ghi chú quản lý: {req.reviewedNote}
                        </p>
                      )}

                      {req.status === 'PENDING' && (
                        <button
                          type="button"
                          disabled={cancellingId === req.id}
                          onClick={() => handleCancel(req)}
                          className="mt-3 h-9 w-full rounded-xl border border-danger/30 bg-danger/5 text-xs font-semibold text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                        >
                          {cancellingId === req.id ? 'Đang hủy...' : 'Hủy yêu cầu'}
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

      {/* ===== Slide-in modal: Tạo yêu cầu đổi ca ===== */}
      <SlideInModal
        open={modalOpen}
        title="Tạo yêu cầu đổi ca"
        subtitle="Chọn ca của bạn và ca muốn đổi với đồng nghiệp."
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
              form="swapForm"
              disabled={submitting}
              className="h-11 flex-1 rounded-xl bg-amber text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
          </div>
        }
      >
        <form id="swapForm" onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="block text-[13px] font-medium text-ink">
            Ca của bạn <span className="text-danger">*</span>
            <select
              value={form.myShiftId}
              onChange={handleMyShiftChange}
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
            >
              <option value="">— Chọn ca của bạn —</option>
              {myShifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shiftName} · {s.date} ({s.dayLabel}) · {s.startTime}-{s.endTime}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-[13px] font-medium text-ink">
            Đồng nghiệp <span className="text-danger">*</span>
            <select
              value={form.targetId}
              onChange={(e) => setForm((prev) => ({ ...prev, targetId: e.target.value }))}
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
            >
              <option value="">— Chọn đồng nghiệp —</option>
              {colleagues.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.position}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-[13px] font-medium text-ink">
            Ca muốn đổi lấy
            <select
              value={form.targetShiftLabel}
              onChange={(e) => setForm((prev) => ({ ...prev, targetShiftLabel: e.target.value }))}
              disabled={!selectedShift}
              className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none disabled:cursor-not-allowed disabled:bg-oat/40 disabled:text-muted"
            >
              {targetShiftOptions.length === 0 && <option value="">— Chọn ca của bạn trước —</option>}
              {targetShiftOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-muted">
              Ca của đồng nghiệp cùng ngày với ca bạn muốn nhường.
            </span>
          </label>

          <label className="block text-[13px] font-medium text-ink">
            Lý do <span className="text-danger">*</span>
            <textarea
              rows={4}
              value={form.reason}
              onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Ví dụ: Mình có việc gia đình buổi sáng, mong đổi ca..."
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
