// File này là trang hồ sơ cá nhân: xem thông tin tài khoản và hồ sơ nhân viên, sửa email, số điện thoại, địa chỉ và đổi mật khẩu.
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { NAV_BY_ROLE } from '../components/Sidebar.jsx';
import { mockUsers } from '../mock/users.js';
import { mockProfiles } from '../mock/profiles.js';

// Kiểu dáng dùng chung cho ô nhập liệu.
const INPUT_CLASS =
  'h-11 w-full rounded-xl border-[1.5px] border-line bg-white px-3.5 text-sm text-ink placeholder:text-[#a89f94] focus:border-amber focus:shadow-[0_0_0_4px_rgba(217,107,39,0.16)] focus:outline-none disabled:bg-crema disabled:text-muted';

// Kiểu dáng dùng chung cho nút hành động chính.
const BUTTON_CLASS =
  'h-11 cursor-pointer rounded-xl bg-ink px-5 text-sm font-semibold text-crema transition-colors hover:bg-amber hover:text-white disabled:cursor-not-allowed disabled:opacity-60';

// Biểu thức kiểm tra định dạng email cơ bản.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hàm này kiểm tra số điện thoại: để trống hoặc gồm 9 đến 15 chữ số, cho phép dấu + ở đầu.
function isValidPhone(value) {
  return value === '' || /^\+?\d{9,15}$/.test(value);
}

// Hàm này đổi ngày dạng yyyy-mm-dd thành dd/mm/yyyy để hiển thị.
function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = value.split('-');
  return `${d}/${m}/${y}`;
}

// Hàm này đổi thời điểm đăng nhập cuối thành chuỗi ngày giờ theo chuẩn Việt Nam.
function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('vi-VN');
}

// Hàm này đổi loại nhân viên từ giá trị trong database sang tiếng Việt.
function employmentLabel(type) {
  return { FULL_TIME: 'Toàn thời gian', PART_TIME: 'Bán thời gian' }[type] ?? type;
}

// Component này hiển thị một ô thông tin chỉ đọc gồm nhãn và giá trị.
function ReadonlyField({ label, value }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-muted">{label}</span>
      <span className="flex min-h-11 items-center rounded-xl border border-line bg-crema px-3.5 text-sm text-ink">
        {value || '—'}
      </span>
    </div>
  );
}

// Component này bọc một ô nhập liệu với nhãn và thông báo lỗi bên dưới.
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-ink">{label}</label>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}

