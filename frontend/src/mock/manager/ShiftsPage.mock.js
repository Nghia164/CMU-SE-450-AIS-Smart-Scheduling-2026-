// Dữ liệu mẫu cho trang Quản lý ca làm (ShiftsPage)
// 30 bản ghi với các ca làm thông dụng trong ngành F&B

// Danh sách tên ca làm thông dụng trong F&B
const SHIFT_NAMES = [
  'Sáng', 'Chiều', 'Tối', 'Đêm', 'Sáng sớm', 'Chiều dài', 
  'Ca 1', 'Ca 2', 'Ca 3', 'Ca 4', 'Ca 5', 'Ca 6',
  'Breakfast', 'Lunch', 'Dinner', 'Night', 'Early Morning', 'Late Night',
  'Ca trưa', 'Ca soirée', 'Weekend Morning', 'Weekend Evening'
];

// Danh sách vị trí trong F&B
const POSITIONS = [
  'Barista', 'Phục vụ', 'Thu ngân', 'Bếp', 'Bếp 정도', 'Quầy bar',
  'Đầu bếp', 'Phụ bếp', 'Người dọn dẹp', 'Quản lý ca', 'Trọng tài'
];

// Danh sách kỹ năng trong F&B
const SKILLS = [
  'Chế biến cà phê', 'Làm bánh', 'Giao hàng', 'Thu ngân', 
  'Chăm sóc khách hàng', 'Làm sạch', 'Quản lý hàng tồn kho',
  'Chế biến đồ ăn', 'Làm bánh mì', 'Làm salad', 'Làm smoothie'
];

// Tạo thời gian ngẫu nhiên trong ngày
function getRandomTime(baseHour, baseMinute = 0) {
  const hourVariation = Math.floor(Math.random() * 2) - 1; // -1, 0, or 1
  const minuteVariation = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
  let hour = baseHour + hourVariation;
  let minute = baseMinute + minuteVariation;
  
  // Đảm bảo giờ nằm trong khoảng hợp lý
  if (hour < 0) hour = 0;
  if (hour > 23) hour = 23;
  if (minute < 0) minute = 0;
  if (minute > 59) minute = 59;
  
  return { hour, minute };
}

// Tạo ngày ngẫu nhiên trong tuần
function getRandomDate(daysFromToday = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday + Math.floor(Math.random() * 7));
  return date;
}

// Định dạng thời gian thành chuỗi HH:MM
function formatTime(hour, minute) {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// Tạo dữ liệu mẫu cho shifts và shift_requirements
export const mockShiftsData = Array.from({ length: 30 }, (_, index) => {
  const shiftId = index + 1;
  const baseDate = getRandomDate(index % 7); // Phân tán trong tuần
  
  // Xác định loại ca dựa trên giờ bắt đầu
  const shiftTypes = [
    { name: 'Sáng', startHour: 6, endHour: 14 },
    { name: 'Chiều', startHour: 14, endHour: 22 },
    { name: 'Tối', startHour: 22, endHour: 6 },
    { name: 'Đêm', startHour: 0, endHour: 8 },
    { name: 'Sáng sớm', startHour: 4, endHour: 12 },
    { name: 'Chiều dài', startHour: 11, endHour: 19 }
  ];
  
  const shiftType = shiftTypes[index % shiftTypes.length];
  const { hour: startHour, minute: startMinute } = getRandomTime(shiftType.startHour);
  const { hour: endHour, minute: endMinute } = getRandomTime(shiftType.endHour);
  
  // Đảm bảo end_time > start_time (đặc biệt cho ca qua đêm)
  let startAt = new Date(baseDate);
  startAt.setHours(startHour, startMinute, 0, 0);
  
  let endAt = new Date(baseDate);
  endAt.setHours(endHour, endMinute, 0, 0);
  
  // Nếu ca kết thúc trước khi bắt đầu (qua đêm), cộng 1 ngày
  if ((endHour < startHour) || (endHour === startHour && endMinute < startMinute)) {
    endAt.setDate(endAt.getDate() + 1);
  }
  
  // Tạo yêu cầu vị trí và kỹ năng cho ca
  const requirements = [];
  const numRequirements = Math.floor(Math.random() * 3) + 1; // 1-3 yêu cầu mỗi ca
  
  for (let i = 0; i < numRequirements; i++) {
    const positionIndex = Math.floor(Math.random() * POSITIONS.length);
    const skillIndex = Math.floor(Math.random() * SKILLS.length);
    
    requirements.push({
      id: (shiftId * 10) + i + 1,
      shiftId: shiftId,
      positionId: positionIndex + 1,
      positionName: POSITIONS[positionIndex],
      skillId: skillIndex + 1,
      skillName: SKILLS[skillIndex],
      minimumSkillLevel: Math.floor(Math.random() * 4) + 2, // 2-5
      requiredHeadcount: Math.floor(Math.random() * 3) + 1, // 1-3 người
      note: `Yêu cầu ${POSITIONS[positionIndex]} với kỹ năng ${SKILLS[skillIndex]}`
    });
  }
  
  return {
    id: shiftId,
    shiftName: `${shiftType.name} ${index + 1}`,
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    priority: ['LOW', 'NORMAL', 'HIGH'][Math.floor(Math.random() * 3)],
    status: ['ACTIVE', 'CANCELLED'][Math.floor(Math.random() * 4) === 0 ? 1 : 0],
    note: `Ca làm ${shiftType.name.toLowerCase()} trong ngày ${baseDate.getDate()}/${baseDate.getMonth() + 1}`,
    createdBy: Math.floor(Math.random() * 3) + 1, // 1-3 (ADMIN, MANAGER, STAFF)
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(), //Trong 30 ngày qua
    updatedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(), //Trong 7 ngày qua
    requirements: requirements
  };
});

// Hàm helper để lấy danh sách shifts đơn giản (để sử dụng trong service)
export const getMockShifts = () => {
  return mockShiftsData.map(shift => ({
    id: shift.id,
    shiftName: shift.shiftName,
    startAt: shift.startAt,
    endAt: shift.endAt,
    priority: shift.priority,
    status: shift.status,
    note: shift.note,
    createdBy: shift.createdBy,
    createdAt: shift.createdAt,
    updatedAt: shift.updatedAt
  }));
};

export default mockShiftsData;