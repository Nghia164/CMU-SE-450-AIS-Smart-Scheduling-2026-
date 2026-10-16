// File này là trang Tính lương của Manager: tính lương từ dữ liệu chấm công và bảng công đã duyệt trong kỳ của 30 nhân viên.
import { useEffect, useMemo, useState } from 'react';
import { getPayrollPeriods, getPayroll } from '../../services/manager/payrollService.js';

// Hệ số nhân cho giờ tăng ca / ca mở khi tính chi phí.
const OVERTIME_MULTIPLIER = 1.5;

// Bộ định dạng tiền tệ Việt Nam đồng.
const moneyFormat = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

// Bộ định dạng số giờ, tối đa một chữ số thập phân.
const hourFormat = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });

// Nhãn tiếng Việt cho loại nhân viên.
const EMPLOYMENT_LABEL = { FULL_TIME: 'Toàn thời gian', PART_TIME: 'Bán thời gian' };

// Hàm này tổng hợp giờ thường, giờ tăng ca, chi phí lương và số bảng công chờ duyệt của một nhân viên từ dữ liệu chấm công.
function summarizeEmployee(emp) {
  const approved = emp.timesheets.filter((t) => t.status === 'APPROVED');
  const regularHours = approved.reduce((sum, t) => sum + t.regularHours, 0);
  const overtimeHours = approved.reduce((sum, t) => sum + t.overtimeHours, 0);
  const amount = regularHours * emp.hourlyRate + overtimeHours * emp.hourlyRate * OVERTIME_MULTIPLIER;
  const pending = emp.timesheets.filter((t) => t.status === 'PENDING_APPROVAL').length;
  return { regularHours, overtimeHours, amount, pending };
}

// Component này hiển thị một thẻ số liệu tổng hợp gồm nhãn, giá trị và ghi chú.
function StatCard({ label, value, note, accent, noteTone = 'text-muted' }) {
  return (
    <div className="rounded-2xl border border-line bg-paper p-4 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
      <span className={`block h-1 w-8 rounded-full ${accent}`} />
      <p className="mt-3 text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className={`mt-1 text-xs ${noteTone}`}>{note}</p>
    </div>
  );
}

// Component này là trang Tính lương: chọn kỳ, xem tổng quan và bảng lương của 30 nhân viên tính từ dữ liệu chấm công.
export default function PayrollPage() {
  const [periods, setPeriods] = useState([]);
  const [periodKey, setPeriodKey] = useState('');
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPayrollPeriods().then((list) => {
      if (cancelled) return;
      setPeriods(list);
      setPeriodKey(list[0]?.key ?? '');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!periodKey) return;
    let cancelled = false;
    getPayroll(periodKey).then((data) => {
      if (!cancelled) setRows(data);
    });
    return () => {
      cancelled = true;
    };
  }, [periodKey]);

  const summarized = useMemo(
    () => (rows ?? []).map((emp) => ({ ...emp, ...summarizeEmployee(emp) })),
    [rows],
  );

  const totals = useMemo(
    () =>
      summarized.reduce(
        (acc, r) => ({
          regularHours: acc.regularHours + r.regularHours,
          overtimeHours: acc.overtimeHours + r.overtimeHours,
          amount: acc.amount + r.amount,
          pending: acc.pending + r.pending,
        }),
        { regularHours: 0, overtimeHours: 0, amount: 0, pending: 0 },
      ),
    [summarized],
  );

  // Hàm này đổi kỳ lương và xóa dữ liệu cũ để hiển thị trạng thái đang tải.
  function handlePeriodChange(key) {
    setRows(null);
    setPeriodKey(key);
  }

  return (
    <section className="p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Công & lương</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Tính lương</h1>
          <p className="mt-1 max-w-[60ch] text-sm text-muted">
            Bảng lương chung được tổng hợp trực tiếp từ dữ liệu chấm công và bảng công đã duyệt.
          </p>
        </div>
        <select
          value={periodKey}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="h-11 cursor-pointer rounded-xl border-[1.5px] border-line bg-white px-3.5 text-sm font-medium text-ink focus:border-amber focus:outline-none"
        >
          {periods.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {!rows ? (
        <p className="mt-8 text-sm text-muted">Đang tải bảng công...</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Tổng giờ thường"
              value={`${hourFormat.format(totals.regularHours)} giờ`}
              note="Từ dữ liệu chấm công đã duyệt"
              accent="bg-matcha"
            />
            <StatCard
              label="Tổng giờ làm ca mở"
              value={`${hourFormat.format(totals.overtimeHours)} giờ`}
              note={`Hệ số ${OVERTIME_MULTIPLIER}x`}
              accent="bg-amber"
            />
            <StatCard
              label="Tổng lương tạm tính"
              value={moneyFormat.format(totals.amount)}
              note={`${summarized.length} nhân viên`}
              accent="bg-ink"
            />
            <StatCard
              label="Bảng công chờ duyệt"
              value={totals.pending}
              note={totals.pending > 0 ? 'Chưa được cộng vào lương' : 'Không có'}
              accent="bg-danger"
              noteTone={totals.pending > 0 ? 'text-danger' : 'text-muted'}
            />
          </div>

          {totals.pending > 0 && (
            <p className="mt-5 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm text-ink">
              Còn {totals.pending} bảng công chờ duyệt. Hãy duyệt trong mục Xem bảng công để cập nhật đầy đủ lương.
            </p>
          )}

          <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">Nhân viên</th>
                  <th className="px-5 py-3 font-medium">Loại</th>
                  <th className="px-5 py-3 text-right font-medium">Đơn giá / giờ</th>
                  <th className="px-5 py-3 text-right font-medium">Giờ thường</th>
                  <th className="px-5 py-3 text-right font-medium">Ca mở</th>
                  <th className="px-5 py-3 text-right font-medium">Chờ duyệt</th>
                  <th className="px-5 py-3 text-right font-medium">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {summarized.map((r) => (
                  <tr key={r.employeeId} className="border-b border-line last:border-b-0">
                    <td className="px-5 py-3.5 font-semibold text-ink">{r.name}</td>
                    <td className="px-5 py-3.5 text-muted">{EMPLOYMENT_LABEL[r.employmentType]}</td>
                    <td className="px-5 py-3.5 text-right text-ink">{moneyFormat.format(r.hourlyRate)}</td>
                    <td className="px-5 py-3.5 text-right text-ink">{hourFormat.format(r.regularHours)}</td>
                    <td className="px-5 py-3.5 text-right text-ink">{hourFormat.format(r.overtimeHours)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {r.pending > 0 ? (
                        <span className="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
                          {r.pending}
                        </span>
                      ) : (
                        <span className="text-muted">0</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-ink">{moneyFormat.format(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-crema text-sm font-semibold text-ink">
                  <td className="px-5 py-3.5" colSpan={3}>
                    Tổng cộng ({summarized.length} nhân viên)
                  </td>
                  <td className="px-5 py-3.5 text-right">{hourFormat.format(totals.regularHours)}</td>
                  <td className="px-5 py-3.5 text-right">{hourFormat.format(totals.overtimeHours)}</td>
                  <td className="px-5 py-3.5 text-right">{totals.pending}</td>
                  <td className="px-5 py-3.5 text-right">{moneyFormat.format(totals.amount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </section>
  );
}