// Component này hiển thị một khối card có tiêu đề.
function Card({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-2xl border border-line bg-paper p-6 shadow-[0_8px_24px_rgba(24,20,17,0.06)] ${className}`}
    >
      <h2 className="mb-5 font-display text-lg font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}

// Component này hiển thị thông báo thành công hoặc lỗi của một form.
function Notice({ type, children }) {
  const tone =
    type === 'success'
      ? 'border-matcha/30 bg-matcha/10 text-matcha'
      : 'border-[#f5c2bc] bg-[#fef2f0] text-danger';
  return (
    <p role="status" className={`rounded-xl border px-3.5 py-2.5 text-[13px] font-medium ${tone}`}>
      {children}
    </p>
  );
}

// Component này hiển thị trang hồ sơ cá nhân và xử lý các form chỉnh sửa.
export default function ProfilePage() {
  const { user } = useAuth();
  const account = mockUsers.find((u) => u.id === user.id);
  const profile = mockProfiles[user.id];
  const employee = profile?.employee ?? null;
  const roleLabel = NAV_BY_ROLE[user.role]?.roleLabel ?? user.role;

  const [contact, setContact] = useState({
    email: user.email,
    phone: employee?.phone ?? '',
    address: employee?.address ?? '',
  });
  const [contactErrors, setContactErrors] = useState({});
  const [contactNotice, setContactNotice] = useState(null);
  const [savingContact, setSavingContact] = useState(false);

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordNotice, setPasswordNotice] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Hàm này cập nhật một trường của form liên hệ và xóa lỗi cũ của trường đó.
  function updateContact(field, value) {
    setContact((prev) => ({ ...prev, [field]: value }));
    setContactErrors((prev) => ({ ...prev, [field]: undefined }));
    setContactNotice(null);
  }

  // Hàm này cập nhật một trường của form đổi mật khẩu và xóa lỗi cũ của trường đó.
  function updatePassword(field, value) {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
    setPasswordNotice(null);
  }

  // Hàm này kiểm tra form liên hệ và lưu khi hợp lệ. Hiện chỉ mô phỏng, khi có backend sẽ gọi API cập nhật employees và users.
  async function handleContactSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!EMAIL_PATTERN.test(contact.email.trim())) {
      errors.email = 'Email không hợp lệ.';
    }
    if (employee && !isValidPhone(contact.phone.trim())) {
      errors.phone = 'Số điện thoại gồm 9 đến 15 chữ số.';
    }
    setContactErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingContact(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSavingContact(false);
    setContactNotice({ type: 'success', text: 'Đã lưu thông tin liên hệ.' });
  }

  // Hàm này kiểm tra form đổi mật khẩu theo quy tắc, rồi đổi khi hợp lệ. Mô phỏng: khi có backend Laravel sẽ kiểm tra password_hash và cập nhật lại.
  async function handlePasswordSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!passwords.current) {
      errors.current = 'Vui lòng nhập mật khẩu hiện tại.';
    } else if (passwords.current !== account?.password) {
      errors.current = 'Mật khẩu hiện tại không đúng.';
    }
    if (passwords.next.length < 8) {
      errors.next = 'Mật khẩu mới tối thiểu 8 ký tự.';
    } else if (passwords.next === passwords.current) {
      errors.next = 'Mật khẩu mới phải khác mật khẩu hiện tại.';
    }
    if (passwords.confirm !== passwords.next) {
      errors.confirm = 'Mật khẩu xác nhận không khớp.';
    }
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSavingPassword(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSavingPassword(false);
    setPasswords({ current: '', next: '', confirm: '' });
    setPasswordNotice({ type: 'success', text: 'Đã đổi mật khẩu.' });
  }

  return (
    <section className="p-8">
      <p className="font-mono text-xs uppercase tracking-[0.08em] text-amber">Hồ sơ cá nhân</p>
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
        {employee?.fullName ?? user.fullName}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {roleLabel} • {employee?.employeeCode ?? 'Chưa có mã nhân viên'}
      </p>

      <div className="mt-8 grid max-w-5xl gap-6 xl:grid-cols-2">
        <Card title="Tài khoản">
          <div className="grid gap-4 sm:grid-cols-2">
            <ReadonlyField label="Tên đăng nhập" value={user.username} />
            <ReadonlyField label="Vai trò" value={user.role} />
            <ReadonlyField label="Trạng thái" value={profile?.accountStatus} />
            <ReadonlyField label="Đăng nhập gần nhất" value={formatDateTime(profile?.lastLoginAt)} />
          </div>
        </Card>

        <Card title="Hồ sơ nhân viên">
          {employee ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <ReadonlyField label="Họ và tên" value={employee.fullName} />
              <ReadonlyField label="Mã nhân viên" value={employee.employeeCode} />
              <ReadonlyField label="Ngày sinh" value={formatDate(employee.dateOfBirth)} />
              <ReadonlyField label="Ngày vào làm" value={formatDate(employee.hireDate)} />
              <ReadonlyField label="Loại nhân viên" value={employmentLabel(employee.employmentType)} />
              <ReadonlyField label="Trạng thái" value={employee.status} />
            </div>
          ) : (
            <p className="text-sm text-muted">Tài khoản này chưa có hồ sơ nhân viên.</p>
          )}
        </Card>

        <Card title="Vị trí & kỹ năng">
          {employee ? (
            <div className="flex flex-col gap-5">
              <div>
                <p className="mb-2 text-[12.5px] font-semibold text-muted">Vị trí</p>
                <div className="flex flex-wrap gap-2">
                  {employee.positions.map((p) => (
                    <span
                      key={p.name}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                        p.isPrimary ? 'bg-amber/15 text-amber' : 'bg-crema text-ink'
                      }`}
                    >
                      {p.name}
                      {p.isPrimary && ' • chính'}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[12.5px] font-semibold text-muted">Kỹ năng</p>
                <div className="flex flex-col gap-2">
                  {employee.skills.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between rounded-xl border border-line bg-crema px-3.5 py-2.5 text-sm"
                    >
                      <span className="font-medium text-ink">{s.name}</span>
                      <span className="flex gap-1" aria-label={`Cấp độ ${s.level} trên 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`h-2 w-2 rounded-full ${n <= s.level ? 'bg-amber' : 'bg-line'}`}
                          />
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Tài khoản này chưa có vị trí hoặc kỹ năng.</p>
          )}
        </Card>

        <Card title="Thông tin liên hệ">
          <form onSubmit={handleContactSubmit} noValidate className="flex flex-col gap-4">
            <Field label="Email" error={contactErrors.email}>
              <input
                type="email"
                className={INPUT_CLASS}
                value={contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
              />
            </Field>
            <Field label="Số điện thoại" error={contactErrors.phone}>
              <input
                type="tel"
                className={INPUT_CLASS}
                value={contact.phone}
                disabled={!employee}
                onChange={(e) => updateContact('phone', e.target.value)}
              />
            </Field>
            <Field label="Địa chỉ">
              <input
                type="text"
                className={INPUT_CLASS}
                value={contact.address}
                disabled={!employee}
                onChange={(e) => updateContact('address', e.target.value)}
              />
            </Field>

            {!employee && (
              <p className="text-xs text-muted">Số điện thoại và địa chỉ chỉ có khi tài khoản có hồ sơ nhân viên.</p>
            )}
            {contactNotice && <Notice type={contactNotice.type}>{contactNotice.text}</Notice>}

            <div className="flex justify-end">
              <button type="submit" disabled={savingContact} className={BUTTON_CLASS}>
                {savingContact ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </Card>

        <Card title="Đổi mật khẩu">
          <form onSubmit={handlePasswordSubmit} noValidate className="flex flex-col gap-4">
            <Field label="Mật khẩu hiện tại" error={passwordErrors.current}>
              <input
                type="password"
                autoComplete="current-password"
                className={INPUT_CLASS}
                value={passwords.current}
                onChange={(e) => updatePassword('current', e.target.value)}
              />
            </Field>
            <Field label="Mật khẩu mới" error={passwordErrors.next}>
              <input
                type="password"
                autoComplete="new-password"
                className={INPUT_CLASS}
                value={passwords.next}
                onChange={(e) => updatePassword('next', e.target.value)}
              />
            </Field>
            <Field label="Xác nhận mật khẩu mới" error={passwordErrors.confirm}>
              <input
                type="password"
                autoComplete="new-password"
                className={INPUT_CLASS}
                value={passwords.confirm}
                onChange={(e) => updatePassword('confirm', e.target.value)}
              />
            </Field>

            {passwordNotice && <Notice type={passwordNotice.type}>{passwordNotice.text}</Notice>}

            <div className="flex justify-end">
              <button type="submit" disabled={savingPassword} className={BUTTON_CLASS}>
                {savingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}