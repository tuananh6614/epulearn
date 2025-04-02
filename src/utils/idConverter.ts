
/**
 * Tiện ích chuyển đổi ID
 * 
 * Cung cấp các hàm để xử lý chuyển đổi giữa các kiểu ID khác nhau trong ứng dụng
 * Phần này chỉ là mock để thay thế cho các hàm đã xóa
 */

// Chuyển đổi bất kỳ ID nào thành chuỗi
export const toStringId = (id: string | number): string => {
  return String(id);
};

// So sánh hai ID có bằng nhau không (bỏ qua kiểu dữ liệu)
export const idsAreEqual = (id1: string | number | undefined | null, id2: string | number | undefined | null): boolean => {
  if (id1 === undefined || id1 === null || id2 === undefined || id2 === null) {
    return false;
  }
  return String(id1) === String(id2);
};

// Chuyển đổi ID thành định dạng Supabase
export const supabaseId = (id: string | number): string => {
  return String(id);
};

export default {
  toStringId,
  idsAreEqual,
  supabaseId
};
