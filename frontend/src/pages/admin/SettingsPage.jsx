// ============================================================
// Task 3.4 — SettingsPage (Cài đặt hệ thống)
// Form cấu hình theo nhóm (bảng system_settings): input number/select/
// time/toggle, lưu từng hàng, khôi phục mặc định, cảnh báo nhạy cảm cho
// Geofence + nhật ký thay đổi cấu hình có phân trang 10 dòng/trang.
// ============================================================

import { useEffect, useState } from 'react';
import { getSettings, updateSetting, resetToDefault } from '../../services/admin/settingsService.js';

const ITEMS_PER_PAGE = 10;

// Nhãn tiếng Việt cho các option ngày trong tuần
const DAY_LABELS_VI = {
  MONDAY: 'Thứ 2',
  TUESDAY: 'Thứ 3',
  WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5',
  FRIDAY: 'Thứ 6',
  SATURDAY: 'Thứ 7',
  SUNDAY: 'Chủ nhật',
};

// ---------- Icons ----------
const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);
const UndoIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5M3.05 13a9 9 0 102.13-7.36L3 8" />
  </svg>
);
const HistoryIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const CogIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
    <circle cx="12" cy="12" r="3" />
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

// Hiển thị giá trị dạng chip: option ngày dịch sang tiếng Việt
function displayValue(value) {
  return DAY_LABELS_VI[value] || value;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [changeLog, setChangeLog] = useState([]);
  const [drafts, setDrafts] = useState({});

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [savingKey, setSavingKey] = useState(null);

  const [logPage, setLogPage] = useState(1);

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
        const data = await getSettings();
        setSettings(data.settings);
        setChangeLog(data.changeLog);
        setDrafts(Object.fromEntries(data.settings.map((s) => [s.key, s.value])));
      } catch (err) {
        setLoadError(err.message || 'Không thể tải cấu hình hệ thống.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function setDraft(key, value) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }

  const isDirty = (setting) => String(drafts[setting.key] ?? setting.value) !== setting.value;

  // Lưu một cấu hình. Geofence là cấu hình nhạy cảm → confirm bắt buộc.
  async function handleSave(setting) {
    const newValue = String(drafts[setting.key] ?? setting.value);
    if (newValue === setting.value) return;

    if (setting.key === 'store.geofence_radius_m') {
      const ok = window.confirm('Thay đổi bán kính Geofence ảnh hưởng toàn bộ nhân viên. Tiếp tục?');
      if (!ok) return;
    }

    setSavingKey(setting.key);
    try {
      const res = await updateSetting(setting.key, newValue);
      setSettings((prev) => prev.map((s) => (s.key === setting.key ? res.setting : s)));
      if (res.changeEntry) setChangeLog((prev) => [res.changeEntry, ...prev]);
      setToast({ type: 'success', message: `Đã lưu cấu hình "${setting.label}".` });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSavingKey(null);
    }
  }

  // Khôi phục giá trị mặc định của một cấu hình
  async function handleReset(setting) {
    const ok = window.confirm(`Khôi phục giá trị mặc định cho "${setting.label}"?`);
    if (!ok) return;

    setSavingKey(setting.key);
    try {
      const res = await resetToDefault(setting.key);
      setSettings((prev) => prev.map((s) => (s.key === setting.key ? res.setting : s)));
      setDraft(setting.key, res.setting.value);
      if (res.changeEntry) setChangeLog((prev) => [res.changeEntry, ...prev]);
      setToast({ type: 'success', message: `Đã khôi phục mặc định cho "${setting.label}".` });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSavingKey(null);
    }
  }

  // Gom cấu hình theo nhóm (giữ thứ tự xuất hiện)
  const groups = [];
  settings.forEach((s) => {
    let g = groups.find((x) => x.name === s.group);
    if (!g) {
      g = { name: s.group, items: [] };
      groups.push(g);
    }
    g.items.push(s);
  });

  // ---- Phân trang nhật ký ----
  const totalLogPages = Math.max(1, Math.ceil(changeLog.length / ITEMS_PER_PAGE));
  const safeLogPage = Math.min(logPage, totalLogPages);
  const logStart = (safeLogPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = changeLog.slice(logStart, logStart + ITEMS_PER_PAGE);

  // Label hiển thị của một setting key (dùng cho nhật ký)
  const labelOfKey = (key) => {
    const found = settings.find((s) => s.key === key);
    return found ? found.label : key;
  };

  return (
    <section className="p-8">
      {/* ===== Header ===== */}
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber/10 text-amber">
          <CogIcon />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Hệ thống</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Cài đặt hệ thống</h1>
          <p className="mt-1 text-sm text-muted">
            Cấu hình các biến vận hành của cửa hàng: Geofence chấm công, hạn nộp lịch rảnh, bộ giải, lương và thông báo.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-paper py-20 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
          <span className="inline-flex items-center gap-2 text-sm text-muted">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-amber" />
            Đang tải cấu hình...
          </span>
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 px-5 py-4 text-sm font-medium text-danger">
          {loadError}
        </div>
      ) : (
        <>
          {/* ===== Các khối cấu hình theo nhóm ===== */}
          <div className="grid gap-6">
            {groups.map((group) => (
              <div key={group.name} className="rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-display text-lg font-semibold text-ink">{group.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">{group.items.length} cấu hình</p>
                </div>
                <div className="divide-y divide-line">
                  {group.items.map((setting) => {
                    const dirty = isDirty(setting);
                    return (
                      <div key={setting.key} className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-amber/5 md:flex-row md:items-center md:justify-between">
                        {/* Nhãn + mô tả */}
                        <div className="max-w-md">
                          <p className="text-sm font-semibold text-ink">{setting.label}</p>
                          <p className="mt-0.5 text-xs text-muted">{setting.desc}</p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">{setting.key}</p>
                        </div>

                        {/* Control + nút thao tác */}
                        <div className="flex flex-wrap items-center gap-3">
                          {setting.type === 'number' && (
                            <input
                              type="number"
                              value={drafts[setting.key] ?? setting.value}
                              min={setting.min}
                              max={setting.max}
                              step={setting.step}
                              onChange={(e) => setDraft(setting.key, e.target.value)}
                              className="h-10 w-28 rounded-lg border border-line bg-white px-3 font-mono text-sm text-ink focus:border-amber focus:outline-none"
                            />
                          )}

                          {setting.type === 'select' && (
                            <select
                              value={drafts[setting.key] ?? setting.value}
                              onChange={(e) => setDraft(setting.key, e.target.value)}
                              className="h-10 cursor-pointer rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
                            >
                              {setting.options.map((opt) => (
                                <option key={opt} value={opt}>
                                  {displayValue(opt)}
                                </option>
                              ))}
                            </select>
                          )}

                          {setting.type === 'time' && (
                            <input
                              type="time"
                              value={drafts[setting.key] ?? setting.value}
                              onChange={(e) => setDraft(setting.key, e.target.value)}
                              className="h-10 w-32 rounded-lg border border-line bg-white px-3 font-mono text-sm text-ink focus:border-amber focus:outline-none"
                            />
                          )}

                          {setting.type === 'toggle' && (
                            <button
                              type="button"
                              role="switch"
                              aria-checked={drafts[setting.key] === 'true'}
                              onClick={() => setDraft(setting.key, drafts[setting.key] === 'true' ? 'false' : 'true')}
                              className={`relative flex h-6 w-11 items-center rounded-full px-0.5 transition-colors duration-200 ${
                                drafts[setting.key] === 'true' ? 'justify-end bg-matcha' : 'justify-start bg-line'
                              }`}
                            >
                              <span className="h-5 w-5 rounded-full bg-white shadow transition-transform duration-200" />
                            </button>
                          )}

                          {/* Khôi phục mặc định */}
                          <button
                            type="button"
                            onClick={() => handleReset(setting)}
                            disabled={savingKey !== null}
                            title="Khôi phục giá trị mặc định"
                            className="flex items-center gap-1 rounded-lg border border-line px-2.5 py-2 text-xs font-medium text-muted transition-colors hover:border-amber hover:text-amber disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <UndoIcon />
                            Mặc định
                          </button>

                          {/* Lưu thay đổi */}
                          <button
                            type="button"
                            onClick={() => handleSave(setting)}
                            disabled={!dirty || savingKey !== null}
                            title={dirty ? 'Lưu cấu hình' : 'Chưa có thay đổi để lưu'}
                            className="flex items-center gap-1.5 rounded-lg bg-amber px-3 py-2 text-xs font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
                          >
                            {savingKey === setting.key ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            ) : (
                              <CheckIcon />
                            )}
                            Lưu
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* ===== Nhật ký thay đổi cấu hình ===== */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
            <div className="flex items-center gap-2 border-b border-line px-5 py-4">
              <span className="text-amber">
                <HistoryIcon />
              </span>
              <h2 className="font-display text-lg font-semibold text-ink">Nhật ký thay đổi cấu hình</h2>
            </div>
            <ul className="divide-y divide-line">
              {paginatedLogs.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5 transition-colors hover:bg-amber/5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">{labelOfKey(entry.key)}</p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">{entry.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-oat px-2 py-0.5 font-mono text-xs text-muted line-through">
                      {displayValue(entry.oldValue)}
                    </span>
                    <span className="text-xs text-muted">→</span>
                    <span className="rounded-md bg-matcha/10 px-2 py-0.5 font-mono text-xs font-semibold text-matcha">
                      {displayValue(entry.newValue)}
                    </span>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs font-semibold text-ink">{entry.actor}</p>
                    <p className="text-xs text-muted">{relativeTime(entry.at)}</p>
                  </div>
                </li>
              ))}
              {!loading && paginatedLogs.length === 0 && (
                <li className="px-5 py-6 text-center text-sm text-muted">Chưa có thay đổi cấu hình nào được ghi nhận.</li>
              )}
            </ul>

            {/* ===== Phân trang nhật ký ===== */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-5 py-3">
              <span className="text-xs text-muted">
                Hiển thị <span className="font-semibold text-ink">{changeLog.length === 0 ? 0 : logStart + 1}</span> –{' '}
                <span className="font-semibold text-ink">{Math.min(logStart + ITEMS_PER_PAGE, changeLog.length)}</span> trong{' '}
                <span className="font-semibold text-ink">{changeLog.length}</span> bản ghi
              </span>
              {totalLogPages > 1 && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={safeLogPage === 1}
                    onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 items-center justify-center rounded-lg border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    « Trang trước
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalLogPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setLogPage(page)}
                        className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                          safeLogPage === page
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
                    disabled={safeLogPage === totalLogPages}
                    onClick={() => setLogPage((p) => Math.min(totalLogPages, p + 1))}
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
