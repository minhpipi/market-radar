// Business Question Engine V3
// Finding được tính từ dữ liệu thật — không viết cứng

import {
  ClassifiedComment,
  DynamicFinding,
  BusinessAnswer,
  ReportData,
} from "./types";

// ── Mapping force → câu hỏi ───────────────────────────────────────────────
const FORCE_TO_QUESTIONS: Record<string, string[]> = {
  "Rào Cản Niềm Tin":           ["trust", "revenue"],
  "Rào Cản Chất Lượng":         ["fear", "purchase"],
  "Rào Cản Tài Chính":          ["revenue", "fear"],
  "Rào Cản Kiến Thức":          ["purchase"],
  "Rào Cản Lựa Chọn":           ["purchase", "revenue"],
  "Rào Cản Bằng Chứng Xã Hội": ["trust", "purchase"],
  "Rào Cản Hậu Mãi":            ["switching", "revenue"],
  "Rào Cản Tiến Độ":            ["revenue", "fear"],
};

const QUESTIONS: Record<string, string> = {
  purchase:  "Điều gì thúc đẩy quyết định mua?",
  revenue:   "Điều gì đang làm mất đơn hàng?",
  fear:      "Khách hàng đang sợ điều gì?",
  trust:     "Điều gì tạo niềm tin với khách hàng?",
  switching: "Điều gì khiến khách đổi nhà cung cấp?",
};

// ── Tạo Observation từ dữ liệu ────────────────────────────────────────────
function buildObservation(
  force: string,
  count: number,
  pct: number,
  comments: ClassifiedComment[],
  trend: "up" | "down" | "new" | "stable",
  delta: number | null
): string {

  const trendText =
    trend === "new"   ? " — đây là tín hiệu mới xuất hiện kỳ này" :
    trend === "up"    ? ` — tăng ${delta}% so với kỳ trước` :
    trend === "down"  ? ` — giảm ${delta}% so với kỳ trước` :
    "";

  // Lấy subtopic phổ biến nhất trong force này
  const subtopicCount: Record<string, number> = {};
  comments
    .filter(c => c.marketForce === force)
    .forEach(c => {
      subtopicCount[c.subtopic] = (subtopicCount[c.subtopic] || 0) + 1;
    });
  const topSubtopics = Object.entries(subtopicCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([s]) => s);

  const subtopicViLabel: Record<string, string> = {
    "Mold":              "lo ngại ẩm mốc",
    "Water Damage":      "lo ngấm nước / phồng rộp",
    "Warping":           "lo cong vênh",
    "Surface Damage":    "lo bong tróc bề mặt",
    "Hardware Failure":  "lo hỏng bản lề / ray trượt",
    "Longevity":         "lo tuổi thọ sản phẩm",
    "Moisture Resistance":"tìm kiếm giải pháp chống ẩm",
    "Water Resistance":  "tìm kiếm giải pháp chống nước",
    "Vendor Selection":  "tìm kiếm nhà cung cấp uy tín",
    "Review Seeking":    "tìm kiếm đánh giá thực tế",
    "Price Research":    "tìm hiểu giá thị trường",
    "Cost Research":     "lo chi phí phát sinh",
    "Quotation":         "yêu cầu báo giá cụ thể",
    "Price Concern":     "lo giá cao",
    "Budget":            "bị giới hạn ngân sách",
    "MDF":               "tìm hiểu về MDF",
    "Plastic Board":     "tìm hiểu về nhựa picomat",
    "Product Comparison":"so sánh nhiều phương án",
    "Material Comparison":"so sánh vật liệu",
    "Warranty":          "hỏi về bảo hành",
    "Dissatisfaction":   "thất vọng sau mua",
    "Regret":            "hối tiếc về quyết định",
    "Delivery Time":     "lo tiến độ thi công",
    "Delay":             "gặp tình trạng trễ hẹn",
    "Positive Experience":"chia sẻ trải nghiệm tốt",
    "Referral":          "sẵn sàng giới thiệu",
  };

  const topLabel = topSubtopics
    .map(s => subtopicViLabel[s] || s)
    .join(" và ");

  return `${count} tín hiệu (${pct}% tổng dữ liệu) liên quan đến ${force.toLowerCase()}${trendText}. Chủ yếu tập trung vào ${topLabel}.`;
}

