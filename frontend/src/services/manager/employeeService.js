import { mockEmployees, POSITIONS, SKILLS } from '../../mock/manager/EmployeesPage.mock.js';

let store = [...mockEmployees];

// Hàm phụ trợ: Chuyển tên tiếng Việt có dấu thành viết liền không dấu (VD: Nguyễn Văn An -> nguyenvanan)
function generateUsername(fullName, code) {
  const namePart = fullName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/\s+/g, '');
    
  return `${namePart}_${code.toLowerCase()}`;
}

// Lấy danh sách nhân viên
export async function getEmployees() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return { employees: structuredClone(store), positions: POSITIONS, skills: SKILLS };
}

// Thêm nhân viên mới (Tự động cấp tài khoản)
export async function createEmployee(data) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  // Kiểm tra trùng mã nhân viên
  if (store.some((e) => e.code.toLowerCase() === data.code.toLowerCase())) {
    throw new Error('Mã nhân viên đã tồn tại trong hệ thống.');
  }

  // Tự động sinh tài khoản và mật khẩu mặc định
  const username = generateUsername(data.fullName, data.code);
  const defaultPassword = 'Smart@123';

  const newEmp = {
    ...data,
    id: Math.max(...store.map((e) => e.id), 0) + 1,
    status: 'ACTIVE',
    username,         // Lưu tài khoản vào hồ sơ
    password: defaultPassword, // Lưu mật khẩu mặc định
  };
  
  store.unshift(newEmp);
  return structuredClone(newEmp);
}

// Cập nhật nhân viên
export async function updateEmployee(id, data) {
  await new Promise((resolve) => setTimeout(resolve, 400));
  
  const idx = store.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Không tìm thấy nhân viên.');

  // Kiểm tra trùng mã (nếu có đổi mã)
  if (data.code !== store[idx].code && store.some((e) => e.code.toLowerCase() === data.code.toLowerCase())) {
    throw new Error('Mã nhân viên đã tồn tại.');
  }

  store[idx] = { ...store[idx], ...data };
  return structuredClone(store[idx]);
}

// Vô hiệu hóa nhân viên (Không xóa)
export async function deactivateEmployee(id) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const idx = store.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Không tìm thấy nhân viên.');

  store[idx].status = 'INACTIVE';
  return structuredClone(store[idx]);
}