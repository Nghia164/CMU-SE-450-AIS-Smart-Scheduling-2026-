// ============================================================
// MOCK DATA — Task 3.3 HealthPage (Trạng thái dịch vụ hệ thống)
// Monitor: Laravel API, SQL Server 2022, Redis Cache, OR-Tools Solver,
// AI Service, Web Frontend + lịch sử chạy bộ giải (bảng scheduling_runs)
// + chỉ số tài nguyên hệ thống.
// ============================================================

// 6 dịch vụ — 4 UP, 1 DEGRADED (Redis latency cao), 1 DOWN (AI Service)
export const services = [
  {
    id: 'laravel-api',
    name: 'Laravel API',
    status: 'UP',
    uptimePercent: 99.98,
    latencyMs: 45,
    lastIncident: '2026-09-28T10:12:00',
    description: 'REST API nghiệp vụ chính: đăng nhập, xếp lịch, chấm công, bảng công.',
  },
  {
    id: 'sqlserver',
    name: 'SQL Server 2022',
    status: 'UP',
    uptimePercent: 99.95,
    latencyMs: 23,
    lastIncident: '2026-08-14T02:40:00',
    description: 'Cơ sở dữ liệu giao dịch: users, schedules, attendance_records, timesheets.',
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    status: 'DEGRADED',
    uptimePercent: 99.21,
    latencyMs: 420,
    lastIncident: '2026-10-14T05:03:00',
    description: 'Cache phiên đăng nhập và hàng đợi thông báo. Độ trễ tăng cao bất thường.',
  },
  {
    id: 'ortools',
    name: 'OR-Tools Solver',
    status: 'UP',
    uptimePercent: 99.87,
    latencyMs: 180,
    lastIncident: '2026-10-02T22:15:00',
    description: 'Bộ giải xếp lịch tối ưu (CP-SAT), giới hạn 15 giây cho mỗi lần chạy.',
  },
  {
    id: 'ai-service',
    name: 'AI Service',
    status: 'DOWN',
    uptimePercent: 97.42,
    latencyMs: 950,
    lastIncident: '2026-10-14T04:26:00',
    description: 'Trợ lý AI phân tích số liệu. Đang mất kết nối tới endpoint model.',
  },
  {
    id: 'web-frontend',
    name: 'Web Frontend',
    status: 'UP',
    uptimePercent: 99.99,
    latencyMs: 12,
    lastIncident: null,
    description: 'Giao diện web React phục vụ Admin, Manager và Staff.',
  },
];

// 8 lần chạy bộ giải gần đây (bảng scheduling_runs)
export const recentRuns = [
  { id: 'RUN-1042', scheduleLabel: 'Tuần 43 (12/10 – 18/10)', status: 'RUNNING', solveTimeMs: null, hardViolations: 0, unfilled: 0, startedAt: '2026-10-14T09:12:00' },
  { id: 'RUN-1041', scheduleLabel: 'Tuần 43 (12/10 – 18/10)', status: 'SUCCESS', solveTimeMs: 5240, hardViolations: 0, unfilled: 0, startedAt: '2026-10-14T08:02:00' },
  { id: 'RUN-1040', scheduleLabel: 'Tuần 43 (12/10 – 18/10)', status: 'SUCCESS', solveTimeMs: 4810, hardViolations: 0, unfilled: 0, startedAt: '2026-10-13T21:40:00' },
  { id: 'RUN-1039', scheduleLabel: 'Tuần 42 (05/10 – 11/10)', status: 'FAILED', solveTimeMs: 14200, hardViolations: 3, unfilled: 4, startedAt: '2026-10-12T20:15:00' },
  { id: 'RUN-1038', scheduleLabel: 'Tuần 42 (05/10 – 11/10)', status: 'SUCCESS', solveTimeMs: 3960, hardViolations: 0, unfilled: 0, startedAt: '2026-10-12T19:02:00' },
  { id: 'RUN-1037', scheduleLabel: 'Tuần 41 (28/09 – 04/10)', status: 'TIMEOUT', solveTimeMs: 15000, hardViolations: 2, unfilled: 3, startedAt: '2026-10-06T21:33:00' },
  { id: 'RUN-1036', scheduleLabel: 'Tuần 41 (28/09 – 04/10)', status: 'SUCCESS', solveTimeMs: 4420, hardViolations: 0, unfilled: 0, startedAt: '2026-10-06T20:48:00' },
  { id: 'RUN-1035', scheduleLabel: 'Tuần 40 (21/09 – 27/09)', status: 'SUCCESS', solveTimeMs: 5130, hardViolations: 1, unfilled: 0, startedAt: '2026-09-29T20:05:00' },
];

// Chỉ số tài nguyên hệ thống hiện tại
export const systemMetrics = {
  cpu: 34,        // % CPU
  memory: 61,     // % RAM
  disk: 47,       // % ổ đĩa
  activeUsers: 9, // người đang truy cập
  activeUsersMax: 20,
};

export default { services, recentRuns, systemMetrics };