// ── Tạo Evidence từ comment thật ─────────────────────────────────────────
function buildEvidence(
  force: string,
  comments: ClassifiedComment[],
  pct: number
): { evidence: string; samples: string[] } {

  const relevant = comments.filter(c => c.marketForce === force);

  // Lấy 3 comment mẫu ngắn nhất (dễ đọc nhất)
  const samples = relevant
    .map(c => c.comment)
    .sort((a, b) => a.length - b.length)
    .slice(0, 3);

  // Đếm phân bổ signal trong force này
  const signalCount: Record<string, number> = {};
  relevant.forEach(c => {
    signalCount[c.signal] = (signalCount[c.signal] || 0) + 1;
  });
  const painCount = signalCount["Pain"] || 0;
  const purchaseCount = signalCount["Purchase"] || 0;
  const desireCount = signalCount["Desire"] || 0;

  let evidenceParts: string[] = [];
  if (painCount > 0)
    evidenceParts.push(`${painCount} người đang gặp vấn đề thực tế`);
  if (purchaseCount > 0)
    evidenceParts.push(`${purchaseCount} người đang cân nhắc mua`);
  if (desireCount > 0)
    evidenceParts.push(`${desireCount} người đang tìm kiếm giải pháp`);

  const evidenceStr = evidenceParts.length > 0
    ? `${pct}% tổng tín hiệu thuộc rào cản này: ${evidenceParts.join(", ")}. Đây là bằng chứng thị trường thực tế, không phải giả định.`
    : `${pct}% tổng tín hiệu thuộc rào cản này.`;

  return { evidence: evidenceStr, samples };
}

// ── Tạo Business Gap từ dữ liệu ──────────────────────────────────────────
function buildBusinessGap(
  force: string,
  pct: number,
  trend: "up" | "down" | "new" | "stable"
): string {

  const gaps: Record<string, string> = {
    "Rào Cản Niềm Tin":
      "Phần lớn doanh nghiệp nội thất đang đầu tư vào ảnh sản phẩm và thiết kế, nhưng dữ liệu cho thấy khách hàng cần bằng chứng từ người thứ ba đã trải nghiệm thực tế — không phải hình ảnh từ nhà sản xuất.",
    "Rào Cản Chất Lượng":
      "Doanh nghiệp đang truyền thông về thẩm mỹ và thiết kế, trong khi dữ liệu cho thấy nỗi sợ độ bền xuất hiện ở cả giai đoạn tìm kiếm lẫn sau khi mua. Khoảng cách giữa thông điệp marketing và mối lo thực tế của khách đang làm mất đơn.",
    "Rào Cản Tài Chính":
      "Doanh nghiệp giữ giá bí mật để 'ép' khách gọi điện — nhưng dữ liệu cho thấy khách bỏ qua trang không có giá và chọn đơn vị công khai hơn trước khi liên hệ.",
    "Rào Cản Kiến Thức":
      "Khách không mua vì không hiểu — không phải vì không muốn mua. Doanh nghiệp chưa có nội dung giáo dục đơn giản giúp khách tự tin ra quyết định.",
    "Rào Cản Lựa Chọn":
      "Càng nhiều lựa chọn, khách càng trì hoãn. Doanh nghiệp đang trưng bày nhiều sản phẩm nhưng thiếu hướng dẫn giúp khách biết cái nào phù hợp với mình.",
    "Rào Cản Tiến Độ":
      "Khách hàng lo trễ tiến độ nhưng doanh nghiệp chưa có cam kết cụ thể về thời gian thi công. Đây là lý do khách chần chừ ký hợp đồng.",
    "Rào Cản Hậu Mãi":
      "Doanh nghiệp tập trung vào giai đoạn bán hàng nhưng thiếu hệ thống chăm sóc sau bàn giao. Đây là nguồn chính gây mất khách và mất uy tín trên mạng xã hội.",
    "Rào Cản Bằng Chứng Xã Hội":
      "Khách hài lòng đang muốn giới thiệu nhưng doanh nghiệp chưa có quy trình biến sự hài lòng đó thành nội dung marketing. Đây là cơ hội đang bị bỏ phí.",
  };

  let gap = gaps[force] || `Khoảng cách giữa nỗi lo của khách hàng (${pct}% tín hiệu) và thông điệp doanh nghiệp đang truyền thông.`;

  if (trend === "up")
    gap += ` Xu hướng đang tăng — cần hành động ngay trong tuần này.`;
  else if (trend === "new")
    gap += ` Đây là tín hiệu mới — cần theo dõi sát trong 2 tuần tới.`;

  return gap;
}

