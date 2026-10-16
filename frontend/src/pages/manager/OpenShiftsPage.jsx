// ============================================================
// PAGE: Quản lý ca mở (Manager)
// Bảng ca mở + phân trang 10/trang + 2 slide-in modal:
// (1) form tạo ca mở, (2) chi tiết ca + danh sách ứng viên để gửi mời
// ============================================================
import { useEffect, useState } from 'react';
import {
  listOpenShifts,
  createOpenShift,
  closeOpenShift,
  sendInvite,
} from '../../services/manager/openShiftService.js';
import { STATUS_LABELS } from '../../mock/manager/OpenShiftsPage.mock.js';

const ITEMS_PER_PAGE = 10;

const STATUS_BADGE = {
  OPEN: 'bg-amber/10 text-amber',
  CLAIMED: 'bg-matcha/10 text-matcha',
  CLOSED: 'bg-muted/10 text-muted',
};

const SHIFT_OPTIONS = [
  { value: 'Ca sáng', timeRange: '07:00–12:00' },
  { value: 'Ca chiều', timeRange: '12:00–17:00' },
  { value: 'Ca tối', timeRange: '17:00–22:00' },
];
const POSITION_OPTIONS = ['Barista', 'Phục vụ', 'Thu ngân', 'Bếp phụ'];
const SKILL_BY_POSITION = {
  Barista: 'Chế biến cà phê',
  'Phục vụ': 'Chăm sóc khách hàng',
  'Thu ngân': 'Thu ngân',
  'Bếp phụ': 'Chế biến đồ ăn',
};

const emptyForm = {
  workDate: '',
  shiftName: 'Ca sáng',
  position: 'Barista',
  requiredHeadcount: 1,
  minSkillLevel: 2,
  bonusNote: '',
  note: '',
};

