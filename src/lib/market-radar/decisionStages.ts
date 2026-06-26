// Decision Stages — 6 giai đoạn hành trình ra quyết định
// Keyword match theo thứ tự ưu tiên: stage đầu tiên khớp sẽ được chọn

export type DecisionStage =
  | "Trước Khi Mua"
  | "So Sánh"
  | "Sắp Mua"
  | "Sau Khi Mua"
  | "Hối Tiếc"
  | "Giới Thiệu";

export const decisionStageKeywords: Record<DecisionStage, string[]> = {

  // Giai đoạn 1 — Đang tìm hiểu, chưa có ý định cụ thể
  "Trước Khi Mua": [
    "nên chọn",
    "có ai biết",
    "xin tư vấn",
    "nên làm loại nào",
    "loại nào tốt",
    "nên dùng",
    "tư vấn giúp",
    "hỏi về",
    "muốn làm",
    "đang tính",
    "đang định",
    "chuẩn bị làm",
    "sắp làm",
    "có nên",
    "có tốt không",
    "có bền không",
    "dùng được bao lâu",
    "bền không",
    "có đắt không",
    "như thế nào",
    "ý kiến",
    "kinh nghiệm",
    "ai có kinh nghiệm",
    "newbie",
    "lần đầu",
    "chưa biết",
    "không biết chọn",
    "chống ẩm tốt",
    "loại nào chống",
  ],

  // Giai đoạn 2 — Đang so sánh các lựa chọn
  "So Sánh": [
    "so sánh",
    "mdf hay",
    "picomat hay",
    "gỗ tự nhiên hay",
    "loại nào tốt hơn",
    "cái nào tốt hơn",
    "khác nhau như thế nào",
    "hay hơn",
    "so với",
    "hơn không",
    "tốt hơn không",
    "bền hơn không",
    "rẻ hơn không",
    "chọn giữa",
    "hay là",
    "hay dùng",
    "vs",
    "hay nhựa",
    "hay acrylic",
    "hay laminate",
    "nên chọn loại nào",
    "nên mua loại nào",
    "hỏng không hay",
    "tốt không hay",
    "bền hơn mdf",
    "hơn mdf không",
  ],

  // Giai đoạn 3 — Đã quyết định, đang hỏi giá / tìm đơn vị
  "Sắp Mua": [
    "báo giá",
    "xin báo giá",
    "cho xin giá",
    "giá bao nhiêu",
    "bao nhiêu tiền",
    "tốn bao nhiêu",
    "hết bao nhiêu",
    "chi phí",
    "giá làm",
    "giá thi công",
    "đặt làm",
    "liên hệ",
    "inbox",
    "nhắn tin",
    "số điện thoại",
    "địa chỉ",
    "showroom",
    "xưởng",
    "bên nào làm tốt",
    "đơn vị nào",
    "công ty nào",
    "thi công tốt",
    "uy tín không",
    "có ổn không",
    "đáng tin không",
    "sắp ký hợp đồng",
    "đang ký hợp đồng",
    "xin review",
    "ai làm rồi",
    "ai dùng rồi",
  ],

  // Giai đoạn 4 — Đã mua, đang dùng
  "Sau Khi Mua": [
    "đã làm xong",
    "đã nhận",
    "mới bàn giao",
    "đang dùng",
    "nhà mình đang dùng",
    "tủ nhà mình",
    "đã lắp",
    "sau khi lắp",
    "được mấy tháng",
    "được 1 năm",
    "được 2 năm",
    "dùng được",
    "hài lòng",
    "ổn không",
    "ok không",
    "chất lượng ổn",
    "dùng tốt",
  ],

  // Giai đoạn 5 — Đã mua nhưng gặp vấn đề / hối tiếc
  "Hối Tiếc": [
    "bị mốc",
    "bị ngấm",
    "ngấm nước",
    "phồng rộp",
    "bị phồng",
    "bị cong",
    "bị vênh",
    "cánh vênh",
    "cánh cong",
    "bị xệ",
    "bong tróc",
    "tróc sơn",
    "rụng bản lề",
    "bản lề hỏng",
    "ray trượt hỏng",
    "xuống cấp",
    "nhanh hỏng",
    "mới làm mà hỏng",
    "thất vọng",
    "không như kỳ vọng",
    "không đúng như hứa",
    "biết thế",
    "biết vậy",
    "giá như",
    "không nên chọn",
    "chọn sai",
    "tiếc",
    "phí tiền",
    "hối hận",
    "ước gì",
    "lần sau không",
    "không làm nữa",
    "tìm bên khác",
    "đổi bên khác",
    "không liên lạc được",
    "mất hút sau bán",
    "không hỗ trợ",
    "không sửa",
    "chậm tiến độ",
    "trễ hẹn",
    "nhanh hỏng",
    "cánh đã cong",
    "đã cong",
    "đã vênh",
    "mới làm mà",
  ],

  // Giai đoạn 6 — Đã mua, hài lòng, đang giới thiệu
  "Giới Thiệu": [
    "rất hài lòng",
    "hài lòng lắm",
    "làm rất tốt",
    "chất lượng tốt",
    "đáng tiền",
    "xứng đáng",
    "đáng đồng tiền",
    "giới thiệu cho",
    "giới thiệu bạn bè",
    "nên giới thiệu",
    "recommend",
    "ủng hộ",
    "sẽ quay lại",
    "lần sau vẫn chọn",
    "tin tưởng",
  ],
};

// Thứ tự ưu tiên khi một comment khớp nhiều stage
export const stageOrder: DecisionStage[] = [
  "Hối Tiếc",       // Pain signal mạnh nhất — ưu tiên cao nhất
  "Giới Thiệu",     // Advocacy rõ ràng
  "Sắp Mua",        // Intent mạnh
  "So Sánh",        // Đang đánh giá
  "Sau Khi Mua",    // Đã mua, neutral
  "Trước Khi Mua",  // Awareness — rộng nhất, ưu tiên thấp nhất
];

export const stageColors: Record<DecisionStage, { bg: string; color: string; border: string }> = {
  "Trước Khi Mua": { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "So Sánh":       { bg: "#fef9c3", color: "#854d0e", border: "#fde68a" },
  "Sắp Mua":       { bg: "#dcfce7", color: "#15803d", border: "#86efac" },
  "Sau Khi Mua":   { bg: "#f3e8ff", color: "#7c3aed", border: "#d8b4fe" },
  "Hối Tiếc":      { bg: "#fee2e2", color: "#dc2626", border: "#fca5a5" },
  "Giới Thiệu":    { bg: "#fff7ed", color: "#c2410c", border: "#fdba74" },
};

export const stageDescriptions: Record<DecisionStage, string> = {
  "Trước Khi Mua": "Đang tìm hiểu, chưa có ý định cụ thể",
  "So Sánh":       "Đang đánh giá, so sánh các lựa chọn",
  "Sắp Mua":       "Đã quyết định hướng, đang tìm đơn vị / hỏi giá",
  "Sau Khi Mua":   "Đã mua và đang sử dụng",
  "Hối Tiếc":      "Đã mua nhưng gặp vấn đề hoặc thất vọng",
  "Giới Thiệu":    "Hài lòng và đang giới thiệu cho người khác",
};
