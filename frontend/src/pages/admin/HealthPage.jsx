// ============================================================
// Task 3.3 — HealthPage (Trạng thái dịch vụ hệ thống)
// Dashboard monitor: chỉ số tài nguyên (CPU/RAM/Disk/Users), 6 thẻ dịch vụ
// (Laravel, SQL Server, Redis, OR-Tools, AI, Web) + bảng lịch sử chạy bộ
// giải (scheduling_runs) có phân trang 10 dòng/trang.
// ============================================================

import { useEffect, useState } from 'react';
import { getHealthData, rerunHealthCheck, triggerSolverRun } from '../../services/admin/healthService.js';

const ITEMS_PER_PAGE = 10;

// ---------- Icons ----------
const RefreshIcon = ({ className = 'h-4 w-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
    />
  </svg>
);
const PlayIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <circle cx="12" cy="12" r="9" />
  </svg>
);
const GaugeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// ---------- Helpers ----------
function relativeTime(iso) {
  if (!iso) return '—';
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

const formatSeconds = (ms) => (ms == null ? '—' : `${(ms / 1000).toFixed(1)}s`);

// Màu độ trễ theo ngưỡng: <100ms matcha, <300ms amber, >=300ms danger
function latencyColor(ms) {
  if (ms == null) return 'text-muted';
  if (ms < 100) return 'text-matcha';
  if (ms < 300) return 'text-amber';
  return 'text-danger';
}

// Màu thanh progress theo mức sử dụng
function usageColor(percent) {
  if (percent < 50) return 'bg-matcha';
  if (percent < 75) return 'bg-amber';
  return 'bg-danger';
}

const SERVICE_STATUS = {
  UP: { label: 'Hoạt động', dot: 'bg-matcha animate-pulse', badge: 'bg-matcha/10 text-matcha' },
  DEGRADED: { label: 'Bất thường', dot: 'bg-amber', badge: 'bg-amber/10 text-amber' },
  DOWN: { label: 'Mất kết nối', dot: 'bg-danger', badge: 'bg-danger/10 text-danger' },
};

const RUN_STATUS = {
  SUCCESS: { label: 'Thành công', badge: 'bg-matcha/10 text-matcha' },
  FAILED: { label: 'Thất bại', badge: 'bg-danger/10 text-danger' },
  RUNNING: { label: 'Đang chạy', badge: 'bg-amber/10 text-amber animate-pulse' },
  TIMEOUT: { label: 'Hết giờ', badge: 'bg-danger/10 text-danger' },
};

export default function HealthPage() {
  const [services, setServices] = useState([]);
  const [recentRuns, setRecentRuns] = useState([]);
  const [metrics, setMetrics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [checkingId, setCheckingId] = useState(null); // service đang được kiểm tra lại
  const [solverRunning, setSolverRunning] = useState(false);

  const [runPage, setRunPage] = useState(1);

  // Toast tự ẩn 4s
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await getHealthData();
        setServices(data.services);
        setRecentRuns(data.recentRuns);
        setMetrics(data.metrics);
      } catch (err) {
        setLoadError(err.message || 'Không thể tải dữ liệu giám sát.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Kiểm tra lại một dịch vụ — trong lúc check, mọi nút "Kiểm tra lại" bị khóa
  async function handleCheck(serviceId) {
    setCheckingId(serviceId);
    try {
      const updated = await rerunHealthCheck(serviceId);
      setServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)));
      setToast({
        type: 'success',
        message: `${updated.name}: ${SERVICE_STATUS[updated.status].label.toLowerCase()} — độ trễ ${updated.latencyMs}ms.`,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setCheckingId(null);
    }
  }

  // Chạy bộ giải thử — confirm trước khi thực hiện
  async function handleSolverRun() {
    const ok = window.confirm('Chạy bộ giải thử cho kỳ lịch tuần hiện tại?\nHệ thống sẽ mô phỏng một lần chạy OR-Tools.');
    if (!ok) return;

    setSolverRunning(true);
    try {
      const run = await triggerSolverRun('Tuần 43 (12/10 – 18/10)');
      setRecentRuns((prev) => [run, ...prev]);
      setRunPage(1);
      if (run.status === 'SUCCESS') {
        setToast({ type: 'success', message: `Bộ giải chạy thành công trong ${formatSeconds(run.solveTimeMs)}. Không có vi phạm ràng buộc.` });
      } else {
        setToast({ type: 'error', message: `Bộ giải thất bại: ${run.hardViolations} vi phạm ràng buộc, ${run.unfilled} vị trí chưa xếp.` });
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSolverRunning(false);
    }
  }

  // ---- Phân trang bảng runs ----
  const totalRunPages = Math.max(1, Math.ceil(recentRuns.length / ITEMS_PER_PAGE));
  const safeRunPage = Math.min(runPage, totalRunPages);
  const runStart = (safeRunPage - 1) * ITEMS_PER_PAGE;
  const paginatedRuns = recentRuns.slice(runStart, runStart + ITEMS_PER_PAGE);

  const metricCards = metrics
    ? [
        { label: 'CPU', value: `${metrics.cpu}%`, percent: metrics.cpu, sub: 'Mức sử dụng bộ xử lý' },
        { label: 'Bộ nhớ (RAM)', value: `${metrics.memory}%`, percent: metrics.memory, sub: 'Mức sử dụng bộ nhớ' },
        { label: 'Ổ đĩa', value: `${metrics.disk}%`, percent: metrics.disk, sub: 'Dung lượng đang dùng' },
        {
          label: 'Người dùng truy cập',
          value: `${metrics.activeUsers}/${metrics.activeUsersMax}`,
          percent: Math.round((metrics.activeUsers / metrics.activeUsersMax) * 100),
          sub: 'Phiên đang hoạt động',
        },
      ]
    : [];

  return (
    <section className="p-8">
      {/* ===== Header ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Hệ thống</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Trạng thái dịch vụ</h1>
          <p className="mt-1 text-sm text-muted">
            Giám sát hạ tầng thời gian thực: Laravel API, SQL Server, Redis, bộ giải OR-Tools, AI Service và Web Frontend.
          </p>
        </div>
        <button
          onClick={handleSolverRun}
          disabled={solverRunning || loading}
          className="flex items-center gap-2 h-11 cursor-pointer rounded-xl bg-ink px-5 text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {solverRunning ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-crema/40 border-t-crema" />
          ) : (
            <PlayIcon />
          )}
          {solverRunning ? 'Đang chạy giải...' : 'Chạy giải thử'}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-paper py-20 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-amber" />
            Đang tải dữ liệu giám sát...
          </span>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-5 py-4 text-sm font-medium text-danger">
          {loadError}
        </div>
      ) : (
        <>
          {/* ===== Chỉ số tài nguyên ===== */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map((m) => (
              <div key={m.label} className="rounded-2xl border border-line bg-paper p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted">
                    <GaugeIcon />
                    <span className="text-xs font-semibold uppercase tracking-wide">{m.label}</span>
                  </div>
                  <span className="font-mono text-lg font-semibold text-ink">{m.value}</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-oat">
                  <div className={`h-full rounded-full transition-all duration-500 ${usageColor(m.percent)}`} style={{ width: `${m.percent}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* ===== Thẻ dịch vụ ===== */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const meta = SERVICE_STATUS[service.status] || SERVICE_STATUS.DOWN;
              return (
                <div
                  key={service.id}
                  className="flex flex-col rounded-2xl border border-line bg-paper p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)] transition-colors hover:bg-amber/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-3 w-3 shrink-0 rounded-full ${meta.dot}`} />
                      <div>
                        <p className="font-semibold text-ink">{service.name}</p>
                        <span className={`mt-0.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCheck(service.id)}
                      disabled={checkingId !== null}
                      title={checkingId !== null ? 'Đang có dịch vụ khác được kiểm tra...' : 'Kiểm tra lại trạng thái'}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-amber/10 hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {checkingId === service.id ? (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-amber" />
                      ) : (
                        <RefreshIcon />
                      )}
                      Kiểm tra lại
                    </button>
                  </div>

                  <p className="mt-3 flex-1 text-xs leading-relaxed text-muted">{service.description}</p>

                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-muted">Uptime 30 ngày</p>
                      <p className="font-mono text-sm font-semibold text-ink">{service.uptimePercent}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted">Độ trễ</p>
                      <p className={`font-mono text-sm font-semibold ${latencyColor(service.latencyMs)}`}>
                        {service.latencyMs}ms
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted">Sự cố gần nhất</p>
                      <p className="text-xs font-medium text-ink">{relativeTime(service.lastIncident)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== Lần chạy bộ giải gần đây ===== */}
          <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">Lần chạy bộ giải lịch gần đây</h2>
              <p className="mt-0.5 text-xs text-muted">Kết quả chạy bộ giải OR-Tools (bảng scheduling_runs).</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-line bg-paper/90 text-left text-xs font-medium uppercase tracking-wide text-muted">
                    <th className="px-5 py-3">Kỳ lịch</th>
                    <th className="px-5 py-3 text-center">Trạng thái</th>
                    <th className="px-5 py-3 text-right">Thời gian giải</th>
                    <th className="px-5 py-3 text-center">Vi phạm ràng buộc</th>
                    <th className="px-5 py-3 text-center">Chưa xếp</th>
                    <th className="px-5 py-3">Thời điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRuns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                        Chưa có lần chạy bộ giải nào được ghi nhận.
                      </td>
                    </tr>
                  ) : (
                    paginatedRuns.map((run) => {
                      const meta = RUN_STATUS[run.status] || RUN_STATUS.FAILED;
                      return (
                        <tr key={run.id} className="border-b border-line last:border-b-0 transition-colors hover:bg-amber/5">
                          <td className="px-5 py-4">
                            <p className="font-medium text-ink">{run.scheduleLabel}</p>
                            <p className="mt-0.5 font-mono text-xs text-muted">{run.id}</p>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-sm text-ink">{formatSeconds(run.solveTimeMs)}</td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${
                                run.hardViolations > 0 ? 'bg-danger/10 text-danger' : 'bg-matcha/10 text-matcha'
                              }`}
                            >
                              {run.hardViolations}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-flex min-w-[24px] items-center justify-center rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${
                                run.unfilled > 0 ? 'bg-amber/10 text-amber' : 'bg-matcha/10 text-matcha'
                              }`}
                            >
                              {run.unfilled}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted">{relativeTime(run.startedAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ===== Phân trang bảng runs ===== */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-5 py-3">
              <span className="text-xs text-muted">
                Hiển thị <span className="font-semibold text-ink">{recentRuns.length === 0 ? 0 : runStart + 1}</span> –{' '}
                <span className="font-semibold text-ink">{Math.min(runStart + ITEMS_PER_PAGE, recentRuns.length)}</span> trong{' '}
                <span className="font-semibold text-ink">{recentRuns.length}</span> bản ghi
              </span>
              {totalRunPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeRunPage === 1}
                    onClick={() => setRunPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 items-center justify-center rounded-lg border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    « Trang trước
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalRunPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setRunPage(page)}
                        className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                          safeRunPage === page
                            ? 'border-amber bg-amber text-white shadow-sm'
                            : 'border-line bg-white text-ink hover:bg-crema'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={safeRunPage === totalRunPages}
                    onClick={() => setRunPage((p) => Math.min(totalRunPages, p + 1))}
                    className="flex h-8 items-center justify-center rounded-lg border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Trang sau »
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ===== Toast tự ẩn 4s ===== */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[70] flex max-w-md items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === 'error' ? 'bg-danger' : 'bg-matcha'
          }`}
        >
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-lg leading-none opacity-80 hover:opacity-100">
            &times;
          </button>
        </div>
      )}
    </section>
  );
}
