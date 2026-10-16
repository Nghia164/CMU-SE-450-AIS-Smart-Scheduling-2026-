// ============================================================
// SERVICE — Task 3.1 AccountsPage (Quản lý tài khoản)
// Giả lập API quản lý tài khoản (bảng dbo.users).
// QUAN TRỌNG: Hệ thống KHÔNG có hàm xóa tài khoản (delete) — chỉ cho phép
// vô hiệu hóa (INACTIVE) / khóa (LOCKED) / kích hoạt lại (ACTIVE) để giữ
// nguyên lịch sử chấm công, bảng công theo yêu cầu nghiệp vụ.
// ============================================================

import { accounts as initialAccounts } from '../../mock/admin/AccountsPage.mock.js';

let store = structuredClone(initialAccounts);

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VALID_STATUSES = ['ACTIVE', 'INACTIVE', 'LOCKED'];
const VALID_ROLES = ['ADMIN', 'MANAGER', 'STAFF'];

// Sinh 6 ký tự ngẫu nhiên cho mật khẩu tạm (bỏ các ký tự dễ gây nhầm lẫn)
const PWD_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
function randomToken(length = 6) {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += PWD_CHARS[Math.floor(Math.random() * PWD_CHARS.length)];
  }
  return out;
}

// Danh sách tài khoản — hỗ trợ lọc theo vai trò, trạng thái và từ khóa tìm kiếm
export async function listAccounts({ role = 'ALL', status = 'ALL', search = '' } = {}) {
  await delay(350);
  let data = structuredClone(store);
  if (role && role !== 'ALL') data = data.filter((a) => a.role === role);
  if (status && status !== 'ALL') data = data.filter((a) => a.status === status);
  const kw = (search || '').trim().toLowerCase();
  if (kw) {
    data = data.filter(
      (a) =>
        a.fullName.toLowerCase().includes(kw) ||
        a.username.toLowerCase().includes(kw) ||
        a.email.toLowerCase().includes(kw)
    );
  }
  return data.sort((a, b) => a.id - b.id);
}

// Đổi trạng thái tài khoản — CHỈ luân chuyển giữa ACTIVE / INACTIVE / LOCKED.
// Không bao giờ xóa bản ghi: mọi thao tác "gỡ khỏi hệ thống" đều là vô hiệu hóa.
export async function setAccountStatus(id, status) {
  await delay(300);
  if (!VALID_STATUSES.includes(status)) {
    throw new Error('Trạng thái tài khoản không hợp lệ.');
  }
  const account = store.find((a) => a.id === id);
  if (!account) throw new Error('Không tìm thấy tài khoản trong hệ thống.');
  account.status = status;
  return structuredClone(account);
}

// Đặt lại mật khẩu — trả về mật khẩu tạm ngẫu nhiên 'Tmp@xxxxxx'
export async function resetPassword(id) {
  await delay(300);
  const account = store.find((a) => a.id === id);
  if (!account) throw new Error('Không tìm thấy tài khoản trong hệ thống.');
  const tempPassword = `Tmp@${randomToken(6)}`;
  return { id: account.id, username: account.username, tempPassword };
}

// Tạo tài khoản mới — mật khẩu mặc định 'Smart@123'
export async function createAccount({ fullName, email, role, username }) {
  await delay(400);
  if (!fullName || !String(fullName).trim()) throw new Error('Vui lòng nhập họ và tên.');
  if (!email || !String(email).trim()) throw new Error('Vui lòng nhập địa chỉ email.');
  if (!username || !String(username).trim()) throw new Error('Vui lòng nhập tên đăng nhập.');
  if (!VALID_ROLES.includes(role)) throw new Error('Vai trò tài khoản không hợp lệ.');

  const uname = String(username).trim().toLowerCase();
  const mail = String(email).trim().toLowerCase();

  if (store.some((a) => a.username.toLowerCase() === uname)) {
    throw new Error(`Tên đăng nhập "${uname}" đã tồn tại, vui lòng chọn tên khác.`);
  }
  if (store.some((a) => a.email.toLowerCase() === mail)) {
    throw new Error(`Email "${mail}" đã được sử dụng bởi tài khoản khác.`);
  }

  const newAccount = {
    id: Math.max(...store.map((a) => a.id), 0) + 1,
    username: uname,
    email: mail,
    fullName: String(fullName).trim(),
    role,
    status: 'ACTIVE',
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    note: 'Tài khoản được tạo bởi quản trị viên.',
    password: 'Smart@123', // mật khẩu mặc định, hiển thị một lần cho quản trị viên
  };

  store.unshift(newAccount);
  return structuredClone(newAccount);
}

export default { listAccounts, setAccountStatus, resetPassword, createAccount };
