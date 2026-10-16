// Xử lý lỗi trả về từ server
export function extractErrorMessage(err) {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
}