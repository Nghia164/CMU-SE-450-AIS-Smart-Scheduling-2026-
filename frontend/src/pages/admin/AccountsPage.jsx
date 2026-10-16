// ============================================================
// Task 3.1 — AccountsPage (Quản lý tài khoản)
// Bảng dbo.users: chỉ VÔ HIỆU HÓA / KHÓA / KÍCH HOẠT LẠI — không xóa cứng
// để giữ nguyên lịch sử chấm công, bảng công. Phân trang 10 dòng/trang,
// slide-in modal tạo tài khoản, toast tự ẩn sau 4 giây.
// ============================================================

import { useEffect, useState } from 'react';
import {
  listAccounts,
  setAccountStatus,
  resetPassword,
  createAccount,
} from '../../services/admin/accountService.js';

const ITEMS_PER_PAGE = 10;

// ---------- Icons ----------
const SearchIcon = () => (
  <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const PlusIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const LockIcon = ({ open = false }) => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d={
        open
          ? 'M17 9V7a5 5 0 00-9.9-1M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z'
          : 'M17 11V7a5 5 0 00-10 0v4M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z'
      }
    />
  </svg>
);
const KeyIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 2a8 8 0 11-15.7 2.3L3 16.6V21h4.4l1.3-1.3A8 8 0 0021 11z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6-4a4 4 0 11-4-4" />
  </svg>
);
const CheckBadgeIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const ShieldOffIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
  </svg>
);

