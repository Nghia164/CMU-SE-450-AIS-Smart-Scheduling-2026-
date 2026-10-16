// ============================================================
// PAGE: Lịch làm của tôi (Staff, mobile 480px)
// Toggle tuần này/tuần sau — nhóm ca theo ngày, xác nhận ca ASSIGNED
// ============================================================
import { useEffect, useMemo, useState } from 'react';
import { getMySchedule, confirmAssignment } from '../../services/staff/scheduleService.js';

function vndHour(hours) {
  return `${hours}h`;
}

// Tổng giờ của 1 ca (theo HH:MM)
function shiftHours(s) {
  const [sh, sm] = s.startTime.split(':').map(Number);
  const [eh, em] = s.endTime.split(':').map(Number);
  return (eh * 60 + em - (sh * 60 + sm)) / 60;
}

const WEEKS = [
  { id: 'this', label: 'Tuần này', range: '12–18/10/2026', dates: ['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-18'] },
  { id: 'next', label: 'Tuần sau', range: '19–25/10/2026', dates: ['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23','2026-10-24','2026-10-25'] },
];

export default function SchedulePage() {
  const [assignments, setAssignments] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [weekId, setWeekId] = useState('this');
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    getMySchedule()
      .then((res) => {
        setAssignments(res.assignments);
        setMeta(res.meta);
      })
      .catch(() => setError('Không tải được lịch làm. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const week = WEEKS.find((w) => w.id === weekId);

  // Nhóm ca theo ngày trong tuần đang xem
  const weekDays = useMemo(() => {
    return week.dates.map((date) => {
      const shifts = assignments
        .filter((a) => a.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      const totalHours = shifts.reduce((s, x) => s + shiftHours(x), 0);
      return { date, shifts, totalHours };
    });
  }, [assignments, week]);

  const weekTotal = weekDays.reduce((s, d) => s + d.totalHours, 0);
  const pendingCount = weekDays.reduce(
    (s, d) => s + d.shifts.filter((x) => x.status === 'ASSIGNED').length,
    0
  );

  async function handleConfirm(shift) {
    setConfirmingId(shift.id);
    try {
      const updated = await confirmAssignment(shift.id);
      setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setNotice(`Đã xác nhận ca ${updated.shiftName} ngày ${updated.date}.`);
    } catch (err) {
      setNotice(`Lỗi: ${err.message}`);
    } finally {
      setConfirmingId(null);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
        <div className="flex flex-col items-center gap-3 py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải lịch làm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-10 pt-6">
      {/* Header */}
      <header className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Lịch làm của tôi</h1>
        <p className="mt-0.5 text-sm text-muted">
          Chỉ hiển thị ca từ lịch đã xuất bản · {meta?.publishedScheduleName}
        </p>
      </header>

      {/* Toggle tuần */}
      <div className="mb-4 flex rounded-xl border border-line bg-paper p-1">
        {WEEKS.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setWeekId(w.id)}
            className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-semibold transition-colors ${
              weekId === w.id ? 'bg-amber text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {/* Tổng quan tuần */}
      <div className="mb-4 flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3">
        <div>
          <p className="text-xs text-muted">{week.range}</p>
          <p className="text-sm font-semibold text-ink">
            Tổng {vndHour(Math.round(weekTotal * 10) / 10)} · {weekDays.reduce((s, d) => s + d.shifts.length, 0)} ca
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber/10 px-2.5 py-1 text-xs font-semibold text-amber">
            {pendingCount} ca chờ xác nhận
          </span>
        )}
      </div>

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

      {/* Danh sách theo ngày */}
      <div className="space-y-3">
        {weekDays.map((day) => (
          <div key={day.date} className="rounded-2xl border border-line bg-paper p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">
                {day.shifts.length > 0 ? day.shifts[0].dayLabel : weekdayLabel(day.date)}{' '}
                <span className="font-mono text-xs text-muted">· {day.date}</span>
              </p>
              {day.shifts.length > 0 ? (
                <span className="font-mono text-xs text-muted">{vndHour(day.totalHours)}</span>
              ) : (
                <span className="rounded-full bg-oat px-2 py-0.5 text-[10px] font-medium text-muted">Nghỉ</span>
              )}
            </div>

            {day.shifts.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line py-3 text-center text-xs text-muted/70">
                Không có ca được xếp
              </p>
            ) : (
              <div className="space-y-2.5">
                {day.shifts.map((s) => (
                  <div key={s.id} className="rounded-xl border border-line bg-white p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink">{s.shiftName}</p>
                        <p className="mt-0.5 font-mono text-sm text-amber">
                          {s.startTime} – {s.endTime}
                        </p>
                        <p className="mt-1 text-[11px] text-muted">
                          {s.position} · {s.store}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            s.status === 'CONFIRMED'
                              ? 'bg-matcha/10 text-matcha'
                              : 'bg-amber/10 text-amber'
                          }`}
                        >
                          {s.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                        </span>
                        {s.status === 'ASSIGNED' && (
                          <button
                            type="button"
                            onClick={() => handleConfirm(s)}
                            disabled={confirmingId === s.id}
                            className="cursor-pointer rounded-lg bg-matcha px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-matcha/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {confirmingId === s.id ? 'Đang xác nhận...' : 'Xác nhận'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Nhãn thứ từ ngày ISO
function weekdayLabel(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][d.getDay()];
}
