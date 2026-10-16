// ============================================================
// PAGE: Đăng ký lịch rảnh (Staff, mobile 480px)
// Banner hạn nộp + lưới 7 ngày + slide-in modal thêm khung giờ
// ============================================================
import { useEffect, useMemo, useState } from 'react';
import {
  getAvailability,
  saveAvailabilityEntry,
  removeAvailabilityEntry,
} from '../../services/staff/availabilityService.js';

const EMPTY_FORM = { id: null, dayOfWeek: 1, slot: '07:00–12:00', type: 'AVAILABLE', note: '' };

export default function AvailabilityPage() {
  const [entries, setEntries] = useState([]);
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMounted, setModalMounted] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAvailability()
      .then((res) => {
        setEntries(res.entries);
        setDeadline(res.deadlineInfo);
      })
      .catch(() => setError('Không tải được lịch rảnh. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  // Nhóm theo thứ trong tuần
  const days = useMemo(() => {
    const dayLabels = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    return Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i + 1,
      label: dayLabels[i + 1],
      items: entries.filter((e) => e.dayOfWeek === i + 1),
    }));
  }, [entries]);

  function openModal(dayOfWeek = 1) {
    setForm({ ...EMPTY_FORM, dayOfWeek });
    setFormError('');
    setModalOpen(true);
    requestAnimationFrame(() => setModalMounted(true));
  }

  function closeModal() {
    setModalMounted(false);
    setTimeout(() => setModalOpen(false), 300);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const saved = await saveAvailabilityEntry(form);
      setEntries((prev) => {
        const exists = prev.some((x) => x.id === saved.id);
        return exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [...prev, saved];
      });
      setNotice(
        saved.type === 'AVAILABLE'
          ? `Đã lưu khung giờ rảnh ${saved.startTime}–${saved.endTime}.`
          : `Đã lưu khung bận ${saved.startTime}–${saved.endTime}.`
      );
      closeModal();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(entry) {
    const dayLabels = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    if (!window.confirm(`Xóa khung ${entry.startTime}–${entry.endTime} ngày ${dayLabels[entry.dayOfWeek]}?`)) return;
    try {
      await removeAvailabilityEntry(entry.id);
      setEntries((prev) => prev.filter((x) => x.id !== entry.id));
      setNotice('Đã xóa khung giờ.');
    } catch (err) {
      setNotice(`Lỗi: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
        <div className="flex flex-col items-center gap-3 py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải lịch rảnh...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Header */}
      <header className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Đăng ký lịch rảnh</h1>
        <p className="mt-0.5 text-sm text-muted">
          Khung giờ bạn có thể nhận ca trong tuần — bộ xếp lịch dùng dữ liệu này để phân công
        </p>
      </header>

      {/* Banner hạn nộp */}
      {deadline && (
        <div className="mb-4 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3">
          <p className="text-sm font-semibold text-amber">Hạn đăng ký cho {deadline.nextPeriod}</p>
          <p className="text-xs text-ink/70">
            Trước {deadline.deadlineDay} · {deadline.deadlineTime}. Sau hạn này, lịch rảnh được khóa đến kỳ sau.
          </p>
        </div>
      )}

      {notice && (
        <div className="mb-4 rounded-xl border border-matcha/30 bg-matcha/10 px-4 py-3 text-sm font-medium text-matcha">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-medium text-danger">
          {error}
        </div>
      )}

      {/* Lưới 7 ngày */}
      <div className="space-y-2.5">
        {days.map((day) => (
          <div key={day.dayOfWeek} className="rounded-2xl border border-line bg-paper p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">{day.label}</p>
              <button
                type="button"
                onClick={() => openModal(day.dayOfWeek)}
                className="cursor-pointer rounded-full border border-line bg-white px-3 py-1 text-[11px] font-semibold text-amber transition-colors hover:border-amber hover:bg-amber hover:text-white"
              >
                + Khung giờ
              </button>
            </div>
            {day.items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line py-2.5 text-center text-xs text-muted/60">
                Chưa đăng ký khung giờ nào
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {day.items.map((entry) => (
                  <span
                    key={entry.id}
                    title={entry.note || undefined}
                    className={`group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs font-semibold ${
                      entry.type === 'AVAILABLE'
                        ? 'bg-matcha/10 text-matcha'
                        : 'bg-danger/10 text-danger'
                    }`}
                  >
                    {entry.startTime}–{entry.endTime}
                    {entry.type === 'UNAVAILABLE' && <span className="font-sans text-[9px]">bận</span>}
                    <button
                      type="button"
                      onClick={() => handleRemove(entry)}
                      className="cursor-pointer rounded-full p-0.5 opacity-50 transition-opacity hover:opacity-100"
                      aria-label={`Xóa khung ${entry.startTime}`}
                    >
                      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ============ Slide-in modal: THÊM KHUNG GIỜ ============ */}
      {modalOpen && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${modalMounted ? 'opacity-100' : 'opacity-0'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Thêm khung giờ"
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={closeModal} />
          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
              modalMounted ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">Thêm khung giờ</h2>
              <button
                type="button"
                onClick={closeModal}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="av-day" className="text-sm font-semibold text-ink">Ngày trong tuần</label>
                <select
                  id="av-day"
                  value={form.dayOfWeek}
                  onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                >
                  {days.map((d) => (
                    <option key={d.dayOfWeek} value={d.dayOfWeek}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="av-slot" className="text-sm font-semibold text-ink">Khung giờ</label>
                <select
                  id="av-slot"
                  value={form.slot}
                  onChange={(e) => setForm((f) => ({ ...f, slot: e.target.value }))}
                  className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                >
                  <option value="07:00–12:00">Sáng · 07:00–12:00</option>
                  <option value="12:00–17:00">Chiều · 12:00–17:00</option>
                  <option value="17:00–22:00">Tối · 17:00–22:00</option>
                  <option value="22:00–00:00">Tối muộn · 22:00–00:00</option>
                </select>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Trạng thái</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'AVAILABLE', label: 'Rảnh nhận ca' },
                    { value: 'UNAVAILABLE', label: 'Bận / không nhận' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-[1.5px] px-3 py-3 text-sm font-semibold transition-colors ${
                        form.type === opt.value
                          ? opt.value === 'AVAILABLE'
                            ? 'border-matcha bg-matcha/10 text-matcha'
                            : 'border-danger bg-danger/10 text-danger'
                          : 'border-line bg-white text-muted hover:border-amber/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="av-type"
                        checked={form.type === opt.value}
                        onChange={() => setForm((f) => ({ ...f, type: opt.value }))}
                        className="h-4 w-4 accent-[#d96b27]"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="av-note" className="text-sm font-semibold text-ink">Ghi chú (tùy chọn)</label>
                <textarea
                  id="av-note"
                  rows={3}
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="VD: Ưu tiên ca chiều, tối thứ 7 học thêm..."
                  className="rounded-xl border-[1.5px] border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-amber focus:outline-none"
                />
              </div>

              {formError && (
                <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2.5 text-sm font-medium text-danger">
                  {formError}
                </p>
              )}

              <div className="mt-auto flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60">
                  Hủy
                </button>
                <button type="submit" disabled={saving} className="cursor-pointer rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60">
                  {saving ? 'Đang lưu...' : 'Lưu khung giờ'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