// ---------- Helpers ----------
function relativeTime(iso) {
  if (!iso) return 'Chưa từng';
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

const ROLE_META = {
  ADMIN: { label: 'Quản trị', badge: 'bg-amber/10 text-amber' },
  MANAGER: { label: 'Quản lý', badge: 'bg-matcha/10 text-matcha' },
  STAFF: { label: 'Nhân viên', badge: 'bg-muted/10 text-muted' },
};

const STATUS_META = {
  ACTIVE: { label: 'Hoạt động', badge: 'bg-matcha/10 text-matcha' },
  INACTIVE: { label: 'Vô hiệu', badge: 'bg-muted/10 text-muted' },
  LOCKED: { label: 'Bị khóa', badge: 'bg-danger/10 text-danger' },
};

const initialForm = { fullName: '', email: '', username: '', role: 'STAFF' };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Bộ lọc + phân trang
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Toast tự ẩn 4s
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Modal tạo tài khoản (slide-in từ mép phải)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await listAccounts();
        setAccounts(data);
      } catch (err) {
        setLoadError(err.message || 'Không thể tải danh sách tài khoản.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Đóng modal bằng phím Escape
  useEffect(() => {
    if (!isModalOpen) return undefined;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeModal();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isModalOpen]);

  function openModal() {
    setFormData(initialForm);
    setFormError(null);
    setIsModalOpen(true);
    setTimeout(() => setModalVisible(true), 20); // đợi 1 frame để chạy animation trượt
  }

  function closeModal() {
    setModalVisible(false);
    setTimeout(() => setIsModalOpen(false), 300); // đợi animation kết thúc
  }

  // ---- Lọc client-side + reset về trang 1 khi đổi filter/search ----
  const filtered = accounts.filter((a) => {
    if (roleFilter !== 'ALL' && a.role !== roleFilter) return false;
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    const kw = search.trim().toLowerCase();
    if (kw) {
      return (
        a.fullName.toLowerCase().includes(kw) ||
        a.username.toLowerCase().includes(kw) ||
        a.email.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // ---- Thống kê ----
  const totalActive = accounts.filter((a) => a.status === 'ACTIVE').length;
  const totalBlocked = accounts.filter((a) => a.status !== 'ACTIVE').length;

  // ---- Hành động: khóa / vô hiệu hóa / kích hoạt lại (KHÔNG có xóa) ----
  async function handleToggleStatus(account) {
    const nextStatus = account.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const confirmed =
      nextStatus === 'INACTIVE'
        ? window.confirm(`Vô hiệu hóa tài khoản ${account.fullName}? Lịch sử sẽ được giữ lại.`)
        : window.confirm(`Kích hoạt lại tài khoản ${account.fullName}?`);
    if (!confirmed) return;

    setBusyId(account.id);
    try {
      const updated = await setAccountStatus(account.id, nextStatus);
      setAccounts((prev) => prev.map((a) => (a.id === account.id ? updated : a)));
      setToast({
        type: 'success',
        message:
          nextStatus === 'INACTIVE'
            ? `Đã vô hiệu hóa tài khoản ${updated.fullName}. Lịch sử được giữ lại.`
            : `Đã kích hoạt lại tài khoản ${updated.fullName}.`,
      });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  }

  // ---- Hành động: đặt lại mật khẩu ----
  async function handleResetPassword(account) {
    setBusyId(account.id);
    try {
      const res = await resetPassword(account.id);
      setToast({ type: 'success', message: `Mật khẩu tạm cho ${res.username}: ${res.tempPassword}` });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setBusyId(null);
    }
  }

  // ---- Tạo tài khoản mới ----
  async function handleCreate(e) {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.username.trim()) {
      setFormError('Vui lòng nhập đầy đủ họ tên, email và tên đăng nhập.');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const created = await createAccount(formData);
      setAccounts((prev) => [created, ...prev]);
      setCurrentPage(1);
      setIsModalOpen(false);
      setModalVisible(false);
      setToast({
        type: 'success',
        message: `Đã tạo tài khoản ${created.username}. Mật khẩu mặc định: ${created.password}`,
      });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="p-8">
      {/* ===== Header ===== */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Hệ thống</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-muted">
            Quản lý tài khoản đăng nhập của hệ thống. Tài khoản chỉ được vô hiệu hóa hoặc khóa — không bao giờ xóa cứng để giữ lịch sử.
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 h-11 cursor-pointer rounded-xl bg-ink px-5 text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white"
        >
          <PlusIcon /> Tạo tài khoản
        </button>
      </div>

      {/* ===== Thẻ thống kê ===== */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber/10 text-amber">
            <UsersIcon />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Tổng tài khoản</p>
            <p className="font-display text-2xl font-semibold text-ink">{accounts.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-matcha/10 text-matcha">
            <CheckBadgeIcon />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Đang hoạt động</p>
            <p className="font-display text-2xl font-semibold text-ink">{totalActive}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-paper p-5 shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger/10 text-danger">
            <ShieldOffIcon />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Bị khóa / Vô hiệu</p>
            <p className="font-display text-2xl font-semibold text-ink">{totalBlocked}</p>
          </div>
        </div>
      </div>

      {/* ===== Toolbar: tìm kiếm + lọc vai trò / trạng thái ===== */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-full max-w-sm items-center gap-2 rounded-xl border-[1.5px] border-line bg-white px-3 transition-all focus-within:border-amber focus-within:shadow-[0_0_0_4px_rgba(217,107,39,0.16)]">
          <SearchIcon />
          <input
            type="text"
            placeholder="Tìm theo tên, tên đăng nhập hoặc email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-11 cursor-pointer rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value="ADMIN">Quản trị (ADMIN)</option>
          <option value="MANAGER">Quản lý (MANAGER)</option>
          <option value="STAFF">Nhân viên (STAFF)</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-11 cursor-pointer rounded-xl border-[1.5px] border-line bg-white px-3 text-sm text-ink focus:border-amber focus:outline-none"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động</option>
          <option value="INACTIVE">Vô hiệu</option>
          <option value="LOCKED">Bị khóa</option>
        </select>
      </div>

      {/* ===== Bảng tài khoản ===== */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/90 text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-5 py-3">Người dùng</th>
                <th className="px-5 py-3">Tên đăng nhập</th>
                <th className="px-5 py-3">Vai trò</th>
                <th className="px-5 py-3 text-center">Trạng thái</th>
                <th className="px-5 py-3">Đăng nhập cuối</th>
                <th className="px-5 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <span className="inline-flex items-center gap-2 text-sm text-muted">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-amber" />
                      Đang tải dữ liệu...
                    </span>
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-sm font-medium text-danger">{loadError}</td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                    Không tìm thấy tài khoản nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                paginated.map((acc) => {
                  const roleMeta = ROLE_META[acc.role] || ROLE_META.STAFF;
                  const statusMeta = STATUS_META[acc.status] || STATUS_META.INACTIVE;
                  return (
                    <tr key={acc.id} className="border-b border-line last:border-b-0 transition-colors hover:bg-amber/5">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber/20 text-sm font-bold text-amber">
                            {acc.fullName.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-semibold text-ink">{acc.fullName}</p>
                            <p className="mt-0.5 text-xs text-muted">{acc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">{acc.username}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${roleMeta.badge}`}>
                          {roleMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusMeta.badge}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted">{relativeTime(acc.lastLoginAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === acc.id}
                            onClick={() => handleToggleStatus(acc)}
                            title={acc.status === 'ACTIVE' ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt lại tài khoản'}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              acc.status === 'ACTIVE'
                                ? 'border-line text-ink hover:border-danger hover:bg-danger/10 hover:text-danger'
                                : 'border-line text-ink hover:border-matcha hover:bg-matcha/10 hover:text-matcha'
                            }`}
                          >
                            <LockIcon open={acc.status !== 'ACTIVE'} />
                            {acc.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Mở khóa'}
                          </button>
                          <button
                            type="button"
                            disabled={busyId === acc.id}
                            onClick={() => handleResetPassword(acc)}
                            title="Đặt lại mật khẩu"
                            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-amber hover:bg-amber/10 hover:text-amber disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busyId === acc.id ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-amber" />
                            ) : (
                              <KeyIcon />
                            )}
                            Đặt lại MK
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ===== Phân trang ===== */}
        {!loading && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-5 py-3">
            <span className="text-xs text-muted">
              Hiển thị <span className="font-semibold text-ink">{filtered.length === 0 ? 0 : startIndex + 1}</span> –{' '}
              <span className="font-semibold text-ink">{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}</span> trong{' '}
              <span className="font-semibold text-ink">{filtered.length}</span> bản ghi
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 items-center justify-center rounded-lg border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
                >
                  « Trang trước
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg border text-xs font-medium transition-colors ${
                        safePage === page
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
                  disabled={safePage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-8 items-center justify-center rounded-lg border border-line px-3 text-xs font-medium text-ink transition-colors hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Trang sau »
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Slide-in modal: tạo tài khoản ===== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm"
          onClick={closeModal}
          role="presentation"
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Tạo tài khoản mới"
            onClick={(e) => e.stopPropagation()}
            className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-xl transform flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
              modalVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">Tạo tài khoản mới</h2>
                <p className="mt-0.5 text-xs text-muted">Hệ thống sẽ cấp mật khẩu mặc định: Smart@123</p>
              </div>
              <button
                onClick={closeModal}
                aria-label="Đóng"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xl text-muted transition-colors hover:bg-danger/10 hover:text-danger"
              >
                &times;
              </button>
            </div>

            {/* Nội dung form */}
            <form onSubmit={handleCreate} className="flex flex-1 flex-col overflow-y-auto">
              <div className="grid gap-4 p-6">
                <label className="text-[13px] font-medium text-ink">
                  Họ và tên <span className="text-danger">*</span>
                  <input
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="VD: Nguyễn Văn An"
                    className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm focus:border-amber focus:outline-none"
                  />
                </label>
                <label className="text-[13px] font-medium text-ink">
                  Email <span className="text-danger">*</span>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="VD: nguyenvanan@smartschedule.vn"
                    className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm focus:border-amber focus:outline-none"
                  />
                </label>
                <label className="text-[13px] font-medium text-ink">
                  Tên đăng nhập <span className="text-danger">*</span>
                  <input
                    required
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="VD: nguyenvanan"
                    className="mt-1 h-10 w-full rounded-lg border border-line px-3 font-mono text-sm focus:border-amber focus:outline-none"
                  />
                </label>
                <label className="text-[13px] font-medium text-ink">
                  Vai trò
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-line bg-white px-3 text-sm focus:border-amber focus:outline-none"
                  >
                    <option value="ADMIN">Quản trị (ADMIN)</option>
                    <option value="MANAGER">Quản lý (MANAGER)</option>
                    <option value="STAFF">Nhân viên (STAFF)</option>
                  </select>
                </label>

                {formError && (
                  <p className="rounded-lg border border-danger/20 bg-danger/10 p-3 text-[13px] font-medium text-danger">
                    {formError}
                  </p>
                )}

                <p className="rounded-lg border border-amber/30 bg-amber/10 p-3 text-xs text-muted">
                  Tài khoản mới mặc định ở trạng thái <span className="font-semibold text-ink">Hoạt động</span>. Khi cần
                  gỡ khỏi hệ thống, hãy <span className="font-semibold text-ink">vô hiệu hóa</span> thay vì xóa — lịch sử
                  dữ liệu sẽ được bảo toàn.
                </p>
              </div>

              {/* Footer modal */}
              <div className="sticky bottom-0 mt-auto flex justify-end gap-3 border-t border-line bg-white p-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-crema"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </aside>
        </div>
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