// Hiển thị cấp kỹ năng dạng chấm ●●●○○
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal tạo ca mở
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [createMounted, setCreateMounted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // Modal chi tiết + ứng viên
  const [detail, setDetail] = useState(null);
  const [detailMounted, setDetailMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Escape đóng cả 2 modal
  useEffect(() => {
    if (!createMounted && !detailMounted) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (detailMounted) closeDetail();
        else closeCreate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [createMounted, detailMounted]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const res = await listOpenShifts();
      setShifts(res.shifts);
      setStats(res.stats);
    } catch (err) {
      setError('Không tải được danh sách ca mở. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ---------- Modal tạo ca mở ----------
  function openCreate() {
    setForm(emptyForm);
    setFormError('');
    setCreateOpen(true);
    requestAnimationFrame(() => setCreateMounted(true));
  }
  function closeCreate() {
    setCreateMounted(false);
    setTimeout(() => setCreateOpen(false), 300);
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!form.workDate) {
      setFormError('Vui lòng chọn ngày làm việc.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const created = await createOpenShift({
        ...form,
        timeRange: SHIFT_OPTIONS.find((s) => s.value === form.shiftName)?.timeRange,
        skillRequired: SKILL_BY_POSITION[form.position],
      });
      setShifts((prev) => [created, ...prev]);
      setStats((s) => (s ? { ...s, open: s.open + 1 } : s));
      setNotice(`Đã tạo ca mở ${created.shiftName} · ${created.workDate}.`);
      setCurrentPage(1);
      closeCreate();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ---------- Modal chi tiết ----------
  function openDetail(shift) {
    setDetail(shift);
    setSelectedIds(
      (shift.candidates ?? []).filter((c) => c.available && c.skillOk).map((c) => c.id)
    );
    requestAnimationFrame(() => setDetailMounted(true));
  }
  function closeDetail() {
    setDetailMounted(false);
    setTimeout(() => setDetail(null), 300);
  }

  function toggleCandidate(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleInvite() {
    setSending(true);
    try {
      const updated = await sendInvite(detail.id, selectedIds);
      setShifts((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setDetail(updated);
      setNotice(`Đã gửi mời tới ${selectedIds.length} ứng viên cho ca ${updated.shiftName} ${updated.workDate}.`);
    } catch (err) {
      setNotice(`Lỗi: ${err.message}`);
    } finally {
      setSending(false);
    }
  }

  async function handleCloseShift(shift) {
    if (!window.confirm(`Đóng ca ${shift.shiftName} · ${shift.workDate}? Không nhận thêm người sau khi đóng.`)) return;
    try {
      const closed = await closeOpenShift(shift.id);
      setShifts((prev) => prev.map((s) => (s.id === closed.id ? closed : s)));
      setStats((s) => (s ? { ...s, open: Math.max(0, s.open - 1) } : s));
      setNotice(`Đã đóng ca ${closed.shiftName} · ${closed.workDate}.`);
    } catch (err) {
      setNotice(`Lỗi: ${err.message}`);
    }
  }

  // ---------- Lọc + phân trang ----------
  const filtered = shifts.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const haystack = `${s.shiftName} ${s.workDate} ${s.position} ${s.skillRequired} ${s.claimedBy ?? ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const statCards = stats
    ? [
        { label: 'Ca đang mở', value: stats.open, tone: 'text-amber' },
        { label: 'Đã nhận hôm nay', value: stats.claimedToday, tone: 'text-matcha' },
        { label: 'Sắp hết hạn', value: stats.closingSoon, tone: 'text-danger' },
      ]
    : [];

  return (
    <div className="space-y-5 p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-6 shadow-[0_8px_24px_rgba(24,20,17,0.05)]">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Quản lý ca mở</h1>
          <p className="mt-1 text-sm text-muted">
            Mời nhân viên đủ kỹ năng &amp; rảnh nhận ca thiếu người — ai nhanh tay người đó được ca
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber/90 hover:shadow-[0_8px_24px_rgba(217,107,39,0.3)]"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 4v16m8-8H4" />
          </svg>
          Tạo ca mở
        </button>
      </header>

      {/* Thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-xs font-medium text-muted">{c.label}</p>
            <p className={`mt-2 font-display text-3xl font-semibold ${c.tone}`}>{c.value}</p>
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
            placeholder="Tìm theo ca, ngày, vị trí..."
            className="h-10 w-full rounded-xl border-[1.5px] border-line bg-white pr-4 pl-10 text-sm text-ink focus:border-amber focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-10 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
          aria-label="Lọc trạng thái"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="OPEN">Đang mở</option>
          <option value="CLAIMED">Đã nhận</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </div>

      {/* Bảng */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải danh sách ca mở...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-12 text-center">
          <svg className="mx-auto mb-3 h-12 w-12 text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v8m4-4H8" />
          </svg>
          <h3 className="font-display text-lg font-semibold text-ink">Chưa có ca mở nào</h3>
          <p className="mt-1 text-sm text-muted">Tạo ca mở để mời nhân viên nhận các ca thiếu người.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-5 cursor-pointer rounded-xl bg-amber px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber/90"
          >
            Tạo ca mở
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-paper/95 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Ca</th>
                  <th className="px-4 py-3">Vị trí &amp; Kỹ năng</th>
                  <th className="px-4 py-3">Cần / Đã nhận</th>
                  <th className="px-4 py-3">Người nhận</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-amber/5">
                    <td className="px-4 py-3 font-mono text-xs text-muted">{s.workDate}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{s.shiftName}</p>
                      <p className="font-mono text-[11px] text-muted">{s.timeRange}</p>
                      {s.bonusNote && (
                        <span className="mt-1 inline-block rounded-full bg-amber/10 px-2 py-0.5 text-[10px] text-amber">
                          {s.bonusNote}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{s.position}</p>
                      <p className="text-[11px] text-muted">
                        {s.skillRequired} · tối thiểu <SkillDots level={s.minSkillLevel} />
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm font-semibold ${s.filledCount < s.requiredHeadcount ? 'text-danger' : 'text-matcha'}`}>
                        {s.filledCount}/{s.requiredHeadcount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink">{s.claimedBy ?? <span className="text-muted/50">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[s.status]}`}>
                        {STATUS_LABELS[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openDetail(s)}
                          className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-amber hover:text-white"
                        >
                          Chi tiết
                        </button>
                        {s.status === 'OPEN' && (
                          <button
                            type="button"
                            onClick={() => handleCloseShift(s)}
                            className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                          >
                            Đóng ca
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
                Hiển thị {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} trong {filtered.length} ca mở
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

      {/* ============ Slide-in modal: TẠO CA MỞ ============ */}
      {createOpen && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${createMounted ? 'opacity-100' : 'opacity-0'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Tạo ca mở"
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={closeCreate} />
          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
              createMounted ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-xl font-semibold text-ink">Tạo ca mở mới</h2>
              <button
                type="button"
                onClick={closeCreate}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="os-date" className="text-sm font-semibold text-ink">Ngày làm việc</label>
                  <input
                    id="os-date"
                    type="date"
                    value={form.workDate}
                    onChange={(e) => setForm((f) => ({ ...f, workDate: e.target.value }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="os-shift" className="text-sm font-semibold text-ink">Ca làm</label>
                  <select
                    id="os-shift"
                    value={form.shiftName}
                    onChange={(e) => setForm((f) => ({ ...f, shiftName: e.target.value }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  >
                    {SHIFT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.value} ({s.timeRange})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="os-position" className="text-sm font-semibold text-ink">Vị trí</label>
                  <select
                    id="os-position"
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  >
                    {POSITION_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="os-headcount" className="text-sm font-semibold text-ink">Số lượng cần nhận</label>
                  <input
                    id="os-headcount"
                    type="number"
                    min={1}
                    max={5}
                    value={form.requiredHeadcount}
                    onChange={(e) => setForm((f) => ({ ...f, requiredHeadcount: Number(e.target.value) }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="os-level" className="text-sm font-semibold text-ink">Cấp kỹ năng tối thiểu</label>
                  <select
                    id="os-level"
                    value={form.minSkillLevel}
                    onChange={(e) => setForm((f) => ({ ...f, minSkillLevel: Number(e.target.value) }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((lv) => (
                      <option key={lv} value={lv}>Cấp {lv}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="os-bonus" className="text-sm font-semibold text-ink">Phụ cấp (nếu có)</label>
                  <input
                    id="os-bonus"
                    type="text"
                    value={form.bonusNote}
                    onChange={(e) => setForm((f) => ({ ...f, bonusNote: e.target.value }))}
                    placeholder="VD: Phụ cấp 30k/giờ"
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink placeholder:text-muted/50 focus:border-amber focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="os-note" className="text-sm font-semibold text-ink">Ghi chú</label>
                <textarea
                  id="os-note"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Lý do thiếu người, yêu cầu đặc biệt..."
                  className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-amber focus:outline-none"
                />
              </div>

              {formError && (
                <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2.5 text-sm font-medium text-danger">
                  {formError}
                </p>
              )}

              <div className="mt-auto flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeCreate} className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="cursor-pointer rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Đang tạo...' : 'Tạo ca mở'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}

      {/* ============ Slide-in modal: CHI TIẾT + ỨNG VIÊN ============ */}
      {detail && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${detailMounted ? 'opacity-100' : 'opacity-0'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Chi tiết ca mở"
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={closeDetail} />
          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
              detailMounted ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {detail.shiftName} · {detail.workDate}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-muted">
                  {detail.timeRange} · {detail.position} · {detail.skillRequired} (tối thiểu cấp {detail.minSkillLevel})
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Tình trạng ca */}
              <div className="mb-5 grid grid-cols-3 gap-3 rounded-xl bg-oat/50 p-4 text-center">
                <div>
                  <p className="text-[11px] text-muted">Cần nhận</p>
                  <p className="font-display text-2xl font-semibold text-ink">{detail.requiredHeadcount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Đã nhận</p>
                  <p className="font-display text-2xl font-semibold text-matcha">{detail.filledCount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Trạng thái</p>
                  <span className={`mt-1.5 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[detail.status]}`}>
                    {STATUS_LABELS[detail.status]}
                  </span>
                </div>
              </div>

              {detail.note && (
                <p className="mb-5 rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
                  <span className="font-semibold text-ink">Ghi chú: </span>
                  {detail.note}
                </p>
              )}

              {/* Danh sách ứng viên */}
              <h3 className="mb-3 text-sm font-semibold text-ink">
                Ứng viên đề xuất{' '}
                <span className="font-normal text-muted">({(detail.candidates ?? []).length} người — dựa trên kỹ năng &amp; lịch rảnh)</span>
              </h3>
              {(detail.candidates ?? []).length === 0 ? (
                <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
                  Chưa có dữ liệu ứng viên cho ca này.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {detail.candidates.map((c) => {
                    const eligible = c.available && c.skillOk;
                    const checked = selectedIds.includes(c.id);
                    return (
                      <li
                        key={c.id}
                        className={`flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                          checked ? 'border-amber/50 bg-amber/5' : 'border-line bg-white'
                        } ${eligible ? '' : 'opacity-70'}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!eligible}
                          onChange={() => toggleCandidate(c.id)}
                          className="mt-1 h-4 w-4 cursor-pointer accent-[#d96b27] disabled:cursor-not-allowed"
                          aria-label={`Chọn ${c.name}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-ink">{c.name}</p>
                            <SkillDots level={c.skillLevel} />
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                eligible ? 'bg-matcha/10 text-matcha' : 'bg-danger/10 text-danger'
                              }`}
                            >
                              {!c.available ? 'Không rảnh' : !c.skillOk ? 'Thiếu kỹ năng' : 'Đủ điều kiện'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted">{c.reasons.join(' · ')}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
              <p className="text-xs text-muted">Đã chọn {selectedIds.length} ứng viên</p>
              <div className="flex gap-3">
                <button type="button" onClick={closeDetail} className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60">
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleInvite}
                  disabled={sending || selectedIds.length === 0}
                  className="cursor-pointer rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? 'Đang gửi...' : `Gửi mời (${selectedIds.length})`}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
