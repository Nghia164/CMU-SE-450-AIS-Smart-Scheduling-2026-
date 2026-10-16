// ============================================================
// PAGE: Nhận ca mở (Staff, mobile 480px)
// Danh sách ca mở + nút "Nhận ca ngay" (first-come-first-served)
// Slide-in modal xác nhận + toast kết quả + phân trang 10/trang
// ============================================================
import { useEffect, useState } from 'react';
import { listOpenShifts, claimShift } from '../../services/staff/openShiftService.js';

const ITEMS_PER_PAGE = 10;

const ELIGIBILITY_HELP = {
  ELIGIBLE: null,
  SKILL_MISMATCH: 'Không đủ điều kiện',
  TIME_CONFLICT: 'Trùng lịch',
  ALREADY_CLAIMED: 'Đã nhận',
};

// Chấm cấp kỹ năng ●●●○○
function SkillDots({ level }) {
  return (
    <span className="font-mono text-[11px] tracking-[0.15em] text-amber" title={`Cấp ${level}/5`}>
      {'●'.repeat(level)}
      <span className="text-line">{'○'.repeat(5 - level)}</span>
    </span>
  );
}

export default function OpenShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [noticeTone, setNoticeTone] = useState('success');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal xác nhận nhận ca
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [modalMounted, setModalMounted] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    listOpenShifts()
      .then((res) => {
        setShifts(res.shifts);
        setMyClaims(res.myClaims);
      })
      .catch(() => setError('Không tải được danh sách ca mở. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!confirmTarget) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmTarget]);

  function showToast(message, tone = 'success') {
    setNoticeTone(tone);
    setNotice(message);
  }

  function openConfirm(shift) {
    setConfirmTarget(shift);
    requestAnimationFrame(() => setModalMounted(true));
  }
  function closeConfirm() {
    setModalMounted(false);
    setTimeout(() => setConfirmTarget(null), 300);
  }

  async function handleClaim() {
    setClaiming(true);
    try {
      const result = await claimShift(confirmTarget.id);
      if (result.success) {
        setShifts((prev) => prev.map((s) => (s.id === result.shift.id ? result.shift : s)));
        setMyClaims((prev) => [claimStoreHead(result.shift), ...prev]);
        showToast(result.message, 'success');
        closeConfirm();
      } else {
        // Thất bại (bị giành ca / không đủ điều kiện) — cập nhật lại danh sách rồi đóng
        setShifts((prev) =>
          prev.map((s) =>
            s.id === confirmTarget.id && result.message.includes('người khác')
              ? { ...s, status: 'CLAIMED', claimedBy: 'Người khác', eligibility: 'ALREADY_CLAIMED', eligibilityLabel: 'Đã có người nhận' }
              : s
          )
        );
        showToast(result.message, 'error');
        closeConfirm();
      }
    } finally {
      setClaiming(false);
    }
  }

  function claimStoreHead(shift) {
    return {
      id: shift.id,
      shiftName: shift.shiftName,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      position: shift.position,
      bonusNote: shift.bonusNote,
      status: 'CLAIMED',
      claimedAt: 'Vừa xong',
    };
  }

  // Phân trang danh sách ca mở
  const totalPages = Math.max(1, Math.ceil(shifts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = shifts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
        <div className="flex flex-col items-center gap-3 py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải ca mở...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Header */}
      <header className="mb-5">
        <h1 className="font-display text-2xl font-semibold text-ink">Nhận ca mở</h1>
        <p className="mt-0.5 text-sm text-muted">Ai nhanh tay người đó được ca — ca mở hiện chưa đủ người</p>
      </header>

      {/* Toast */}
      {notice && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
            noticeTone === 'success'
              ? 'border border-matcha/30 bg-matcha/10 text-matcha'
              : 'border border-danger/30 bg-danger/10 text-danger'
          }`}
          role="status"
        >
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* Danh sách ca mở */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-10 text-center">
          <svg className="mx-auto mb-3 h-12 w-12 text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8m4-4H8" />
          </svg>
          <h3 className="font-display text-lg font-semibold text-ink">Hiện không có ca mở nào</h3>
          <p className="mt-1 text-sm text-muted">Quản lý sẽ tạo ca mở khi cửa hàng thiếu người. Hãy quay lại sau.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((s) => {
              const blocked = s.eligibility !== 'ELIGIBLE';
              const claimedByMe = s.claimedBy === 'Nhân viên mẫu';
              return (
                <article
                  key={s.id}
                  className={`rounded-2xl border bg-paper p-4 transition-all ${
                    blocked ? 'border-line opacity-80' : 'border-line hover:border-amber/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {s.shiftName} · <span className="font-mono text-xs text-muted">{s.date}</span>
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold text-amber">
                        {s.startTime} – {s.endTime}
                      </p>
                    </div>
                    {s.bonusNote && (
                      <span className="shrink-0 rounded-full bg-amber/10 px-2.5 py-1 text-[10px] font-semibold text-amber">
                        {s.bonusNote}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {s.position} · {s.skillRequired} · cần <SkillDots level={s.minSkillLevel} />
                  </p>

                  <button
                    type="button"
                    onClick={() => !blocked && openConfirm(s)}
                    disabled={blocked || claiming}
                    className={`mt-3 w-full rounded-xl py-3 text-sm font-semibold transition-all duration-150 active:scale-[0.98] ${
                      blocked
                        ? 'cursor-not-allowed bg-oat text-muted'
                        : claimedByMe
                          ? 'cursor-default bg-matcha text-white'
                          : 'cursor-pointer bg-amber text-white hover:bg-amber/90'
                    }`}
                  >
                    {blocked
                      ? (claimedByMe ? 'Bạn đã nhận ca này' : ELIGIBILITY_HELP[s.eligibility] ?? 'Không thể nhận')
                      : 'Nhận ca ngay'}
                  </button>
                  {blocked && s.eligibilityLabel && (
                    <p className="mt-1.5 text-center text-[10.5px] text-muted">{s.eligibilityLabel}</p>
                  )}
                </article>
              );
            })}
          </div>

          {/* Phân trang */}
          {shifts.length > ITEMS_PER_PAGE && (
            <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-paper px-4 py-3">
              <p className="text-[11px] text-muted">
                Trang {safePage}/{totalPages} · {shifts.length} ca
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
        </>
      )}

      {/* Ca tôi đã nhận */}
      <section className="mt-6 rounded-2xl border border-line bg-paper">
        <div className="border-b border-line px-4 py-3.5">
          <h2 className="text-sm font-semibold text-ink">Ca tôi đã nhận</h2>
          <p className="text-[11px] text-muted">Các ca mở bạn đã giành thành công</p>
        </div>
        {myClaims.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted">Bạn chưa nhận ca mở nào.</p>
        ) : (
          <ul className="divide-y divide-line">
            {myClaims.map((c) => (
              <li key={`${c.id}-${c.claimedAt}`} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {c.shiftName} · <span className="font-mono text-xs text-muted">{c.date}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-amber">
                    {c.startTime} – {c.endTime} · {c.position}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-matcha/10 px-2.5 py-1 text-[10px] font-semibold text-matcha">
                    Đã nhận
                  </span>
                  <p className="mt-1 font-mono text-[10px] text-muted/60">{c.claimedAt}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ============ Slide-in modal: XÁC NHẬN NHẬN CA ============ */}
      {confirmTarget && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${modalMounted ? 'opacity-100' : 'opacity-0'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận nhận ca"
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={closeConfirm} />
          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
              modalMounted ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">Xác nhận nhận ca</h2>
              <button
                type="button"
                onClick={closeConfirm}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="rounded-2xl bg-roast p-5 text-crema">
                <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#f09a5e]">Ca muốn nhận</p>
                <p className="mt-2 font-display text-2xl font-semibold">{confirmTarget.shiftName}</p>
                <p className="mt-1 font-mono text-lg text-[#f3a268]">
                  {confirmTarget.startTime} – {confirmTarget.endTime}
                </p>
                <p className="mt-2 text-sm text-crema/70">
                  {confirmTarget.date} · {confirmTarget.position} · {confirmTarget.skillRequired} (cấp{' '}
                  {confirmTarget.minSkillLevel})
                </p>
                {confirmTarget.bonusNote && (
                  <p className="mt-1 text-xs text-[#ffb07c]">{confirmTarget.bonusNote}</p>
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Nhận ca là cam kết làm việc đúng giờ. Nếu cần hủy sau khi nhận, hãy tạo yêu cầu{' '}
                <strong className="text-ink">đổi ca</strong> hoặc <strong className="text-ink">xin nghỉ</strong> để
                quản lý duyệt.
              </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={closeConfirm}
                className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60"
              >
                Suy nghĩ thêm
              </button>
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {claiming && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {claiming ? 'Đang nhận...' : 'Xác nhận nhận ca'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
