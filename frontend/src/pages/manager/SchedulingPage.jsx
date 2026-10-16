// File này là trang Xếp lịch làm việc: cấu hình ràng buộc, chạy xếp lịch bằng OR-Tools, xem và sửa lịch nháp trước khi chốt lịch chính thức.
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getSchedulingData,
  publishSchedule,
  runScheduler,
  updateDraftCellStaff,
} from '../../services/manager/schedulingService.js';

// Các ràng buộc xếp lịch; ràng buộc có ô nhập đi kèm thì có trường input với nhãn và đơn vị.
const RULES = [
  { key: 'capacity', title: 'Đủ số lượng nhân viên', desc: 'Đảm bảo mỗi ca có đủ số lượng nhân viên theo nhu cầu.' },
  { key: 'availability', title: 'Theo thời gian rảnh', desc: 'Chỉ phân công nhân viên vào những ca mà họ đã đăng ký rảnh.' },
  { key: 'noOverlap', title: 'Không trùng ca', desc: 'Đảm bảo nhân viên không được phân công các ca bị trùng thời gian.' },
  {
    key: 'minRest',
    title: 'Thời gian nghỉ tối thiểu',
    desc: 'Đảm bảo nhân viên có đủ thời gian nghỉ giữa các ca.',
    input: { value: 8, unit: 'giờ', label: 'Thời gian nghỉ tối thiểu' },
  },
  {
    key: 'maxConsecutive',
    title: 'Giới hạn số ca liên tiếp',
    desc: 'Không cho nhân viên làm quá số ca liên tiếp được quy định.',
    input: { value: 5, unit: 'ca/tuần', label: 'Số ca liên tiếp tối đa' },
  },
  {
    key: 'maxHours',
    title: 'Giới hạn giờ làm việc',
    desc: 'Không cho nhân viên vượt quá số giờ làm tối đa.',
    input: { value: 40, unit: 'giờ/tuần', label: 'Số giờ làm tối đa' },
  },
  { key: 'roleMatch', title: 'Theo vai trò', desc: 'Chỉ phân công nhân viên vào ca phù hợp với vai trò được yêu cầu.' },
];

// Nhãn ngắn cho các ngày trong tuần, theo thứ tự T2 đến CN.
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// Màu của ô thống kê theo nhóm: cam là cần chú ý, xanh là đạt, đỏ là thiếu, mặc định là trung tính.
const TONE_CLASS = {
  amber: 'border-amber/30 bg-amber/10 text-amber',
  green: 'border-matcha/30 bg-matcha/10 text-matcha',
  red: 'border-danger/30 bg-danger/10 text-danger',
  neutral: 'border-line bg-paper text-ink',
};

// Hàm này cộng số ngày vào một mốc thời gian và trả về ngày mới.
function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

