import { useEffect, useState } from 'react';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
} from '../../services/manager/employeeService.js';

// SVG Icons
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

// Format Tiền tệ
const moneyFormat = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// Hàm khởi tạo form trống
const initialFormState = {
  code: '',
  fullName: '',
  phone: '',
  email: '',
  employmentType: 'FULL_TIME',
  hourlyRate: 25000,
  maxHoursPerWeek: 40,
  positions: [],
  skills: [],
};

const ITEMS_PER_PAGE = 10;

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [successNotice, setSuccessNotice] = useState(null); // State chứa thông báo tài khoản
  
  // Trạng thái Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getEmployees();
      setEmployees(res.employees);
      setPositionsList(res.positions);
      setSkillsList(res.skills);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Xử lý khi gõ tìm kiếm (reset về trang 1)
  function handleSearchChange(e) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  // Mở form thêm mới
  function handleAdd() {
    setEditingId(null);
    setFormData(initialFormState);
    setFormError(null);
    setIsModalOpen(true);
  }

  // Mở form chỉnh sửa
  function handleEdit(emp) {
    setEditingId(emp.id);
    setFormData({
      code: emp.code,
      fullName: emp.fullName,
      phone: emp.phone,
      email: emp.email,
      employmentType: emp.employmentType,
      hourlyRate: emp.hourlyRate,
      maxHoursPerWeek: emp.maxHoursPerWeek,
      positions: [...emp.positions],
      skills: [...emp.skills],
    });
    setFormError(null);
    setIsModalOpen(true);
  }

  // Xử lý Vô hiệu hóa (Deactivate)
  async function handleDeactivate(id, name) {
    if (!window.confirm(`Bạn có chắc muốn vô hiệu hóa tài khoản của ${name}? Lịch sử làm việc vẫn sẽ được giữ lại.`)) return;
    try {
      const updated = await deactivateEmployee(id);
      setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setSuccessNotice(`Đã vô hiệu hóa tài khoản của ${name}.`);
    } catch (err) {
      alert(err.message);
    }
  }

  // Xử lý Lưu Form
  async function handleSave(e) {
    e.preventDefault();
    if (!formData.code || !formData.fullName) {
      setFormError('Vui lòng nhập mã và họ tên nhân viên.');
      return;
    }
    
    setSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        const updated = await updateEmployee(editingId, formData);
        setEmployees((prev) => prev.map((e) => (e.id === editingId ? updated : e)));
        setSuccessNotice(`Đã cập nhật hồ sơ của ${updated.fullName}.`);
      } else {
        const added = await createEmployee(formData);
        setEmployees([added, ...employees]);
        setCurrentPage(1); // Chuyển về trang đầu để thấy nhân viên mới
        // Hiển thị thông báo chứa tài khoản và mật khẩu mặc định
        setSuccessNotice(
          `Đã tạo nhân viên ${added.fullName}. Hệ thống tự cấp Tài khoản: ${added.username} — Mật khẩu mặc định: ${added.password}`
        );
      }
      setIsModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Toggle chức vụ
  function togglePosition(posName) {
    setFormData((prev) => {
      const isSelected = prev.positions.includes(posName);
      return {
        ...prev,
        positions: isSelected ? prev.positions.filter((p) => p !== posName) : [...prev.positions, posName],
      };
    });
  }

  // Set skill
  function setSkillLevel(skillName, level) {
    setFormData((prev) => {
      const existing = prev.skills.filter((s) => s.name !== skillName);
      if (level > 0) {
        existing.push({ name: skillName, level });
      }
      return { ...prev, skills: existing };
    });
  }

  // Lọc dữ liệu tìm kiếm
  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.code.toLowerCase().includes(search.toLowerCase())
  );

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployees = filteredEmployees.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className="p-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Nhân sự</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">Quản lý nhân viên</h1>
          <p className="mt-1 text-sm text-muted">Quản lý hồ sơ, vị trí, kỹ năng và mức lương của nhân viên cửa hàng.</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 h-11 cursor-pointer rounded-xl bg-ink px-5 text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white"
        >
          <PlusIcon /> Thêm nhân viên
        </button>
      </div>

      {/* Thanh thông báo hệ thống tự tạo tài khoản */}
      {successNotice && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-matcha/30 bg-matcha/10 px-4 py-3 text-sm font-medium text-matcha animate-in fade-in slide-in-from-top-2">
          <span>{successNotice}</span>
          <button onClick={() => setSuccessNotice(null)} className="text-matcha hover:opacity-75 text-lg">&times;</button>
        </div>
      )}

      {/* Thanh tìm kiếm */}
      <div className="mb-6 flex max-w-md items-center gap-2 rounded-xl border-[1.5px] border-line bg-white px-3 h-11 focus-within:border-amber focus-within:shadow-[0_0_0_4px_rgba(217,107,39,0.16)] transition-all">
        <SearchIcon />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc mã nhân viên..."
          value={search}
          onChange={handleSearchChange}
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_8px_24px_rgba(24,20,17,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-line bg-crema text-left text-xs font-medium text-muted">
                <th className="px-5 py-3">Mã NV</th>
                <th className="px-5 py-3">Họ và tên</th>
                <th className="px-5 py-3">Loại hợp đồng</th>
                <th className="px-5 py-3">Vị trí đảm nhận</th>
                <th className="px-5 py-3 text-right">Lương / giờ</th>
                <th className="px-5 py-3 text-center">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-muted">Đang tải dữ liệu...</td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-muted">Không tìm thấy nhân viên nào.</td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => (
                  <tr key={emp.id} className="border-b border-line last:border-b-0 hover:bg-crema/50 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-ink">{emp.code}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-ink">{emp.fullName}</p>
                      <p className="text-xs text-muted mt-0.5">{emp.phone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-ink">{emp.employmentType === 'FULL_TIME' ? 'Toàn thời gian' : 'Bán thời gian'}</span>
                      <span className="block text-xs text-muted mt-0.5">Tối đa {emp.maxHoursPerWeek}h/tuần</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {emp.positions.length > 0 ? emp.positions.map(p => (
                          <span key={p} className="rounded-md bg-white border border-line px-2 py-0.5 text-[11px] text-ink">{p}</span>
                        )) : <span className="text-xs text-muted">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-ink">{moneyFormat.format(emp.hourlyRate)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                        emp.status === 'ACTIVE' ? 'bg-matcha/15 text-matcha' : 'bg-line text-muted'
                      }`}>
                        {emp.status === 'ACTIVE' ? 'Đang làm' : 'Đã nghỉ'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => handleEdit(emp)} className="text-xs font-semibold text-ink hover:text-amber">Sửa</button>
                        {emp.status === 'ACTIVE' && (
                          <button onClick={() => handleDeactivate(emp.id, emp.fullName)} className="text-xs font-semibold text-danger hover:underline">Vô hiệu hóa</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh phân trang */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line bg-white px-5 py-3">
            <span className="text-xs text-muted">
              Hiển thị <span className="font-semibold text-ink">{startIndex + 1}</span> - <span className="font-semibold text-ink">{Math.min(startIndex + ITEMS_PER_PAGE, filteredEmployees.length)}</span> trong số <span className="font-semibold text-ink">{filteredEmployees.length}</span> nhân viên
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="flex items-center justify-center h-8 px-3 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-crema transition-colors"
              >
                Trước
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex items-center justify-center h-8 min-w-[32px] rounded-lg text-xs font-medium transition-colors ${
                      currentPage === page 
                        ? 'bg-ink text-white border border-ink shadow-sm' 
                        : 'bg-white border border-line text-ink hover:bg-crema'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex items-center justify-center h-8 px-3 rounded-lg border border-line text-xs font-medium text-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-crema transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-sm">
          <div className="w-full max-w-md h-full bg-paper shadow-2xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-white">
              <h2 className="font-display text-xl font-semibold text-ink">
                {editingId ? 'Sửa hồ sơ nhân viên' : 'Thêm nhân viên mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-2xl text-muted hover:text-danger">&times;</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 [scrollbar-width:thin]">
              <form id="empForm" onSubmit={handleSave} className="flex flex-col gap-6">
                
                {/* Thông tin cá nhân */}
                <div>
                  <h3 className="text-sm font-semibold text-ink mb-3 pb-1 border-b border-line border-dashed">Thông tin cá nhân</h3>
                  <div className="grid gap-3">
                    <label className="text-[13px] font-medium text-ink">
                      Mã NV <span className="text-danger">*</span>
                      <input required type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border border-line focus:border-amber focus:outline-none" />
                    </label>
                    <label className="text-[13px] font-medium text-ink">
                      Họ và tên <span className="text-danger">*</span>
                      <input required type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border border-line focus:border-amber focus:outline-none" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-[13px] font-medium text-ink">
                        Số điện thoại
                        <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border border-line focus:border-amber focus:outline-none" />
                      </label>
                      <label className="text-[13px] font-medium text-ink">
                        Email
                        <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border border-line focus:border-amber focus:outline-none" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Hợp đồng & Lương */}
                <div>
                  <h3 className="text-sm font-semibold text-ink mb-3 pb-1 border-b border-line border-dashed">Hợp đồng & Lương</h3>
                  <div className="grid gap-3">
                    <label className="text-[13px] font-medium text-ink">
                      Loại hợp đồng
                      <select value={formData.employmentType} onChange={(e) => setFormData({...formData, employmentType: e.target.value})} className="mt-1 w-full h-10 px-3 rounded-lg border border-line bg-white focus:border-amber focus:outline-none">
                        <option value="FULL_TIME">Toàn thời gian</option>
                        <option value="PART_TIME">Bán thời gian</option>
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="text-[13px] font-medium text-ink">
                        Mức lương / Giờ (VNĐ)
                        <input type="number" step="1000" value={formData.hourlyRate} onChange={(e) => setFormData({...formData, hourlyRate: Number(e.target.value)})} className="mt-1 w-full h-10 px-3 rounded-lg border border-line focus:border-amber focus:outline-none" />
                      </label>
                      <label className="text-[13px] font-medium text-ink">
                        Tối đa giờ / Tuần
                        <input type="number" value={formData.maxHoursPerWeek} onChange={(e) => setFormData({...formData, maxHoursPerWeek: Number(e.target.value)})} className="mt-1 w-full h-10 px-3 rounded-lg border border-line focus:border-amber focus:outline-none" />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Vị trí & Kỹ năng */}
                <div>
                  <h3 className="text-sm font-semibold text-ink mb-3 pb-1 border-b border-line border-dashed">Vị trí & Cấp độ kỹ năng (1-5)</h3>
                  <div className="mb-4">
                    <span className="block text-[13px] text-muted mb-2">Vị trí đảm nhận:</span>
                    <div className="flex flex-wrap gap-2">
                      {positionsList.map(pos => {
                        const isSelected = formData.positions.includes(pos);
                        return (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => togglePosition(pos)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${isSelected ? 'border-amber bg-amber/10 text-amber' : 'border-line bg-white text-muted hover:bg-crema'}`}
                          >
                            {pos}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="block text-[13px] text-muted mb-2">Đánh giá kỹ năng:</span>
                    <div className="grid gap-2">
                      {skillsList.map(skill => {
                        const currentLevel = formData.skills.find(s => s.name === skill)?.level || 0;
                        return (
                          <div key={skill} className="flex items-center justify-between bg-crema/50 border border-line rounded-lg px-3 py-2">
                            <span className="text-xs font-medium text-ink">{skill}</span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(lv => (
                                <button
                                  key={lv}
                                  type="button"
                                  onClick={() => setSkillLevel(skill, lv === currentLevel ? 0 : lv)}
                                  className={`w-6 h-6 rounded-md text-[10px] font-bold transition-colors ${lv <= currentLevel ? 'bg-amber text-white' : 'bg-white border border-line text-muted hover:border-amber'}`}
                                >
                                  {lv}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-muted italic">* Chọn lại cấp độ đang sáng để gỡ bỏ kỹ năng.</p>
                  </div>
                </div>

                {formError && (
                  <p className="p-3 text-[13px] font-medium text-danger bg-danger/10 border border-danger/20 rounded-lg">
                    {formError}
                  </p>
                )}
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-line bg-white flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-ink border border-line hover:bg-crema">
                Hủy
              </button>
              <button type="submit" form="empForm" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-ink hover:bg-amber disabled:opacity-50 transition-colors">
                {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}