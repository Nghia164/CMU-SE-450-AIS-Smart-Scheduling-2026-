// ============================================================
// PAGE: Chấm công (Manager) — đối chiếu lịch xếp ca với GPS check-in
// Bảng có phân trang 10/trang + slide-in modal sửa giờ thủ công (audit)
// ============================================================
import { useEffect, useState } from 'react';
import {
  listAttendance,
  updateAttendanceTime,
  getAttendanceSummary,
} from '../../services/manager/attendanceService.js';
import { STATUS_LABELS, STATUS_OPTIONS } from '../../mock/manager/AttendancePage.mock.js';

const ITEMS_PER_PAGE = 10;
const GEOFENCE_RADIUS_M = 100;

// Badge trạng thái chấm công theo đặc tả
const STATUS_BADGE = {
  ON_TIME: 'bg-matcha/10 text-matcha',
  LATE: 'bg-amber/10 text-amber',
  ABSENT: 'bg-danger/10 text-danger',
  MISSING_CHECK_OUT: 'bg-danger/10 text-danger',
  EARLY_DEPARTURE: 'bg-amber/10 text-amber',
  NOT_CHECKED_IN: 'bg-muted/10 text-muted',
  INVALID_LOCATION: 'bg-danger/10 text-danger',
};

// Hiển thị giờ check + khoảng cách GPS; cảnh báo nếu ngoài geofence 100m
function GpsTime({ time, distance }) {
  if (!time) return <span className="font-mono text-xs text-muted/50">—</span>;
  const outOfRange = distance != null && distance > GEOFENCE_RADIUS_M;
  return (
    <div className="flex flex-col">
      <span className="font-mono text-sm text-ink">{time}</span>
      {distance != null && (
        <span className={`font-mono text-[10px] ${outOfRange ? 'text-danger' : 'text-muted/60'}`}>
          {Math.round(distance)}m {outOfRange && '· Ngoài vùng'}
        </span>
      )}
    </div>
  );
}

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Bộ lọc
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);

  // Slide-in modal sửa giờ
  const [editing, setEditing] = useState(null); // bản ghi đang sửa
  const [form, setForm] = useState({ checkInAt: '', checkOutAt: '', reason: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);

  // Toast thành công
  const [notice, setNotice] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Tự ẩn toast sau 4 giây
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  // Đóng modal bằng phím Escape
  useEffect(() => {
    if (!modalMounted) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeEditModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalMounted]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [list, sum] = await Promise.all([
        listAttendance({ date: dateFilter, status: statusFilter, search }),
        getAttendanceSummary(),
      ]);
      setRecords(list);
      setSummary(sum);
    } catch (err) {
      setError('Không tải được dữ liệu chấm công. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange() {
    setCurrentPage(1);
    loadData();
  }

  function openEditModal(record) {
    setEditing(record);
    setForm({ checkInAt: record.checkInAt ?? '', checkOutAt: record.checkOutAt ?? '', reason: '' });
    setFormError('');
    setModalMounted(true);
  }

  function closeEditModal() {
    setModalMounted(false);
    // Giữ nội dung trong lúc panel trượt ra ngoài rồi mới unmount
    setTimeout(() => setEditing(null), 300);
  }

  async function handleSaveTime(e) {
    e.preventDefault();
    if (!form.reason.trim()) {
      setFormError('Vui lòng nhập lý do sửa giờ');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const updated = await updateAttendanceTime(editing.id, {
        checkInAt: form.checkInAt || null,
        checkOutAt: form.checkOutAt || null,
        reason: form.reason,
      });
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      // Tải lại summary vì trạng thái có thể thay đổi
      getAttendanceSummary().then(setSummary).catch(() => {});
      setNotice(`Đã cập nhật giờ chấm công của ${updated.employeeName}.`);
      closeEditModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Phân trang phía client
  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = records.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const statCards = summary
    ? [
        { label: 'Đúng giờ', value: summary.counts.ON_TIME, tone: 'text-matcha' },
        { label: 'Đi trễ', value: summary.counts.LATE, tone: 'text-amber' },
        { label: 'Vắng mặt', value: summary.counts.ABSENT, tone: 'text-danger' },
        { label: 'Thiếu check-out', value: summary.counts.MISSING_CHECK_OUT, tone: 'text-danger' },
      ]
    : [];

  return (
    <div className="space-y-5 p-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-6 shadow-[0_8px_24px_rgba(24,20,17,0.05)]">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Chấm công</h1>
          <p className="mt-1 text-sm text-muted">
            Đối chiếu lịch xếp ca với dữ liệu GPS check-in · Geofence {GEOFENCE_RADIUS_M}m
          </p>
        </div>
        {summary && (
          <div className="flex items-center gap-4 font-mono text-[11px] text-muted">
            <span>
              Ngoài vùng: <strong className="text-danger">{summary.outOfGeofence}</strong>
            </span>
            <span>
              Đã sửa tay: <strong className="text-amber">{summary.manualEdited}</strong>
            </span>
          </div>
        )}
      </header>

      {/* Thống kê */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-line bg-paper p-5">
            <p className="text-xs font-medium text-muted">{card.label}</p>
            <p className={`mt-2 font-display text-3xl font-semibold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Toast */}
      {notice && (
        <div className="rounded-xl border border-matcha/30 bg-matcha/10 px-4 py-3 text-sm font-medium text-matcha">
          {notice}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* Bộ lọc */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-paper p-4">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setCurrentPage(1);
          }}
          onBlur={loadData}
          className="h-10 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
          aria-label="Lọc theo ngày"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
            setTimeout(loadData, 0);
          }}
          className="h-10 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
          aria-label="Lọc theo trạng thái"
        >
          <option value="ALL">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="relative min-w-[220px] flex-1">
          <svg
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
            placeholder="Tìm nhân viên theo tên hoặc mã..."
            className="h-10 w-full rounded-xl border-[1.5px] border-line bg-white pr-4 pl-10 text-sm text-ink focus:border-amber focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleFilterChange}
          className="h-10 cursor-pointer rounded-xl bg-amber px-5 text-sm font-semibold text-white transition-colors hover:bg-amber/90"
        >
          Tìm kiếm
        </button>
      </div>

      {/* Bảng dữ liệu */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải dữ liệu chấm công...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-paper/60 p-12 text-center">
          <svg className="mx-auto mb-3 h-12 w-12 text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
          <h3 className="font-display text-lg font-semibold text-ink">Không có bản ghi chấm công</h3>
          <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc ngày hoặc trạng thái để xem dữ liệu khác.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-paper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="bg-paper/95 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Nhân viên</th>
                  <th className="px-4 py-3">Ngày</th>
                  <th className="px-4 py-3">Ca</th>
                  <th className="px-4 py-3">Check-in</th>
                  <th className="px-4 py-3">Check-out</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-amber/5">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{r.employeeName}</p>
                      <p className="font-mono text-[11px] text-muted">{r.employeeCode}</p>
                      {r.manualEdited && (
                        <span className="mt-1 inline-block rounded-full bg-amber/10 px-2 py-0.5 font-mono text-[9px] text-amber">
                          ĐÃ SỬA TAY
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{r.workDate}</td>
                    <td className="px-4 py-3">
                      <p className="text-ink">{r.shiftName}</p>
                      <p className="font-mono text-[11px] text-muted">
                        {r.scheduledStart}–{r.scheduledEnd}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <GpsTime time={r.checkInAt} distance={r.checkInDistance} />
                    </td>
                    <td className="px-4 py-3">
                      <GpsTime time={r.checkOutAt} distance={r.checkOutDistance} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(r)}
                        disabled={!r.checkInAt}
                        title={r.checkInAt ? 'Sửa giờ thủ công' : 'Chưa check-in — không thể sửa'}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Sửa giờ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {records.length > ITEMS_PER_PAGE && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
              <p className="text-xs text-muted">
                Hiển thị {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, records.length)} trong{' '}
                {records.length} bản ghi
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
                      page === safePage
                        ? 'bg-amber text-white'
                        : 'border border-line bg-white text-muted hover:border-amber hover:text-amber'
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

      {/* Slide-in modal sửa giờ (trượt từ mép phải) */}
      {editing && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            modalMounted ? 'opacity-100' : 'opacity-0'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Sửa giờ chấm công"
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={closeEditModal} />
          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
              modalMounted ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Sửa giờ chấm công</h2>
                <p className="mt-0.5 text-xs text-muted">Mọi thay đổi đều được ghi audit log</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveTime} className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
              {/* Thông tin gốc */}
              <div className="mb-5 rounded-xl bg-oat/50 p-4 text-sm">
                <p className="font-semibold text-ink">
                  {editing.employeeName} <span className="font-mono text-xs text-muted">({editing.employeeCode})</span>
                </p>
                <p className="mt-1 text-muted">
                  {editing.workDate} · {editing.shiftName} · Lịch {editing.scheduledStart}–{editing.scheduledEnd}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-checkin" className="text-sm font-semibold text-ink">
                    Giờ check-in
                  </label>
                  <input
                    id="edit-checkin"
                    type="time"
                    value={form.checkInAt}
                    onChange={(e) => setForm((f) => ({ ...f, checkInAt: e.target.value }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit-checkout" className="text-sm font-semibold text-ink">
                    Giờ check-out
                  </label>
                  <input
                    id="edit-checkout"
                    type="time"
                    value={form.checkOutAt}
                    onChange={(e) => setForm((f) => ({ ...f, checkOutAt: e.target.value }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                <label htmlFor="edit-reason" className="text-sm font-semibold text-ink">
                  Lý do sửa <span className="text-danger">*</span>
                </label>
                <textarea
                  id="edit-reason"
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                  rows={3}
                  placeholder="VD: Nhân viên quên check-out, camera xác nhận ra về 22:05..."
                  className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-amber focus:outline-none"
                />
              </div>

              {formError && (
                <p role="alert" className="mt-3 rounded-xl bg-danger/10 px-3 py-2.5 text-sm font-medium text-danger">
                  {formError}
                </p>
              )}

              <div className="mt-auto flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cursor-pointer rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