// Hàm này đổi ngày sang dạng dd/mm/yyyy để hiển thị khoảng thời gian của tuần.
function formatFull(date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Hàm này đổi ngày sang dạng dd/mm để hiển thị dưới tên ngày trong bảng.
function formatShort(date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

// Component này hiển thị nút bật/tắt kiểu công tắc.
function Toggle({ checked, label, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
        checked ? 'bg-amber' : 'bg-line'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

// Component này hiển thị một ràng buộc: tên, mô tả, công tắc và ô nhập giá trị nếu có.
function RuleRow({ rule, state, onToggle, onValue }) {
  return (
    <div className="flex flex-col gap-3 border-b border-line py-4 last:border-b-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{rule.title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">{rule.desc}</p>
        </div>
        <Toggle checked={state.on} label={rule.title} onChange={onToggle} />
      </div>

      {rule.input && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">{rule.input.label}</span>
          <div className="flex h-9 overflow-hidden rounded-lg border-[1.5px] border-line bg-white">
            <input
              type="number"
              min={0}
              value={state.value}
              disabled={!state.on}
              onChange={(e) => onValue(Math.max(0, Number(e.target.value) || 0))}
              className="w-20 px-3 text-sm text-ink focus:outline-none disabled:text-muted"
            />
            <span className="flex items-center border-l border-line bg-crema px-3 text-xs text-muted">
              {rule.input.unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Component này hiển thị một ô thống kê ở đầu trang gồm giá trị, nhãn và màu theo nhóm.
function StatTile({ value, label, tone = 'neutral' }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${TONE_CLASS[tone]}`}>
      <p className="font-display text-xl font-semibold leading-tight">{value}</p>
      <p className="mt-0.5 text-xs opacity-80">{label}</p>
    </div>
  );
}

// Component này bọc một khối nội dung có tiêu đề và mô tả, dùng cho ba cột của trang.
function Card({ title, subtitle, children }) {
  return (
    <section className="flex flex-col rounded-2xl border border-line bg-paper p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
      <div className="mb-4">
        <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// Component này là trang Xếp lịch làm việc: tải dữ liệu, quản lý cấu hình, chạy xếp lịch, sửa bản nháp và chốt lịch.
export default function SchedulingPage() {
  const [data, setData] = useState(null);
  const [weekStart, setWeekStart] = useState(() => new Date(2026, 9, 12));
  const [rules, setRules] = useState(() =>
    Object.fromEntries(RULES.map((r) => [r.key, { on: true, value: r.input?.value ?? null }])),
  );
  const [selectedDays, setSelectedDays] = useState(() => new Set([0, 1, 2, 3, 4]));
  const [reqs, setReqs] = useState(null);
  const [runState, setRunState] = useState('idle');
  const [notice, setNotice] = useState(null);
  const [editingCell, setEditingCell] = useState(null);
  const [selectedEmpToAdd, setSelectedEmpToAdd] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSchedulingData().then((d) => {
      if (cancelled) return;
      setData(d);
      setReqs(Object.fromEntries(d.shifts.map((s) => [s.key, { ...s.requirements }])));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const dayDates = useMemo(() => DAY_LABELS.map((_, i) => addDays(weekStart, i)), [weekStart]);

  const cells = useMemo(
    () =>
      data
        ? data.shifts.flatMap((shift) =>
            data.grid[shift.key].map((cell, dayIdx) => ({ shift, dayIdx, ...cell })),
          )
        : [],
    [data],
  );

  const shortCells = cells.filter((c) => c.a < c.r);
  const fullCount = cells.length - shortCells.length;
  const weekendMissing = !selectedDays.has(5) || !selectedDays.has(6);

  if (!data || !reqs) {
    return <div className="p-8 text-sm text-muted">Đang tải dữ liệu xếp lịch...</div>;
  }

  // Hàm này đổi trạng thái một ràng buộc: bật hoặc tắt, hoặc cập nhật giá trị nhập.
  function updateRule(key, patch) {
    setRules((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  }

  // Hàm này chọn hoặc bỏ chọn một ngày áp dụng nhu cầu.
  function toggleDay(index) {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  // Hàm này cập nhật số nhân viên cần cho một vai trò trong một ca mẫu.
  function updateRequirement(shiftKey, role, value) {
    setReqs((prev) => ({
      ...prev,
      [shiftKey]: { ...prev[shiftKey], [role]: Math.max(0, Number(value) || 0) },
    }));
  }

  // Hàm này chuyển sang tuần trước hoặc tuần sau.
  function shiftWeek(delta) {
    setWeekStart((prev) => addDays(prev, delta * 7));
    setNotice(null);
  }

  // Hàm này chọn áp dụng nhu cầu của T2 đến T6 sang T7 và CN, dùng chung nhu cầu hiện tại.
  function copyWeekend() {
    setSelectedDays(new Set([0, 1, 2, 3, 4, 5, 6]));
    setNotice('Đã sao chép nhu cầu cho T7 và CN.');
  }

  // Hàm này chọn T7 và CN để thiết lập riêng; người dùng chỉnh nhu cầu ở bảng ca mẫu.
  function setupWeekendSeparately() {
    setSelectedDays(new Set([0, 1, 2, 3, 4, 5, 6]));
    setNotice('Hãy chỉnh nhu cầu T7 và CN trong bảng ca mẫu bên dưới.');
  }

  // Hàm này chạy xếp lịch bằng OR-Tools và cập nhật trạng thái khi hoàn tất.
  async function handleRun() {
    setRunState('running');
    setNotice(null);
    const updated = await runScheduler();
    setData(updated);
    setRunState('done');
    setNotice('Đã tạo lịch nháp bằng OR-Tools. Bấm vào từng ô ca trong bảng Kết quả để xem và sửa trước khi chốt.');
  }

  // Hàm này chốt bản nháp thành lịch chính thức.
  async function handlePublish() {
    const updated = await publishSchedule();
    setData(updated);
    setNotice('Đã chốt lịch chính thức và gửi thông báo đến nhân viên.');
  }

  // Hàm này gỡ một nhân viên khỏi ca đang chọn trong bản nháp.
  async function handleRemoveStaffFromCell(empName) {
    if (!editingCell) return;
    const currentCell = data.grid[editingCell.shiftKey][editingCell.dayIdx];
    const nextList = (currentCell.staff ?? []).filter((name) => name !== empName);
    const updated = await updateDraftCellStaff(editingCell.shiftKey, editingCell.dayIdx, nextList);
    setData(updated);
  }

  // Hàm này thêm một nhân viên vào ca đang chọn trong bản nháp.
  async function handleAddStaffToCell() {
    if (!editingCell || !selectedEmpToAdd) return;
    const currentCell = data.grid[editingCell.shiftKey][editingCell.dayIdx];
    const currentStaff = currentCell.staff ?? [];
    if (currentStaff.includes(selectedEmpToAdd)) return;
    const nextList = [...currentStaff, selectedEmpToAdd];
    const updated = await updateDraftCellStaff(editingCell.shiftKey, editingCell.dayIdx, nextList);
    setData(updated);
    setSelectedEmpToAdd('');
  }

  const isPublished = data.scheduleStatus === 'PUBLISHED';
  const runStatusText = runState === 'running' ? 'Đang chạy' : runState === 'done' ? 'Hoàn tất' : 'Sẵn sàng';

  const stats = [
    { value: data.totalEmployees, label: 'Nhân viên' },
    { value: cells.length, label: 'Ca làm việc' },
    { value: DAY_LABELS.length, label: 'Ngày' },
    {
      value: isPublished ? 'Đã chốt' : 'Lịch nháp',
      label: 'Trạng thái',
      tone: isPublished ? 'green' : 'amber',
    },
    { value: `${fullCount}/${cells.length}`, label: 'Ca đáp ứng đủ nhân viên', tone: 'green' },
    { value: shortCells.length, label: 'Ca thiếu nhân viên', tone: 'red' },
    { value: data.assignedEmployees, label: 'Nhân viên được phân công' },
    { value: runStatusText, label: 'Tiến trình xếp lịch', tone: runState === 'done' ? 'green' : 'neutral' },
  ];

  const weekEnd = addDays(weekStart, 6);
  const activeEditShift = editingCell ? data.shifts.find((s) => s.key === editingCell.shiftKey) : null;
  const activeEditCell = editingCell ? data.grid[editingCell.shiftKey][editingCell.dayIdx] : null;
  const availableEmployeesToAdd = activeEditCell
    ? (data.employees ?? []).filter((e) => !(activeEditCell.staff ?? []).includes(e.name))
    : [];

  return (
    <section className="p-8">
      {/* Đầu trang: tiêu đề, chọn tuần và nút chạy OR-Tools */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Tạo lịch tự động</h1>
          <p className="mt-1 max-w-[70ch] text-sm text-muted">
            Cấu hình nhu cầu nhân sự và các ràng buộc để hệ thống dùng OR-Tools tạo lịch nháp. Manager có thể xem và chỉnh sửa trước khi chốt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 items-center gap-2 rounded-xl border border-line bg-white px-3 text-sm text-ink">
            <span className="text-muted">Tuần</span>
            <span className="font-semibold">
              {formatFull(weekStart)} – {formatFull(weekEnd)}
            </span>
            <button
              type="button"
              onClick={() => shiftWeek(-1)}
              aria-label="Tuần trước"
              className="ml-2 grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted hover:bg-crema"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => shiftWeek(1)}
              aria-label="Tuần sau"
              className="grid h-7 w-7 cursor-pointer place-items-center rounded-md text-muted hover:bg-crema"
            >
              ›
            </button>
          </div>

          <button
            type="button"
            onClick={handleRun}
            disabled={runState === 'running'}
            className="h-11 cursor-pointer rounded-xl bg-ink px-5 text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {runState === 'running' ? 'Đang tạo lịch...' : 'Tạo lịch bằng OR-Tools'}
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="h-11 cursor-pointer rounded-xl border border-matcha bg-matcha px-5 text-sm font-semibold text-white transition-colors hover:bg-matcha/90"
          >
            {isPublished ? 'Đã chốt lịch' : 'Chốt lịch chính thức'}
          </button>
        </div>
      </div>

      {/* Hàng thống kê */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        {stats.map((s) => (
          <StatTile key={s.label} value={s.value} label={s.label} tone={s.tone} />
        ))}
      </div>

      {notice && (
        <p role="status" className="mt-4 rounded-xl border border-matcha/30 bg-matcha/10 px-4 py-2.5 text-sm font-medium text-matcha">
          {notice}
        </p>
      )}

      {/* Ba cột: ràng buộc, nhu cầu nhân sự, kết quả */}
      <div className="mt-6 grid items-start gap-5 xl:grid-cols-3">
        <Card title="Ràng buộc khi xếp lịch" subtitle="Các ràng buộc giúp hệ thống tạo lịch phù hợp với nhu cầu và quy định của quán.">
          <div className="flex flex-col">
            {RULES.map((rule) => (
              <RuleRow
                key={rule.key}
                rule={rule}
                state={rules[rule.key]}
                onToggle={(on) => updateRule(rule.key, { on })}
                onValue={(value) => updateRule(rule.key, { value })}
              />
            ))}
          </div>
        </Card>

        <Card title="Thiết lập nhu cầu nhân sự" subtitle="Điều chỉnh số lượng nhân viên cho từng ca theo ngày áp dụng.">
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">1. Ngày áp dụng nhu cầu</p>
              <div className="grid grid-cols-7 gap-1.5">
                {DAY_LABELS.map((label, i) => {
                  const active = selectedDays.has(i);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleDay(i)}
                      aria-pressed={active}
                      className={`h-10 cursor-pointer rounded-lg border text-xs font-semibold transition-colors ${
                        active
                          ? 'border-amber bg-amber text-white'
                          : 'border-line bg-white text-muted hover:bg-crema'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {weekendMissing && (
              <div className="rounded-xl border border-amber/30 bg-amber/10 p-4">
                <p className="text-sm font-semibold text-amber">T7 và Chủ nhật chưa thiết lập nhu cầu.</p>
                <p className="mt-1 text-xs text-ink/70">
                  Bạn có thể sao chép nhu cầu cho T7 và CN hoặc thiết lập riêng.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={copyWeekend}
                    className="h-10 cursor-pointer rounded-lg border border-amber/40 bg-white text-xs font-semibold text-ink hover:bg-crema"
                  >
                    Sao chép nhu cầu cho T7 & CN
                  </button>
                  <button
                    type="button"
                    onClick={setupWeekendSeparately}
                    className="h-10 cursor-pointer rounded-lg border border-line bg-white text-xs font-semibold text-ink hover:bg-crema"
                  >
                    Thiết lập riêng T7 & CN
                  </button>
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-ink">2. Nhu cầu theo ca mẫu</p>
              <div className="overflow-x-auto rounded-xl border border-line bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line bg-crema text-left text-xs text-muted">
                      <th className="px-3 py-2.5 font-medium">Ca làm việc</th>
                      {data.roles.map((role) => (
                        <th key={role} className="px-2 py-2.5 text-center font-medium">
                          {role}
                        </th>
                      ))}
                      <th className="px-3 py-2.5 text-center font-medium">Tổng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.shifts.map((shift) => {
                      const total = data.roles.reduce((sum, role) => sum + (reqs[shift.key][role] ?? 0), 0);
                      return (
                        <tr key={shift.key} className="border-b border-line last:border-b-0">
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-ink">Ca {shift.name.toLowerCase()}</p>
                            <p className="text-xs text-muted">{shift.time}</p>
                          </td>
                          {data.roles.map((role) => (
                            <td key={role} className="px-2 py-2.5 text-center">
                              <input
                                type="number"
                                min={0}
                                value={reqs[shift.key][role] ?? 0}
                                onChange={(e) => updateRequirement(shift.key, role, e.target.value)}
                                className="h-8 w-14 rounded-md border border-line bg-white text-center text-sm text-ink focus:border-amber focus:outline-none"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2.5 text-center font-semibold text-ink">{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-muted">* Nhu cầu này áp dụng cho các ngày đã chọn ở trên.</p>
            </div>
          </div>
        </Card>

        <Card title="Kết quả tạo lịch (Bản nháp)" subtitle="Bấm vào từng ô ca để xem danh sách nhân viên và chỉnh sửa trước khi chốt.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-1 text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left text-xs font-medium text-muted">Ca / Ngày</th>
                  {DAY_LABELS.map((label, i) => (
                    <th key={label} className="px-1 py-1 text-center">
                      <span className="block text-xs font-semibold text-ink">{label}</span>
                      <span className="block font-mono text-[10px] text-muted">{formatShort(dayDates[i])}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.shifts.map((shift) => (
                  <tr key={shift.key}>
                    <td className="px-2 py-2 align-middle">
                      <p className="text-sm font-semibold text-ink">{shift.name}</p>
                      <p className="text-[11px] text-muted">{shift.time}</p>
                    </td>
                    {data.grid[shift.key].map((cell, i) => {
                      const isSelected = editingCell?.shiftKey === shift.key && editingCell?.dayIdx === i;
                      return (
                        <td key={i} className="p-0">
                          <button
                            type="button"
                            onClick={() => setEditingCell({ shiftKey: shift.key, dayIdx: i })}
                            className={`w-full cursor-pointer rounded-lg px-1 py-2.5 text-center text-xs font-semibold transition-all ${
                              cell.a < cell.r ? 'bg-danger/10 text-danger' : 'bg-matcha/10 text-matcha'
                            } ${isSelected ? 'ring-2 ring-amber' : 'hover:opacity-80'}`}
                          >
                            {cell.a}/{cell.r}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Khung xem và chỉnh sửa trực tiếp nhân viên trong ca nháp đang chọn */}
          {editingCell && activeEditCell && activeEditShift && (
            <div className="mt-4 rounded-xl border border-line bg-crema/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {DAY_LABELS[editingCell.dayIdx]} ({formatShort(dayDates[editingCell.dayIdx])}) • Ca{' '}
                    {activeEditShift.name.toLowerCase()} ({activeEditCell.a}/{activeEditCell.r})
                  </p>
                  <p className="text-xs text-muted">Xem hoặc thêm/gỡ nhân viên trong bản nháp</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCell(null)}
                  className="cursor-pointer text-xs font-semibold text-muted hover:text-ink"
                >
                  Đóng
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(activeEditCell.staff ?? []).map((empName) => (
                  <span
                    key={empName}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-medium text-ink"
                  >
                    {empName}
                    <button
                      type="button"
                      onClick={() => handleRemoveStaffFromCell(empName)}
                      title="Gỡ khỏi ca"
                      className="cursor-pointer font-bold text-danger hover:opacity-75"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <select
                  value={selectedEmpToAdd}
                  onChange={(e) => setSelectedEmpToAdd(e.target.value)}
                  className="h-9 flex-1 rounded-lg border border-line bg-white px-2.5 text-xs text-ink focus:border-amber focus:outline-none"
                >
                  <option value="">-- Chọn nhân viên để thêm vào ca --</option>
                  {availableEmployeesToAdd.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.code} - {emp.name} ({emp.role})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddStaffToCell}
                  disabled={!selectedEmpToAdd}
                  className="h-9 cursor-pointer rounded-lg bg-ink px-3.5 text-xs font-semibold text-crema hover:bg-amber hover:text-white disabled:opacity-50"
                >
                  Thêm
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-matcha" />
              Đủ nhân viên
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" />
              Thiếu nhân viên
            </span>
          </div>

          {shortCells.length > 0 ? (
            <div className="mt-5 rounded-xl border border-amber/30 bg-amber/10 p-4">
              <p className="text-sm font-semibold text-amber">Lịch làm việc có ca chưa đủ nhân viên</p>
              <p className="mt-0.5 text-xs text-ink/70">
                Hệ thống phát hiện một số ca chưa đáp ứng đủ nhu cầu nhân sự.
              </p>

              <ul className="mt-4 flex flex-col gap-3">
                {shortCells.map((c) => (
                  <li key={`${c.shift.key}-${c.dayIdx}`} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-danger">
                        {DAY_LABELS[c.dayIdx]} ({formatShort(dayDates[c.dayIdx])}) • Ca {c.shift.name.toLowerCase()}
                      </p>
                      <p className="text-xs text-danger/80">Thiếu {c.r - c.a} nhân viên</p>
                    </div>
                    {c.s && <p className="shrink-0 text-xs font-medium text-ink">Đề xuất: {c.s}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-5 rounded-xl border border-matcha/30 bg-matcha/10 p-4 text-sm font-medium text-matcha">
              Tất cả ca đã đủ nhân viên theo nhu cầu.
            </p>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <Link
              to="/manager/open-shifts"
              className="flex h-10 items-center rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-crema"
            >
              Tìm người thay thế
            </Link>
            <Link
              to="/manager/open-shifts"
              className="flex h-10 items-center rounded-xl bg-ink px-4 text-sm font-semibold text-crema hover:bg-amber hover:text-white"
            >
              Đăng ca mở
            </Link>
          </div>
        </Card>
      </div>
    </section>
  );
}