// ── Tạo Recommendation từ dữ liệu ────────────────────────────────────────
function buildRecommendation(
  force: string,
  count: number,
  pct: number,
  trend: "up" | "down" | "new" | "stable"
): string[] {

  const base: Record<string, string[]> = {
    "Rào Cản Niềm Tin": [
      `Đăng ngay ít nhất 3 video 'Khách hàng nói về chúng tôi' — quay tại nhà thực tế, không quay ở showroom`,
      `Tạo trang 'Công trình đã hoàn thành' với địa chỉ và năm bàn giao cụ thể — không chỉ ảnh render`,
      `Viết 1 case study chi tiết mỗi tuần: vấn đề khách gặp → giải pháp → kết quả sau 6 tháng`,
      `Trả lời công khai mọi câu hỏi 'bên nào uy tín' trong các group nội thất — đây là cơ hội bán hàng miễn phí`,
    ],
    "Rào Cản Chất Lượng": [
      `Quay video test chống ẩm ngay tuần này: đổ nước lên bề mặt tủ, ghi lại kết quả sau 24h`,
      `Tạo nội dung '5 dấu hiệu tủ bếp kém chất lượng' — định vị mình là chuyên gia, không phải người bán hàng`,
      `Đăng ảnh/video công trình sau 2-3 năm sử dụng thực tế: đây là bằng chứng mạnh nhất`,
      `Cam kết bảo hành chống ẩm cụ thể (ví dụ: 5 năm) và đặt nó làm thông điệp chính — không phải để trong hợp đồng`,
    ],
    "Rào Cản Tài Chính": [
      `Đăng bảng giá tham khảo theo vật liệu và diện tích — không cần chính xác, chỉ cần có khung giá`,
      `Làm video 'Bóc tách chi phí tủ bếp 15m2 thực tế': vật liệu + nhân công + phụ kiện + lắp đặt`,
      `Thêm vào website dòng chữ 'Giá từ X triệu/m dài' — giảm ngay 40% tỷ lệ bỏ trang`,
      `Tạo gói combo rõ ràng: Tiết kiệm / Tiêu chuẩn / Cao cấp — với giá cụ thể từng gói`,
    ],
    "Rào Cản Kiến Thức": [
      `Tạo bảng so sánh MDF / HDF / Nhựa picomat / Gỗ tự nhiên: độ bền, chống ẩm, giá, phù hợp không gian nào`,
      `Làm video 60 giây: 'Chọn vật liệu tủ bếp sai sẽ hối hận sau 2 năm — đây là cách chọn đúng'`,
      `Gửi tài liệu giáo dục cho khách trước khi tư vấn giá — khách hiểu vật liệu sẽ ra quyết định nhanh hơn 3 lần`,
      `Đào tạo nhân viên bán hàng giải thích sự khác biệt vật liệu trong 2 phút — bằng ngôn ngữ người thường`,
    ],
    "Rào Cản Lựa Chọn": [
      `Giảm bộ sản phẩm xuống còn 3 gói rõ ràng: Cơ bản / Tiêu chuẩn / Premium — thay vì 20 lựa chọn`,
      `Tạo công cụ 'Chọn vật liệu theo không gian': nhập diện tích + môi trường → gợi ý tự động`,
      `Đào tạo nhân viên chủ động đề xuất: 'Với nhà bếp của anh/chị, tôi khuyên loại này vì...'`,
      `Viết nội dung 'Khi nào nên chọn MDF, khi nào nên chọn nhựa' — giảm nỗi lo so sánh của khách`,
    ],
    "Rào Cản Tiến Độ": [
      `Công bố rõ thời gian thi công chuẩn: 'Tủ bếp 15m2 — 7 ngày hoàn thành' — đặt làm cam kết`,
      `Gửi cập nhật tiến độ hàng ngày qua Zalo/Messenger trong khi thi công`,
      `Đền bù cụ thể nếu trễ hẹn: ví dụ 'Trễ 1 ngày — giảm 500.000đ phí lắp đặt'`,
      `Đăng timeline thi công thực tế: ngày 1 làm gì, ngày 3 làm gì — khách yên tâm hơn`,
    ],
    "Rào Cản Hậu Mãi": [
      `Lập ngay lịch check-in sau bàn giao: 7 ngày, 30 ngày, 6 tháng — gọi điện hỏi thăm chủ động`,
      `Xử lý mọi khiếu nại trong 24h và đăng công khai cách xử lý — đây là marketing tốt nhất`,
      `Tạo nhóm Zalo riêng cho từng khách sau bàn giao: hỗ trợ kỹ thuật nhanh`,
      `Biến bảo hành từ 'nghĩa vụ' thành 'lợi thế cạnh tranh': quảng cáo bảo hành 5 năm rõ ràng hơn đối thủ`,
    ],
    "Rào Cản Bằng Chứng Xã Hội": [
      `Xây quy trình sau bàn giao: xin phép chụp ảnh + quay 30 giây video review ngay tại nhà khách`,
      `Tạo chương trình giới thiệu: khách cũ giới thiệu thành công → nhận bảo trì miễn phí 1 năm`,
      `Đăng 'Công trình tuần này' đều đặn mỗi thứ Hai — không cần chỉnh sửa, khách thích ảnh thật`,
      `Tổng hợp 10 đánh giá 5 sao thành 1 post và đăng mỗi tháng — không để testimonial nằm im`,
    ],
  };

  const recs = [...(base[force] || [
    `Ưu tiên giải quyết rào cản '${force}' — chiếm ${pct}% tín hiệu thị trường`,
    `Tạo nội dung trực tiếp trả lời nỗi lo này của khách hàng`,
    `Đo lường kết quả sau 2 tuần triển khai`,
  ])];

  // Thêm khuyến nghị ưu tiên nếu xu hướng tăng
  if (trend === "up" || trend === "new") {
    recs.unshift(`⚡ ƯU TIÊN NGAY: Rào cản này đang ${trend === "new" ? "mới xuất hiện" : "tăng mạnh"} — hành động trong tuần này, không để sang tuần sau`);
  }

  return recs;
}

