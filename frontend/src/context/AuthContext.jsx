// File này quản lý trạng thái đăng nhập toàn cục và lưu phiên vào localStorage để giữ đăng nhập khi tải lại trang.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { mockUsers } from '../mock/users.js';

// Khóa lưu phiên trong localStorage.
const STORAGE_KEY = 'ss_auth_user';

const AuthContext = createContext(null);

// Hàm này đọc người dùng đã lưu khi ứng dụng khởi động; nếu không có hoặc dữ liệu hỏng thì trả về null.
function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Hàm này ghi người dùng vào localStorage, hoặc xóa khi người dùng là null; bọc try/catch vì trình duyệt có thể chặn localStorage.
function writeStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Bỏ qua lỗi; phiên vẫn hoạt động trong lần tải hiện tại.
  }
}

// Component này cung cấp user, login và logout cho toàn bộ ứng dụng, đồng thời giữ phiên sau khi tải lại trang.
export function AuthProvider({ children }) {
  // Đọc phiên đã lưu ngay khi khởi tạo để RequireAuth không chuyển về /login khi vừa tải lại trang.
  const [user, setUser] = useState(readStoredUser);

  // Mỗi khi user thay đổi (đăng nhập hoặc đăng xuất), đồng bộ trạng thái đó xuống localStorage.
  useEffect(() => {
    writeStoredUser(user);
  }, [user]);

  // Hàm này kiểm tra tài khoản mock và lưu người dùng hợp lệ (không kèm mật khẩu) vào trạng thái.
  const login = useCallback(async (identifier, password) => {
    // Giả lập độ trễ mạng. Khi có backend, thay bằng gọi API Laravel.
    await new Promise((resolve) => setTimeout(resolve, 300));

    const found = mockUsers.find(
      (u) => (u.username === identifier || u.email === identifier) && u.password === password,
    );

    if (!found) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng.');
    }

    const safeUser = {
      id: found.id,
      username: found.username,
      email: found.email,
      fullName: found.fullName,
      role: found.role,
    };
    setUser(safeUser);
    return safeUser;
  }, []);

  // Hàm này xóa người dùng khỏi trạng thái, từ đó cũng xóa khỏi localStorage.
  const logout = useCallback(() => setUser(null), []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// Hàm này lấy thông tin xác thực trong component con; báo lỗi nếu dùng ngoài AuthProvider.
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return ctx;
}