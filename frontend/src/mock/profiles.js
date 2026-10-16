// File này chứa dữ liệu hồ sơ giả lập, cấu trúc theo các bảng users, employees, employee_positions và employee_skills trong database.
export const mockProfiles = {
  1: {
    accountStatus: 'ACTIVE',
    lastLoginAt: '2026-10-13T08:30:00',
    employee: null,
  },
  2: {
    accountStatus: 'ACTIVE',
    lastLoginAt: '2026-10-14T07:55:00',
    employee: {
      employeeCode: 'NV-002',
      fullName: 'Quản lý cửa hàng',
      phone: '0901234567',
      address: '12 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
      dateOfBirth: '1990-05-14',
      hireDate: '2024-01-10',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      positions: [{ name: 'Manager', isPrimary: true }],
      skills: [
        { name: 'Customer Service', level: 5 },
        { name: 'POS', level: 4 },
      ],
    },
  },
  3: {
    accountStatus: 'ACTIVE',
    lastLoginAt: '2026-10-14T09:10:00',
    employee: {
      employeeCode: 'NV-003',
      fullName: 'Nhân viên mẫu',
      phone: '0912345678',
      address: '45 Lê Duẩn, Thanh Khê, Đà Nẵng',
      dateOfBirth: '2002-09-21',
      hireDate: '2025-03-01',
      employmentType: 'PART_TIME',
      status: 'ACTIVE',
      positions: [
        { name: 'Barista', isPrimary: true },
        { name: 'Cashier', isPrimary: false },
      ],
      skills: [
        { name: 'Coffee Making', level: 4 },
        { name: 'POS', level: 3 },
      ],
    },
  },
};