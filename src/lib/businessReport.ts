export function generateBusinessFinding(
  force: string,
  count: number,
  total: number
) {
  const percentage = (
    (count / total) * 100
  ).toFixed(1);

  switch (force) {

    case "Thiếu Niềm Tin":
      return {
        title: "Rào cản lớn nhất là niềm tin",
        finding:
          `${percentage}% tín hiệu liên quan tới việc tìm kiếm review hoặc xác nhận uy tín nhà cung cấp.`,
      };

    case "Lo Lắng Độ Bền":
      return {
        title: "Khách hàng lo ngại độ bền",
        finding:
          `${percentage}% tín hiệu liên quan tới mốc, ngấm nước hoặc tuổi thọ sản phẩm.`,
      };

    case "Mơ Hồ Về Giá":
      return {
        title: "Thiếu minh bạch về giá",
        finding:
          `${percentage}% tín hiệu liên quan tới báo giá và chi phí.`,
      };

    default:
      return null;
  }
}