// ============================================================
// SERVICE — Task 3.3 HealthPage (Trạng thái dịch vụ hệ thống)
// Giả lập API giám sát hạ tầng: danh sách dịch vụ, lịch sử chạy
// bộ giải (scheduling_runs), chỉ số tài nguyên + hành động vận hành.
// ============================================================

import {
  services as initialServices,
  recentRuns as initialRuns,
  systemMetrics,
} from '../../mock/admin/HealthPage.mock.js';

let servicesStore = structuredClone(initialServices);
let runsStore = structuredClone(initialRuns);
let nextRunNo = 1043;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Lấy toàn bộ dữ liệu giám sát
export async function getHealthData() {
  await delay(400);
  return {
    services: structuredClone(servicesStore),
    recentRuns: structuredClone(runsStore),
    metrics: structuredClone(systemMetrics),
  };
}

// Kiểm tra lại trạng thái một dịch vụ — giả lập refresh: trả về trạng thái
// ngẫu nhiên (UP 70% / DEGRADED 30%) và độ trễ mới (12 – 950ms)
export async function rerunHealthCheck(serviceId) {
  await delay(1200);
  const service = servicesStore.find((s) => s.id === serviceId);
  if (!service) throw new Error('Không tìm thấy dịch vụ trong hệ thống.');

  const nextStatus = Math.random() < 0.7 ? 'UP' : 'DEGRADED';
  service.status = nextStatus;
  service.latencyMs = randomBetween(12, 950);

  return structuredClone(service);
}

// Chạy bộ giải thử cho một kỳ lịch — trả về lần chạy mới (SUCCESS 75% / FAILED 25%)
export async function triggerSolverRun(scheduleLabel) {
  await delay(1500);
  const success = Math.random() < 0.75;

  const run = {
    id: `RUN-${nextRunNo}`,
    scheduleLabel: scheduleLabel || 'Tuần 43 (12/10 – 18/10)',
    status: success ? 'SUCCESS' : 'FAILED',
    solveTimeMs: success ? randomBetween(1200, 8000) : randomBetween(14200, 15000),
    hardViolations: success ? 0 : randomBetween(1, 3),
    unfilled: success ? 0 : randomBetween(1, 4),
    startedAt: new Date().toISOString(),
  };
  nextRunNo += 1;

  runsStore.unshift(run);
  return structuredClone(run);
}

export default { getHealthData, rerunHealthCheck, triggerSolverRun };
