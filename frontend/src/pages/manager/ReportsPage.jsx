// ============================================================
// PAGE: Báo cáo vận hành (Manager)
// Bố cục khác các trang bảng: grid thẻ loại báo cáo + slide-in modal
// tạo báo cáo + bảng lịch sử có phân trang 10/trang
// ============================================================
import { useEffect, useState } from 'react';
import {
  listReportTypes,
  listReportHistory,
  generateReport,
  deleteReport,
  downloadReport,
} from '../../services/manager/reportService.js';

const ITEMS_PER_PAGE = 10;

// Icon SVG đơn giản theo loại báo cáo
const TYPE_ICONS = {
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 14" />
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="6" width="20" height="14" rx="2" />
      <path d="M16 13h2" />
      <path d="M2 10h20" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a6 6 0 0 1 12 0v2" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    </>
  ),
};

const STATUS_BADGE = {
  READY: 'bg-matcha/10 text-matcha',
  GENERATING: 'bg-amber/10 text-amber',
  FAILED: 'bg-danger/10 text-danger',
};
const STATUS_LABELS = { READY: 'Sẵn sàng', GENERATING: 'Đang tạo', FAILED: 'Lỗi' };

// Kỳ gợi ý nhanh cho form tạo báo cáo
const QUICK_PERIODS = [
  { label: 'Tuần này (13–19/10)', from: '2026-10-13', to: '2026-10-19' },
  { label: 'Tuần trước (06–12/10)', from: '2026-10-06', to: '2026-10-12' },
  { label: 'Tháng này (01/10 – nay)', from: '2026-10-01', to: '2026-10-14' },
];

