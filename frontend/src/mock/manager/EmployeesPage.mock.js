// Danh sách các vị trí và kỹ năng chuẩn của F&B Store để dùng trong Form
export const POSITIONS = ['Ca trưởng', 'Barista', 'Thu ngân', 'Phục vụ'];
export const SKILLS = ['Pha chế', 'POS & Thu ngân', 'Chăm sóc khách hàng', 'Quản lý ca'];

// Dữ liệu mẫu 30 nhân viên
export const mockEmployees = [
  {
    id: 1,
    code: 'NV001',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nv@smartscheduling.vn',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    hourlyRate: 45000,
    maxHoursPerWeek: 48,
    positions: ['Ca trưởng', 'Barista'],
    skills: [
      { name: 'Pha chế', level: 4 },
      { name: 'Quản lý ca', level: 5 },
    ],
  },
  {
    id: 2,
    code: 'NV002',
    fullName: 'Trần Thị Bích Ngọc',
    phone: '0912345678',
    email: 'ngoc.ttb@smartscheduling.vn',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    hourlyRate: 45000,
    maxHoursPerWeek: 48,
    positions: ['Ca trưởng'],
    skills: [
      { name: 'Quản lý ca', level: 4 },
      { name: 'Chăm sóc khách hàng', level: 4 },
    ],
  },
  {
    id: 4,
    code: 'NV004',
    fullName: 'Phạm Minh Tuấn',
    phone: '0934567890',
    email: 'tuan.pm@smartscheduling.vn',
    employmentType: 'FULL_TIME',
    status: 'ACTIVE',
    hourlyRate: 35000,
    maxHoursPerWeek: 40,
    positions: ['Barista'],
    skills: [
      { name: 'Pha chế', level: 5 },
    ],
  },
  {
    id: 7,
    code: 'NV007',
    fullName: 'Đặng Ngọc Mai',
    phone: '0967890123',
    email: 'mai.dn@smartscheduling.vn',
    employmentType: 'PART_TIME',
    status: 'ACTIVE',
    hourlyRate: 28000,
    maxHoursPerWeek: 30,
    positions: ['Barista', 'Phục vụ'],
    skills: [
      { name: 'Pha chế', level: 3 },
      { name: 'Chăm sóc khách hàng', level: 4 },
    ],
  },
  {
    id: 13,
    code: 'NV013',
    fullName: 'Mai Phương Thúy',
    phone: '0981234567',
    email: 'thuy.mp@smartscheduling.vn',
    employmentType: 'FULL_TIME',
    status: 'INACTIVE', // Đã nghỉ việc nhưng giữ lịch sử
    hourlyRate: 33000,
    maxHoursPerWeek: 40,
    positions: ['Thu ngân'],
    skills: [
      { name: 'POS & Thu ngân', level: 5 },
    ],
  },
  {
    id: 19,
    code: 'NV019',
    fullName: 'Lương Bích Hữu',
    phone: '0998765432',
    email: 'huu.lb@smartscheduling.vn',
    employmentType: 'PART_TIME',
    status: 'ACTIVE',
    hourlyRate: 24000,
    maxHoursPerWeek: 25,
    positions: ['Phục vụ'],
    skills: [
      { name: 'Chăm sóc khách hàng', level: 3 },
    ],
  },
  // Thêm tự động để đủ mảng khi test UI
].concat(
  Array.from({ length: 24 }).map((_, i) => ({
    id: 20 + i,
    code: `NV0${20 + i}`,
    fullName: `Nhân viên test ${20 + i}`,
    phone: `09000000${20 + i}`,
    email: `test${20 + i}@smartscheduling.vn`,
    employmentType: i % 2 === 0 ? 'PART_TIME' : 'FULL_TIME',
    status: 'ACTIVE',
    hourlyRate: i % 2 === 0 ? 25000 : 35000,
    maxHoursPerWeek: i % 2 === 0 ? 30 : 48,
    positions: ['Phục vụ'],
    skills: [{ name: 'Chăm sóc khách hàng', level: 2 }],
  }))
);