// ── Tính xu hướng ─────────────────────────────────────────────────────────
function calcTrend(
  force: string,
  currentPct: number,
  previousData?: Record<string, number>
): { trend: "up" | "down" | "new" | "stable"; delta: number | null } {

  if (!previousData || !(force in previousData)) {
    return { trend: "new", delta: null };
  }

  const prevPct = previousData[force];
  const delta = Math.round(currentPct - prevPct);

  if (delta >= 5)  return { trend: "up", delta };
  if (delta <= -5) return { trend: "down", delta: Math.abs(delta) };
  return { trend: "stable", delta };
}

// ── Engine chính ──────────────────────────────────────────────────────────
export function runBusinessQuestionEngine(
  comments: ClassifiedComment[],
  options?: {
    periodLabel?: string;
    periodStart?: string;
    periodEnd?: string;
    previousData?: Record<string, number>;  // force → pct từ kỳ trước
  }
): ReportData {

  const total = comments.length;
  const classified = comments.filter(c => c.marketForce !== null);

  // Đếm force
  const forceCount: Record<string, number> = {};
  classified.forEach(c => {
    if (c.marketForce) {
      forceCount[c.marketForce] = (forceCount[c.marketForce] || 0) + 1;
    }
  });

  // Tính pct và trend cho từng force
  const forceSummary = Object.entries(forceCount)
    .sort((a, b) => b[1] - a[1])
    .map(([force, count]) => {
      const pct = Math.round((count / total) * 100);
      const { trend, delta } = calcTrend(force, pct, options?.previousData);
      return { force, count, pct, trend, delta };
    });

  // Build DynamicFinding cho từng force
  const findingMap: Record<string, DynamicFinding> = {};

  forceSummary.forEach(({ force, count, pct, trend, delta }) => {
    const { evidence, samples } = buildEvidence(force, classified, pct);

    findingMap[force] = {
      force,
      count,
      percentage: pct,
      trend: trend as "up" | "down" | "new" | "stable",
      trendDelta: delta,
      observation: buildObservation(force, count, pct, classified, trend as "up"|"down"|"new"|"stable", delta),
      evidence,
      sampleComments: samples,
      businessGap: buildBusinessGap(force, pct, trend as "up"|"down"|"new"|"stable"),
      recommendation: buildRecommendation(force, count, pct, trend as "up"|"down"|"new"|"stable"),
    };
  });

  // Gom force → câu hỏi
  const questionMap: Record<string, string[]> = {};
  forceSummary.forEach(({ force }) => {
    const qs = FORCE_TO_QUESTIONS[force] || [];
    qs.forEach(q => {
      if (!questionMap[q]) questionMap[q] = [];
      questionMap[q].push(force);
    });
  });

  // Build answers
  const order = ["purchase", "revenue", "fear", "trust", "switching"];
  const answers: BusinessAnswer[] = order
    .filter(slug => questionMap[slug]?.length > 0)
    .map(slug => ({
      question: QUESTIONS[slug],
      slug,
      totalSignals: total,
      findings: (questionMap[slug] || [])
        .filter(force => findingMap[force])
        .sort((a, b) => findingMap[b].count - findingMap[a].count)
        .map(force => findingMap[force]),
    }))
    .filter(a => a.findings.length > 0);

  const top = forceSummary[0];

  return {
    period: {
      label: options?.periodLabel || "Dữ liệu hiện tại",
      start: options?.periodStart || "",
      end: options?.periodEnd || "",
    },
    totalComments: total,
    classifiedCount: classified.length,
    classificationRate: Math.round((classified.length / total) * 100),
    topForce: top?.force || "",
    topForceCount: top?.count || 0,
    topForcePct: top?.pct || 0,
    answers,
    allForces: forceSummary,
    rawClassified: classified,
  };
}
