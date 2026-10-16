// ============================================================
// MOCK: Báo cáo vận hành (Manager) — trích xuất PDF/Excel
// 4 loại báo cáo + 22 bản ghi lịch sử tạo báo cáo
// ============================================================

export const REPORT_TYPES = [
  {
    id: 'schedule',
    name: 'Báo cáo lịch làm việc',
    desc: 'Danh sách ca đã xếp theo tuần, đối chiếu số người/vị trí.',
    formats: ['PDF', 'EXCEL'],
    icon: 'calendar',
  },
  {
    id: 'attendance',
    name: 'Báo cáo chấm công',
    desc: 'Chi tiết check-in/out GPS, đi trễ, vắng mặt theo kỳ.',
    formats: ['PDF', 'EXCEL'],
    icon: 'clock',
  },
  {
    id: 'payroll',
    name: 'Báo cáo chi phí nhân sự',
    desc: 'Tổng hợp giờ công, tăng ca và chi phí lương ước tính.',
    formats: ['PDF', 'EXCEL'],
    icon: 'wallet',
  },
  {
    id: 'turnover',
    name: 'Báo cáo biến động nhân sự',
    desc: 'Tuyển mới, nghỉ việc, tỷ lệ giữ chân theo tháng.',
    formats: ['PDF'],
    icon: 'users',
  },
];

export const TYPE_LABELS = Object.fromEntries(REPORT_TYPES.map((t) => [t.id, t.name]));

// Lịch sử 22 báo cáo: 18 READY, 2 GENERATING, 2 FAILED
export const mockReportHistory = [
  { id: 1, type: 'payroll', name: 'Báo cáo chi phí nhân sự', periodLabel: 'Tuần 42 · 13–19/10/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-14 20:10', fileSizeKb: 1840, status: 'READY' },
  { id: 2, type: 'attendance', name: 'Báo cáo chấm công', periodLabel: 'Tuần 42 · 13–19/10/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-14 18:45', fileSizeKb: 620, status: 'READY' },
  { id: 3, type: 'schedule', name: 'Báo cáo lịch làm việc', periodLabel: 'Tuần 43 · 20–26/10/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-14 16:00', fileSizeKb: 950, status: 'READY' },
  { id: 4, type: 'payroll', name: 'Báo cáo chi phí nhân sự', periodLabel: 'Chu kỳ 01–15/10/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-14 10:30', fileSizeKb: 2110, status: 'READY' },
  { id: 5, type: 'turnover', name: 'Báo cáo biến động nhân sự', periodLabel: 'Tháng 9/2026', format: 'PDF', generatedBy: 'Quản trị hệ thống', generatedAt: '2026-10-13 09:15', fileSizeKb: 480, status: 'READY' },
  { id: 6, type: 'attendance', name: 'Báo cáo chấm công', periodLabel: 'Tuần 41 · 06–12/10/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-13 08:40', fileSizeKb: 880, status: 'READY' },
  { id: 7, type: 'schedule', name: 'Báo cáo lịch làm việc', periodLabel: 'Tuần 42 · 13–19/10/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-12 22:00', fileSizeKb: 540, status: 'READY' },
  { id: 8, type: 'payroll', name: 'Báo cáo chi phí nhân sự', periodLabel: 'Tháng 9/2026', format: 'PDF', generatedBy: 'Quản trị hệ thống', generatedAt: '2026-10-12 15:20', fileSizeKb: 2390, status: 'READY' },
  { id: 9, type: 'attendance', name: 'Báo cáo chấm công', periodLabel: 'Chu kỳ 16–30/09/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-11 09:00', fileSizeKb: 730, status: 'GENERATING' },
  { id: 10, type: 'schedule', name: 'Báo cáo lịch làm việc', periodLabel: 'Tuần 41 · 06–12/10/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-10 20:30', fileSizeKb: 910, status: 'READY' },
  { id: 11, type: 'payroll', name: 'Báo cáo chi phí nhân sự', periodLabel: 'Tuần 41 · 06–12/10/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-10 08:10', fileSizeKb: 1420, status: 'READY' },
  { id: 12, type: 'turnover', name: 'Báo cáo biến động nhân sự', periodLabel: 'Tháng 8/2026', format: 'PDF', generatedBy: 'Quản trị hệ thống', generatedAt: '2026-10-09 14:50', fileSizeKb: 460, status: 'READY' },
  { id: 13, type: 'attendance', name: 'Báo cáo chấm công', periodLabel: 'Tuần 40 · 29/09–05/10/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-09 09:25', fileSizeKb: 860, status: 'READY' },
  { id: 14, type: 'schedule', name: 'Báo cáo lịch làm việc', periodLabel: 'Chu kỳ 16–30/09/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-08 18:00', fileSizeKb: 560, status: 'READY' },
  { id: 15, type: 'payroll', name: 'Báo cáo chi phí nhân sự', periodLabel: 'Tuần 40 · 29/09–05/10/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-08 08:35', fileSizeKb: 1380, status: 'READY' },
  { id: 16, type: 'attendance', name: 'Báo cáo chấm công', periodLabel: 'Tháng 9/2026', format: 'EXCEL', generatedBy: 'Quản trị hệ thống', generatedAt: '2026-10-07 10:00', fileSizeKb: 0, status: 'FAILED' },
  { id: 17, type: 'schedule', name: 'Báo cáo lịch làm việc', periodLabel: 'Tháng 9/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-06 21:15', fileSizeKb: 1150, status: 'READY' },
  { id: 18, type: 'payroll', name: 'Báo cáo chi phí nhân sự', periodLabel: 'Chu kỳ 16–30/09/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-06 08:05', fileSizeKb: 1520, status: 'READY' },
  { id: 19, type: 'attendance', name: 'Báo cáo chấm công', periodLabel: 'Tuần 39 · 22–28/09/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-05 19:40', fileSizeKb: 840, status: 'READY' },
  { id: 20, type: 'schedule', name: 'Báo cáo lịch làm việc', periodLabel: 'Tuần 40 · 29/09–05/10/2026', format: 'EXCEL', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-04 17:25', fileSizeKb: 0, status: 'FAILED' },
  { id: 21, type: 'payroll', name: 'Báo cáo chi phí nhân sự', periodLabel: 'Tuần 39 · 22–28/09/2026', format: 'PDF', generatedBy: 'Quản lý cửa hàng', generatedAt: '2026-10-04 08:00', fileSizeKb: 1310, status: 'READY' },
  { id: 22, type: 'turnover', name: 'Báo cáo biến động nhân sự', periodLabel: 'Tháng 7/2026', format: 'PDF', generatedBy: 'Quản trị hệ thống', generatedAt: '2026-10-03 11:30', fileSizeKb: 450, status: 'READY' },
];

export default mockReportHistory;
