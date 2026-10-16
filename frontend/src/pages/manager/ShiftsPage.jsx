// Trang Quản lý ca làm (Manager Shifts Page)
// 1 Page = 3 Files (Mock data, Service, JSX)
// Áp dụng "Taste Skill" và Frontend Design với glassmorphism, gradient tinh tế
import { useEffect, useState } from 'react';
import { getShiftsList, createShift, updateShift, deleteShift } from '../../services/manager/ShiftsPageService.js';
import { getShiftRequirements, createShiftRequirement } from '../../services/manager/ShiftsPageService.js';

// Component Modal trượt từ mép phải màn hình cho thêm/sửa ca làm
function SlideInModal({ isOpen, onClose, title, children }) {
  const [mounted, setMounted] = useState(false);

  // Kích hoạt animation trượt vào sau khi panel được gắn vào DOM
  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => setMounted(true));
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      setMounted(false);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-paper shadow-[0_0_60px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out ${
          mounted ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-8 py-6">
          <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-white text-muted transition-all duration-200 hover:border-danger hover:bg-danger hover:text-white"
            aria-label="Đóng"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </div>
      </aside>
    </div>
  );
}

// Component bảng với phân trang (tối đa 10 items/trang)
function ShiftsTable({ data, currentPage, totalPages, onPageChange, onEdit, onDelete }) {
  const startIndex = (currentPage - 1) * 10;
  const endIndex = Math.min(startIndex + 10, data.length);
  const currentItems = data.slice(startIndex, endIndex);

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-danger/10 text-danger border-danger/30';
      case 'NORMAL':
        return 'bg-amber/10 text-amber border-amber/30';
      case 'LOW':
        return 'bg-matcha/10 text-matcha border-matcha/30';
      default:
        return 'bg-muted/10 text-muted border-muted/30';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-matcha/10 text-matcha border-matcha/30';
      case 'CANCELLED':
        return 'bg-muted/10 text-muted border-muted/30';
      default:
        return 'bg-muted/10 text-muted border-muted/30';
    }
  };

  return (
    <div className="space-y-4">
      {/* Table container with glassmorphism */}
      <div className="overflow-hidden rounded-[16px] border border-white/10 bg-white/60 backdrop-blur-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <table className="w-full">
          <thead className="sticky top-0 border-b border-line bg-paper/90 backdrop-blur-[8px]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">Mã ca</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">Thời gian</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">Ưu tiên</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">Trạng thái</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-ink">Yêu cầu</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-ink">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {currentItems.map((shift, index) => (
              <tr
                key={shift.id}
                className="group transition-all duration-200 hover:bg-amber/5"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4">
                  <div className="font-mono text-sm font-medium text-ink">{shift.shiftName}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-muted">
                    {new Date(shift.startAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    <br />
                    <span className="text-xs text-muted/60">→</span>
                    {new Date(shift.endAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getPriorityClass(shift.priority)}`}
                  >
                    {shift.priority === 'HIGH' ? 'CAO' : shift.priority === 'NORMAL' ? 'BÌNH THƯỜNG' : 'THẤP'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(shift.status)}`}
                  >
                    {shift.status === 'ACTIVE' ? 'HOẠT ĐỘNG' : 'ĐÃ HỦY'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-muted">{shift.requirements?.length || 0} yêu cầu</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(shift)}
                      className="group/btn flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/80 text-muted transition-all duration-200 hover:border-amber hover:bg-amber hover:text-white"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 16H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(shift.id)}
                      className="group/btn flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white/80 text-danger transition-all duration-200 hover:border-danger hover:bg-danger hover:text-white"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.length > 10 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted">
            Hiển thị {(currentPage - 1) * 10 + 1} - {Math.min(endIndex, data.length)} trong tổng số {data.length} ca làm
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-line bg-white/80 px-3 py-2 text-sm font-medium text-muted transition-all duration-200 hover:border-amber hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 19l-7-7 7-7" />
              </svg>
              Trước
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(data.length / 10) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-amber text-white shadow-[0_4px_12px_rgba(217,107,39,0.3)]'
                      : 'border border-line bg-white/80 text-muted hover:border-amber hover:bg-amber hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(data.length / 10)}
              className="flex items-center gap-1 rounded-lg border border-line bg-white/80 px-3 py-2 text-sm font-medium text-muted transition-all duration-200 hover:border-amber hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Tiếp
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Component form để thêm/sửa ca làm
function ShiftForm({ shift, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    shift || {
      shiftName: '',
      startAt: '',
      endAt: '',
      priority: 'NORMAL',
      status: 'ACTIVE',
      note: '',
      requirements: []
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Tên ca làm</label>
          <input
            type="text"
            value={formData.shiftName}
            onChange={(e) => setFormData({ ...formData, shiftName: e.target.value })}
            className="rounded-xl border border-line bg-white/60 px-4 py-3 text-sm text-ink backdrop-blur-[4px] focus:border-amber focus:outline-none focus:ring-4 focus:ring-amber/20"
            placeholder="VD: Ca sáng 1"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Ưu tiên</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="rounded-xl border border-line bg-white/60 px-4 py-3 text-sm text-ink backdrop-blur-[4px] focus:border-amber focus:outline-none focus:ring-4 focus:ring-amber/20"
          >
            <option value="LOW">Thấp</option>
            <option value="NORMAL">Bình thường</option>
            <option value="HIGH">Cao</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Thời gian bắt đầu</label>
          <input
            type="datetime-local"
            value={formData.startAt}
            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            className="rounded-xl border border-line bg-white/60 px-4 py-3 text-sm text-ink backdrop-blur-[4px] focus:border-amber focus:outline-none focus:ring-4 focus:ring-amber/20"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Thời gian kết thúc</label>
          <input
            type="datetime-local"
            value={formData.endAt}
            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            className="rounded-xl border border-line bg-white/60 px-4 py-3 text-sm text-ink backdrop-blur-[4px] focus:border-amber focus:outline-none focus:ring-4 focus:ring-amber/20"
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Trạng thái</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="rounded-xl border border-line bg-white/60 px-4 py-3 text-sm text-ink backdrop-blur-[4px] focus:border-amber focus:outline-none focus:ring-4 focus:ring-amber/20"
          >
            <option value="ACTIVE">Hoạt động</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        <div className="col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-ink">Ghi chú</label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="rounded-xl border border-line bg-white/60 px-4 py-3 text-sm text-ink backdrop-blur-[4px] focus:border-amber focus:outline-none focus:ring-4 focus:ring-amber/20"
            rows={3}
            placeholder="Thêm ghi chú về ca làm này..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-line bg-white/60 px-6 py-3 text-sm font-medium text-muted transition-all duration-200 hover:border-muted hover:bg-muted/5"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="rounded-xl bg-amber px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-amber/90 hover:shadow-[0_8px_24px_rgba(217,107,39,0.3)]"
        >
          Lưu ca làm
        </button>
      </div>
    </form>
  );
}

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setLoading(true);
        const data = await getShiftsList();
        setShifts(data);
        setError('');
      } catch (err) {
        setError('Không thể tải danh sách ca làm. Vui lòng thử lại sau.');
        console.error('Error fetching shifts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShifts();
  }, []);

  // Lọc ca làm theo từ khóa tìm kiếm
  const filteredShifts = shifts.filter(
    (shift) =>
      shift.shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.note.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Xử lý thêm ca làm mới
  const handleAddShift = async (shiftData) => {
    try {
      const newShift = await createShift(shiftData);
      setShifts((prev) => [newShift, ...prev]);
      setIsModalOpen(false);
      setEditingShift(null);
    } catch (err) {
      console.error('Error creating shift:', err);
    }
  };

  // Xử lý cập nhật ca làm
  const handleUpdateShift = async (shiftData) => {
    try {
      const updatedShift = await updateShift(shiftData.id, shiftData);
      setShifts((prev) =>
        prev.map((shift) => (shift.id === updatedShift.id ? updatedShift : shift))
      );
      setIsModalOpen(false);
      setEditingShift(null);
    } catch (err) {
      console.error('Error updating shift:', err);
    }
  };

  // Xử lý xóa ca làm
  const handleDeleteShift = async (shiftId) => {
    if (window.confirm('Bạn có chắc muốn xóa ca làm này? Hành động này không thể hoàn tác.')) {
      try {
        await deleteShift(shiftId);
        setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
      } catch (err) {
        console.error('Error deleting shift:', err);
      }
    }
  };

  // Xử lý mở modal để thêm mới
  const handleAddNew = () => {
    setEditingShift(null);
    setIsModalOpen(true);
  };

  // Xử lý mở modal để sửa
  const handleEdit = (shift) => {
    setEditingShift(shift);
    setIsModalOpen(true);
  };

  // Xử lý đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingShift(null);
  };

  // Xử lý lưu form (thêm mới hoặc cập nhật)
  const handleSave = async (shiftData) => {
    if (editingShift) {
      await handleUpdateShift({ ...editingShift, ...shiftData });
    } else {
      await handleAddShift(shiftData);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-crema">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber border-t-transparent" />
          <p className="text-sm text-muted">Đang tải dữ liệu ca làm...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-crema p-8">
      {/* Header */}
      <header className="mb-8 rounded-[20px] border border-white/10 bg-paper/70 p-8 shadow-[0_16px_40px_rgba(0,0,0,0.08)] backdrop-blur-[8px]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              Quản lý ca làm
            </h1>
            <p className="mt-2 text-sm text-muted">
              Quản lý tất cả ca làm trong hệ thống - {filteredShifts.length} ca làm được tìm thấy
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 rounded-xl bg-amber px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-amber/90 hover:shadow-[0_8px_24px_rgba(217,107,39,0.3)]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 4v16m8-8H4" />
            </svg>
            Thêm ca mới
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center justify-between rounded-[16px] border border-white/10 bg-white/60 p-6 backdrop-blur-[4px] shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên ca, ghi chú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-line bg-white/60 py-3 pl-10 pr-4 text-sm text-ink backdrop-blur-[4px] focus:border-amber focus:outline-none focus:ring-4 focus:ring-amber/20"
          />
        </div>
        <div className="text-sm text-muted">
          {filteredShifts.length} ca làm
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-6 py-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredShifts.length === 0 && (
        <div className="rounded-[16px] border border-dashed border-line bg-white/40 p-12 text-center backdrop-blur-[4px]">
          <svg className="mx-auto mb-4 h-16 w-16 text-muted/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 9h6v6H9z" />
            <path d="M9 3v2m6-2v2" />
          </svg>
          <h3 className="mb-2 font-display text-lg font-semibold text-ink">Không có ca làm nào</h3>
          <p className="mb-6 text-sm text-muted">Chưa có ca làm nào được tạo. Hãy thêm ca làm đầu tiên.</p>
          <button
            onClick={handleAddNew}
            className="rounded-xl bg-amber px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-amber/90"
          >
            Thêm ca làm đầu tiên
          </button>
        </div>
      )}

      {/* Shifts Table */}
      {filteredShifts.length > 0 && (
        <ShiftsTable
          data={filteredShifts}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredShifts.length / 10)}
          onPageChange={setCurrentPage}
          onEdit={handleEdit}
          onDelete={handleDeleteShift}
        />
      )}

      {/* Slide-in Modal */}
      <SlideInModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingShift ? 'Chỉnh sửa ca làm' : 'Thêm ca làm mới'}
      >
        <ShiftForm shift={editingShift} onSave={handleSave} onCancel={handleCloseModal} />
      </SlideInModal>
    </main>
  );
}
