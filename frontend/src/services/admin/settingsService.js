// ============================================================
// SERVICE — Task 3.4 SettingsPage (Cài đặt hệ thống)
// Giả lập API bảng dbo.system_settings: đọc, cập nhật (có validate
// theo kiểu dữ liệu), khôi phục mặc định + ghi nhật ký thay đổi.
// ============================================================

import { settings as initialSettings, defaultValues, changeLog as initialChangeLog } from '../../mock/admin/SettingsPage.mock.js';

let settingsStore = structuredClone(initialSettings);
let changeLogStore = structuredClone(initialChangeLog);
let nextLogId = Math.max(...initialChangeLog.map((l) => l.id), 0) + 1;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Đọc toàn bộ cấu hình + nhật ký thay đổi
export async function getSettings() {
  await delay(350);
  return {
    settings: structuredClone(settingsStore),
    changeLog: structuredClone(changeLogStore),
  };
}

// Ghi nhật ký thay đổi và cập nhật setting trong store
function applyChange(setting, newValue) {
  const oldValue = setting.value;
  setting.value = newValue;

  const changeEntry = {
    id: nextLogId,
    actor: 'Nguyễn Văn An', // phiên đăng nhập quản trị hiện tại
    key: setting.key,
    oldValue,
    newValue,
    at: new Date().toISOString(),
  };
  nextLogId += 1;
  changeLogStore.unshift(changeEntry);

  return { setting: structuredClone(setting), changeEntry: structuredClone(changeEntry) };
}

// Cập nhật một cấu hình — validate theo type:
//   number: phải là số và nằm trong khoảng [min, max] nếu được khai báo
//   select: phải nằm trong danh sách options
//   toggle: chuẩn hóa về chuỗi 'true' / 'false'
export async function updateSetting(key, value) {
  await delay(500);
  const setting = settingsStore.find((s) => s.key === key);
  if (!setting) throw new Error('Không tìm thấy cấu hình trong hệ thống.');

  let newValue = String(value ?? '').trim();

  if (setting.type === 'number') {
    const num = Number(newValue);
    if (newValue === '' || Number.isNaN(num)) {
      throw new Error('Giá trị nhập vào phải là một con số.');
    }
    if (setting.min != null && num < setting.min) {
      throw new Error(`Giá trị phải từ ${setting.min} đến ${setting.max}.`);
    }
    if (setting.max != null && num > setting.max) {
      throw new Error(`Giá trị phải từ ${setting.min} đến ${setting.max}.`);
    }
    newValue = String(num);
  }

  if (setting.type === 'select' && !setting.options.includes(newValue)) {
    throw new Error('Giá trị không nằm trong danh sách cho phép.');
  }

  if (setting.type === 'toggle') {
    newValue = value === true || value === 'true' ? 'true' : 'false';
  }

  if (newValue === setting.value) {
    return { setting: structuredClone(setting), changeEntry: null };
  }

  return applyChange(setting, newValue);
}

// Khôi phục giá trị mặc định cho một cấu hình
export async function resetToDefault(key) {
  await delay(400);
  const setting = settingsStore.find((s) => s.key === key);
  if (!setting) throw new Error('Không tìm thấy cấu hình trong hệ thống.');
  if (defaultValues[key] == null) throw new Error('Cấu hình này chưa có giá trị mặc định.');

  return applyChange(setting, String(defaultValues[key]));
}

export default { getSettings, updateSetting, resetToDefault };