export default function ReportsPage() {
  const [types, setTypes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal tạo báo cáo
  const [genOpen, setGenOpen] = useState(false);
  const [genMounted, setGenMounted] = useState(false);
  const [genType, setGenType] = useState(null);
  const [form, setForm] = useState({ periodFrom: '2026-10-13', periodTo: '2026-10-19', format: 'PDF' });
  const [formError, setFormError] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  useEffect(() => {
    if (!genMounted) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeGen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [genMounted]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [t, h] = await Promise.all([listReportTypes(), listReportHistory()]);
      setTypes(t);
      setHistory(h);
    } catch (err) {
      setError('Không tải được dữ liệu báo cáo. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // ---------- Modal tạo báo cáo ----------
  function openGen(type) {
    setGenType(type);
    setForm((f) => ({ ...f, format: type.formats[0] }));
    setFormError('');
    setGenOpen(true);
    requestAnimationFrame(() => setGenMounted(true));
  }
  function closeGen() {
    setGenMounted(false);
    setTimeout(() => setGenOpen(false), 300);
  }

  async function handleGenerate(e) {
    e.preventDefault();
    setGenerating(true);
    setFormError('');
    try {
      const record = await generateReport({
        typeId: genType.id,
        periodFrom: form.periodFrom,
        periodTo: form.periodTo,
        format: form.format,
      });
      setHistory((prev) => [record, ...prev]);
      setCurrentPage(1);
      setNotice(`Đã tạo ${record.name} (${record.format}) cho kỳ ${record.periodLabel}.`);
      closeGen();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(record) {
    if (!window.confirm(`Xóa ${record.name} (${record.periodLabel}) khỏi lịch sử?`)) return;
    try {
      await deleteReport(record.id);
      setHistory((prev) => prev.filter((r) => r.id !== record.id));
      setNotice('Đã xóa báo cáo khỏi lịch sử.');
    } catch (err) {
      setNotice(`Lỗi: ${err.message}`);
    }
  }

  function handleDownload(record) {
    downloadReport(record);
    setNotice(`Đang tải xuống ${record.name} (${record.format})...`);
  }

  // Phân trang lịch sử
  const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const visible = history.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-5 p-8">
      {/* Header */}
      <header className="rounded-2xl border border-line bg-paper p-6 shadow-[0_8px_24px_rgba(24,20,17,0.05)]">
        <h1 className="font-display text-2xl font-semibold text-ink">Báo cáo vận hành</h1>
        <p className="mt-1 text-sm text-muted">
          Trích xuất dữ liệu lịch làm, chấm công và chi phí ra PDF/Excel phục vụ báo cáo chu kỳ
        </p>
      </header>

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

      {/* Grid loại báo cáo */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {types.map((type) => (
          <section
            key={type.id}
            className="flex flex-col rounded-2xl border border-line bg-paper p-5 transition-all duration-200 hover:border-amber/40 hover:shadow-[0_8px_24px_rgba(217,107,39,0.08)]"
          >
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-amber/10 text-amber">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {TYPE_ICONS[type.icon]}
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-ink">{type.name}</h2>
            <p className="mt-1 flex-1 text-xs leading-relaxed text-muted">{type.desc}</p>
            <div className="mt-3 flex gap-1.5">
              {type.formats.map((f) => (
                <span key={f} className="rounded-full bg-oat px-2.5 py-0.5 font-mono text-[10px] font-semibold text-ink">
                  {f}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() => openGen(type)}
              className="mt-4 cursor-pointer rounded-xl bg-ink py-2.5 text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white"
            >
              Tạo báo cáo
            </button>
          </section>
        ))}
      </div>

      {/* Lịch sử báo cáo */}
      <section className="overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-ink">Lịch sử báo cáo</h2>
          <p className="text-xs text-muted">Các báo cáo đã tạo trong 30 ngày gần nhất</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />
            <p className="text-sm text-muted">Đang tải lịch sử báo cáo...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto mb-3 h-12 w-12 text-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <h3 className="font-display text-lg font-semibold text-ink">Chưa có báo cáo nào</h3>
            <p className="mt-1 text-sm text-muted">Chọn một loại báo cáo phía trên để tạo báo cáo đầu tiên.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="bg-paper/95 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3">Tên báo cáo</th>
                    <th className="px-4 py-3">Kỳ</th>
                    <th className="px-4 py-3">Định dạng</th>
                    <th className="px-4 py-3">Kích thước</th>
                    <th className="px-4 py-3">Người tạo</th>
                    <th className="px-4 py-3">Thời điểm</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visible.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-amber/5">
                      <td className="px-4 py-3 font-semibold text-ink">{r.name}</td>
                      <td className="px-4 py-3 text-xs text-muted">{r.periodLabel}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-oat px-2.5 py-0.5 font-mono text-[10px] font-semibold text-ink">
                          {r.format}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">
                        {r.fileSizeKb ? `${(r.fileSizeKb / 1024).toFixed(1)} MB` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink">{r.generatedBy}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{r.generatedAt}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownload(r)}
                            disabled={r.status !== 'READY'}
                            title={r.status === 'READY' ? 'Tải xuống' : 'Báo cáo chưa sẵn sàng'}
                            className="cursor-pointer rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Tải xuống
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(r)}
                            title="Xóa khỏi lịch sử"
                            className="cursor-pointer rounded-lg border border-line bg-white p-1.5 text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                            aria-label={`Xóa ${r.name}`}
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {history.length > ITEMS_PER_PAGE && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
                <p className="text-xs text-muted">
                  Hiển thị {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, history.length)} trong {history.length} báo cáo
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
          </>
        )}
      </section>

      {/* ============ Slide-in modal: TẠO BÁO CÁO ============ */}
      {genOpen && genType && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${genMounted ? 'opacity-100' : 'opacity-0'}`}
          role="dialog"
          aria-modal="true"
          aria-label="Tạo báo cáo"
        >
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={closeGen} />
          <aside
            className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
              genMounted ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Tạo báo cáo</h2>
                <p className="mt-0.5 text-xs text-muted">{genType.name}</p>
              </div>
              <button
                type="button"
                onClick={closeGen}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-colors hover:border-danger hover:bg-danger hover:text-white"
                aria-label="Đóng"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              {/* Kỳ gợi ý nhanh */}
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Chọn kỳ nhanh</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_PERIODS.map((p) => {
                    const active = form.periodFrom === p.from && form.periodTo === p.to;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, periodFrom: p.from, periodTo: p.to }))}
                        className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active ? 'border-amber bg-amber text-white' : 'border-line bg-white text-muted hover:border-amber hover:text-amber'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rp-from" className="text-sm font-semibold text-ink">Từ ngày</label>
                  <input
                    id="rp-from"
                    type="date"
                    value={form.periodFrom}
                    onChange={(e) => setForm((f) => ({ ...f, periodFrom: e.target.value }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="rp-to" className="text-sm font-semibold text-ink">Đến ngày</label>
                  <input
                    id="rp-to"
                    type="date"
                    value={form.periodTo}
                    onChange={(e) => setForm((f) => ({ ...f, periodTo: e.target.value }))}
                    className="h-11 rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                  />
                </div>
              </div>

              {/* Định dạng */}
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Định dạng</p>
                <div className="flex gap-3">
                  {['PDF', 'EXCEL'].map((f) => {
                    const supported = genType.formats.includes(f);
                    const active = form.format === f;
                    return (
                      <label
                        key={f}
                        className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-4 py-3 text-sm font-semibold transition-colors ${
                          !supported
                            ? 'cursor-not-allowed border-line bg-oat/40 text-muted/50'
                            : active
                              ? 'border-amber bg-amber/10 text-amber'
                              : 'border-line bg-white text-ink hover:border-amber/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="format"
                          value={f}
                          checked={active}
                          disabled={!supported}
                          onChange={() => setForm((prev) => ({ ...prev, format: f }))}
                          className="h-4 w-4 accent-[#d96b27]"
                        />
                        {f === 'EXCEL' ? 'Excel (.xlsx)' : 'PDF (.pdf)'}
                        {!supported && <span className="text-[10px] font-normal">— không hỗ trợ</span>}
                      </label>
                    );
                  })}
                </div>
              </div>

              {formError && (
                <p role="alert" className="rounded-xl bg-danger/10 px-3 py-2.5 text-sm font-medium text-danger">
                  {formError}
                </p>
              )}

              <div className="mt-auto flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeGen} className="cursor-pointer rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-oat/60">
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-amber px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generating && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  {generating ? 'Đang tạo...' : 'Tạo báo cáo'}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
