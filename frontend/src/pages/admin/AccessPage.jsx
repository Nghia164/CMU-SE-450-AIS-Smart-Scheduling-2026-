// ============================================================
// Task 3.2 — AccessPage (Phân quyền truy cập theo Role)
// Ma trận 16 quyền × 3 vai trò (ADMIN / MANAGER / STAFF): tương tác trực
// tiếp bằng checkbox, gỡ quyền nhạy cảm của ADMIN phải confirm.
// Mọi thay đổi được ghi vào "Nhật ký thay đổi" (bảng audit_logs).
// ============================================================

import { Fragment, useEffect, useState } from 'react';
import { getAccessData, updatePermission } from '../../services/admin/accessService.js';

// ---------- Icons ----------
const ShieldIcon = ({ className = '' }) => (
  <svg className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);
const HistoryIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

// Màu nhận diện theo vai trò
const ROLE_THEME = {
  ADMIN: {
    card: 'border-amber/40 bg-amber/5',
    iconWrap: 'bg-amber/15 text-amber',
    chip: 'bg-amber/10 text-amber',
    accent: 'accent-amber',
  },
  MANAGER: {
    card: 'border-matcha/40 bg-matcha/5',
    iconWrap: 'bg-matcha/15 text-matcha',
    chip: 'bg-matcha/10 text-matcha',
    accent: 'accent-matcha',
  },
  STAFF: {
    card: 'border-line bg-oat/40',
    iconWrap: 'bg-oat text-muted',
    chip: 'bg-muted/10 text-muted',
    accent: 'accent-muted',
  },
};

export default function AccessPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [savingKey, setSavingKey] = useState(null); // `${permissionId}-${role}` đang lưu

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
        const data = await getAccessData();
        setRoles(data.roles);
        setPermissions(data.permissions);
        setAuditLog(data.auditLog);
      } catch (err) {
        setLoadError(err.message || 'Không thể tải dữ liệu phân quyền.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Bật / tắt một quyền của một vai trò.
  // Gỡ quyền (TẮT) của nhóm ADMIN là thao tác nhạy cảm → bắt buộc confirm.
  async function handleToggle(permission, role) {
    const granted = !permission.grants[role];
    if (!granted && role === 'ADMIN') {
      const ok = window.confirm(
        `Bạn có chắc muốn gỡ quyền "${permission.name}" khỏi nhóm ADMIN?\nThao tác này có thể làm mất khả năng quản trị hệ thống.`
      );
      if (!ok) return;
    }

    const key = `${permission.id}-${role}`;
    setSavingKey(key);
    try {
      const res = await updatePermission(permission.id, role, granted);
      setPermissions((prev) => prev.map((p) => (p.id === permission.id ? res.permission : p)));
      setAuditLog((prev) => [res.auditEntry, ...prev]);
      setToast({
        type: 'success',
        message: granted
          ? `Đã cập nhật quyền: cấp "${permission.name}" cho ${role}.`
          : `Đã cập nhật quyền: gỡ "${permission.name}" khỏi ${role}.`,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSavingKey(null);
    }
  }

  // Gom quyền theo nhóm, giữ thứ tự nhóm xuất hiện
  const groups = [];
  permissions.forEach((p) => {
    let g = groups.find((x) => x.name === p.group);
    if (!g) {
      g = { name: p.group, items: [] };
      groups.push(g);
    }
    g.items.push(p);
  });

  return (
    <section className="p-8">
      {/* ===== Header ===== */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Hệ thống</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Phân quyền truy cập</h1>
        <p className="mt-1 text-sm text-muted">
          Cấu hình quyền theo vai trò (Role-based). Mọi thay đổi được áp dụng ngay và ghi vào nhật ký hệ thống.
        </p>
      </div>

      {/* ===== Thẻ vai trò ===== */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {roles.map((role) => {
          const theme = ROLE_THEME[role.id];
          return (
            <div
              key={role.id}
              className={`rounded-2xl border p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)] ${theme.card}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.iconWrap}`}>
                  <ShieldIcon />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-ink">{role.name}</p>
                  <p className="text-xs text-muted">
                    {role.memberCount} thành viên · <span className="font-mono font-semibold">{role.id}</span>
                  </p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">{role.desc}</p>
            </div>
          );
        })}
      </div>

      {/* ===== Ma trận quyền ===== */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/90 text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-5 py-3 text-left">Quyền</th>
                {roles.map((role) => (
                  <th key={role.id} className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ROLE_THEME[role.id].chip}`}
                    >
                      {role.id}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-muted">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-amber" />
                      Đang tải dữ liệu...
                    </span>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-sm font-medium text-danger">{loadError}</td>
                </tr>
              ) : (
                groups.map((group) => (
                  <Fragment key={`group-${group.name}`}>
                    {/* Hàng phân tách nhóm quyền */}
                    <tr>
                      <td
                        colSpan={4}
                        className="bg-oat/50 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-muted"
                      >
                        {group.name}
                      </td>
                    </tr>
                    {group.items.map((permission) => (
                      <tr
                        key={permission.id}
                        className="border-b border-line last:border-b-0 transition-colors hover:bg-amber/5"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-ink">{permission.name}</p>
                          <span className="mt-1 inline-flex rounded-md border border-line bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted">
                            {permission.group}
                          </span>
                        </td>
                        {roles.map((role) => (
                          <td key={role.id} className="px-5 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(permission.grants[role.id])}
                              disabled={savingKey !== null}
                              onChange={() => handleToggle(permission, role.id)}
                              className={`h-5 w-5 cursor-pointer rounded border-line transition-all ${ROLE_THEME[role.id].accent} disabled:cursor-wait disabled:opacity-40`}
                              aria-label={`${permission.name} — ${role.id}`}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== Nhật ký thay đổi ===== */}
      <div className="mt-6 rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <span className="text-amber">
            <HistoryIcon />
          </span>
          <h2 className="font-display text-lg font-semibold text-ink">Nhật ký thay đổi</h2>
          <span className="ml-auto text-xs text-muted">8 thay đổi gần nhất</span>
        </div>
        <ul className="divide-y divide-line">
          {auditLog.slice(0, 8).map((entry) => (
            <li key={entry.id} className="flex flex-wrap items-center gap-x-2 gap-y-1 px-5 py-3 transition-colors hover:bg-amber/5">
              <span className="text-sm font-semibold text-ink">{entry.actor}</span>
              <span className="text-sm text-muted">{entry.action}</span>
              <span className="ml-auto text-xs text-muted">{relativeTime(entry.at)}</span>
            </li>
          ))}
          {!loading && auditLog.length === 0 && (
            <li className="px-5 py-6 text-center text-sm text-muted">Chưa có thay đổi nào được ghi nhận.</li>
          )}
        </ul>
      </div>

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
