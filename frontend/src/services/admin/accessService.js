// ============================================================
// SERVICE — Task 3.2 AccessPage (Phân quyền truy cập theo Role)
// Giả lập API ma trận quyền (role-based access control) +
// ghi nhật ký thay đổi vào audit log.
// ============================================================

import { roles as initialRoles, permissions as initialPermissions, auditLog as initialAuditLog } from '../../mock/admin/AccessPage.mock.js';

let rolesStore = structuredClone(initialRoles);
let permissionsStore = structuredClone(initialPermissions);
let auditStore = structuredClone(initialAuditLog);
let nextAuditId = Math.max(...initialAuditLog.map((l) => l.id), 0) + 1;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const VALID_ROLES = ['ADMIN', 'MANAGER', 'STAFF'];

// Lấy toàn bộ dữ liệu phân quyền: vai trò, ma trận quyền, nhật ký thay đổi
export async function getAccessData() {
  await delay(350);
  return {
    roles: structuredClone(rolesStore),
    permissions: structuredClone(permissionsStore),
    auditLog: structuredClone(auditStore),
  };
}

// Bật / tắt một quyền của một vai trò — cập nhật store và ghi audit log
export async function updatePermission(permissionId, role, granted) {
  await delay(400);
  if (!VALID_ROLES.includes(role)) throw new Error('Vai trò không hợp lệ.');

  const permission = permissionsStore.find((p) => p.id === permissionId);
  if (!permission) throw new Error('Không tìm thấy quyền trong hệ thống.');

  const roleInfo = rolesStore.find((r) => r.id === role);
  const roleName = roleInfo ? roleInfo.name : role;

  permission.grants[role] = Boolean(granted);

  const auditEntry = {
    id: nextAuditId,
    actor: 'Nguyễn Văn An', // phiên đăng nhập quản trị hiện tại
    action: granted
      ? `Cấp quyền ${permission.name} cho ${roleName}`
      : `Gỡ quyền ${permission.name} khỏi ${roleName}`,
    at: new Date().toISOString(),
  };
  auditStore.unshift(auditEntry);

  return {
    permission: structuredClone(permission),
    auditEntry: structuredClone(auditEntry),
  };
}

export default { getAccessData, updatePermission };
