// Service cho trang Quản lý ca làm (ShiftsPage)
// Giả lập API call với setTimeout để mô phỏng độ trễ mạng
import mockShiftsData from '../../mock/manager/ShiftsPage.mock.js';

/**
 * Lấy danh sách tất cả các ca làm với yêu cầu
 * @returns {Promise<Array>} Promise resolves với danh sách shifts
 */
export const getAllShifts = () => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 800ms
    setTimeout(() => {
      resolve(mockShiftsData);
    }, 800);
  });
};

/**
 * Lấy danh sách shifts đơn giản (chỉ thông tin cơ bản)
 * @returns {Promise<Array>} Promise resolves với danh sách shifts đơn giản
 */
export const getShiftsList = () => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 600ms
    setTimeout(() => {
      const shiftsList = mockShiftsData.map(shift => ({
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
      resolve(shiftsList);
    }, 600);
  });
};

/**
 * Thêm ca làm mới
 * @param {Object} shiftData - Dữ liệu ca làm mới
 * @returns {Promise<Object>} Promise resolves với ca làm đã tạo
 */
export const createShift = (shiftData) => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 1000ms
    setTimeout(() => {
      const newShift = {
        id: Date.now(), // ID tạm thời
        ...shiftData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      // Trong thực tế, sẽ thêm vào database
      resolve(newShift);
    }, 1000);
  });
};

/**
 * Cập nhật ca làm
 * @param {number} shiftId - ID của ca cần cập nhật
 * @param {Object} shiftData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Promise resolves với ca làm đã cập nhật
 */
export const updateShift = (shiftId, shiftData) => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 900ms
    setTimeout(() => {
      const updatedShift = {
        id: shiftId,
        ...shiftData,
        updatedAt: new Date().toISOString()
      };
      // Trong thực tế, sẽ cập nhật trong database
      resolve(updatedShift);
    }, 900);
  });
};

/**
 * Xóa ca làm (thực tế là đổi trạng thái thành CANCELLED)
 * @param {number} shiftId - ID của ca cần xóa
 * @returns {Promise<boolean>} Promise resolves với true nếu thành công
 */
export const deleteShift = (shiftId) => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 700ms
    setTimeout(() => {
      // Trong thực tế, sẽ cập nhật status thành 'CANCELLED' trong database
      resolve(true);
    }, 700);
  });
};

/**
 * Lấy chi tiết ca làm bao gồm yêu cầu
 * @param {number} shiftId - ID của ca cần lấy chi tiết
 * @returns {Promise<Object>} Promise resolves với chi tiết ca làm
 */
export const getShiftDetail = (shiftId) => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 700ms
    setTimeout(() => {
      const shift = mockShiftsData.find(s => s.id === shiftId);
      if (shift) {
        resolve(shift);
      } else {
        resolve(null);
      }
    }, 700);
  });
};

/**
 * Lấy danh sách yêu cầu cho một ca cụ thể
 * @param {number} shiftId - ID của ca
 * @returns {Promise<Array>} Promise resolves với danh sách yêu cầu
 */
export const getShiftRequirements = (shiftId) => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 500ms
    setTimeout(() => {
      const shift = mockShiftsData.find(s => s.id === shiftId);
      if (shift) {
        resolve(shift.requirements || []);
      } else {
        resolve([]);
      }
    }, 500);
  });
};

/**
 * Thêm yêu cầu cho ca làm
 * @param {number} shiftId - ID của ca
 * @param {Object} requirementData - Dữ liệu yêu cầu mới
 * @returns {Promise<Object>} Promise resolves với yêu cầu đã tạo
 */
export const createShiftRequirement = (shiftId, requirementData) => {
  return new Promise((resolve) => {
    // Giả lập độ trễ mạng 800ms
    setTimeout(() => {
      const newRequirement = {
        id: Date.now(), // ID tạm thời
        shiftId: shiftId,
        ...requirementData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      resolve(newRequirement);
    }, 800);
  });
};

export default {
  getAllShifts,
  getShiftsList,
  createShift,
  updateShift,
  deleteShift,
  getShiftDetail,
  getShiftRequirements,
  createShiftRequirement
};