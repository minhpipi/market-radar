// Decision Mining Engine
// Input:  comment string
// Output: DecisionStage | null

import {
  DecisionStage,
  decisionStageKeywords,
  stageOrder,
} from "./decisionStages";

export interface DecisionResult {
  stage: DecisionStage | null;
  matchedKeyword: string | null;
}

// Phân loại 1 comment → giai đoạn quyết định
export function classifyDecision(comment: string): DecisionResult {
  const lower = comment.toLowerCase();

  // Duyệt theo thứ tự ưu tiên
  for (const stage of stageOrder) {
    const keywords = decisionStageKeywords[stage];
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return { stage, matchedKeyword: kw };
      }
    }
  }

  return { stage: null, matchedKeyword: null };
}

// ── Aggregate: đếm và tính % từng stage ─────────────────────────────────
export interface StageSummary {
  stage: DecisionStage;
  count: number;
  percentage: number;
  insight: string;
  comments: string[];        // comment mẫu thuộc stage này
}

export interface DecisionMiningResult {
  total: number;
  classified: number;
  classificationRate: number;
  stages: StageSummary[];
  unclassified: string[];
  keyInsight: string;         // insight quan trọng nhất
}

// Insight tự động theo phân bổ stage
function buildInsight(stage: DecisionStage, pct: number, total: number): string {
  const count = Math.round((pct / 100) * total);

  const templates: Record<DecisionStage, (p: number, c: number) => string> = {
    "Trước Khi Mua": (p, c) =>
      `${p}% khách hàng (${c} người) đang ở giai đoạn tìm hiểu — họ chưa biết chọn ai. Đây là cơ hội nội dung giáo dục.`,
    "So Sánh": (p, c) =>
      `${p}% khách hàng (${c} người) đang so sánh vật liệu và nhà cung cấp — họ cần lý do rõ ràng để chọn bạn thay vì đối thủ.`,
    "Sắp Mua": (p, c) =>
      `${p}% khách hàng (${c} người) đang hỏi giá và tìm đơn vị — đây là nhóm có intent mua cao nhất, cần phản hồi trong 2 giờ.`,
    "Sau Khi Mua": (p, c) =>
      `${p}% khách hàng (${c} người) đã mua và đang dùng — đây là thời điểm vàng để xin testimonial và ảnh thực tế.`,
    "Hối Tiếc": (p, c) =>
      `${p}% khách hàng (${c} người) đang gặp vấn đề sau mua — mỗi người này có thể ảnh hưởng 10-20 quyết định mua của người khác trên mạng xã hội.`,
    "Giới Thiệu": (p, c) =>
      `${p}% khách hàng (${c} người) đang hài lòng và sẵn sàng giới thiệu — tạo điều kiện để họ làm điều đó ngay tuần này.`,
  };

  return templates[stage]?.(pct, count) || `${pct}% tín hiệu thuộc giai đoạn ${stage}.`;
}

// Insight tổng hợp quan trọng nhất
function buildKeyInsight(stages: StageSummary[]): string {
  if (stages.length === 0) return "Chưa đủ dữ liệu để rút ra insight.";

  const regret = stages.find(s => s.stage === "Hối Tiếc");
  const buying  = stages.find(s => s.stage === "Sắp Mua");
  const before  = stages.find(s => s.stage === "Trước Khi Mua");
  const compare = stages.find(s => s.stage === "So Sánh");
  const refer   = stages.find(s => s.stage === "Giới Thiệu");

  // Ưu tiên cảnh báo hối tiếc
  if (regret && regret.percentage >= 15) {
    return `🚨 Cảnh báo: ${regret.percentage}% tín hiệu là hối tiếc sau mua. Mỗi comment này đang lan truyền trải nghiệm xấu. Ưu tiên xử lý ngay trước khi làm bất cứ điều gì khác.`;
  }

  // Cơ hội chuyển đổi cao
  if (buying && buying.percentage >= 25) {
    return `💰 Cơ hội ngay: ${buying.percentage}% đang hỏi giá và tìm đơn vị. Đây là nhóm có intent mua cao — phản hồi trong 2 giờ có thể tăng tỷ lệ chốt đơn đáng kể.`;
  }

  // Thị trường đang ở giai đoạn tìm hiểu
  const awareness = (before?.percentage || 0) + (compare?.percentage || 0);
  if (awareness >= 50) {
    return `📚 ${awareness}% thị trường đang tìm hiểu và so sánh — họ chưa chọn ai. Doanh nghiệp nào cung cấp thông tin tốt nhất sẽ thắng, không phải doanh nghiệp có giá thấp nhất.`;
  }

  // Advocacy tốt
  if (refer && refer.percentage >= 15) {
    return `⭐ ${refer.percentage}% đang sẵn sàng giới thiệu — đây là mỏ vàng marketing chưa được khai thác. Tạo điều kiện cho họ hành động ngay.`;
  }

  // Default
  const top = stages[0];
  return `Giai đoạn chiếm nhiều nhất: ${top.stage} (${top.percentage}%). Tập trung nội dung và sales vào nhóm này.`;
}

// Hàm chính: phân tích toàn bộ danh sách comment
export function runDecisionMining(comments: string[]): DecisionMiningResult {
  const results = comments.map(c => ({ comment: c, ...classifyDecision(c) }));

  const classified = results.filter(r => r.stage !== null);
  const unclassified = results.filter(r => r.stage === null).map(r => r.comment);

  // Đếm từng stage
  const stageCount: Partial<Record<DecisionStage, string[]>> = {};
  classified.forEach(r => {
    if (!r.stage) return;
    if (!stageCount[r.stage]) stageCount[r.stage] = [];
    stageCount[r.stage]!.push(r.comment);
  });

  const total = comments.length;

  // Build summary theo thứ tự tự nhiên của hành trình
  const journeyOrder: DecisionStage[] = [
    "Trước Khi Mua",
    "So Sánh",
    "Sắp Mua",
    "Sau Khi Mua",
    "Hối Tiếc",
    "Giới Thiệu",
  ];

  const stages: StageSummary[] = journeyOrder
    .filter(stage => stageCount[stage] && stageCount[stage]!.length > 0)
    .map(stage => {
      const stageComments = stageCount[stage] || [];
      const count = stageComments.length;
      const percentage = Math.round((count / total) * 100);
      return {
        stage,
        count,
        percentage,
        insight: buildInsight(stage, percentage, total),
        comments: stageComments.slice(0, 3), // lấy tối đa 3 mẫu
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    total,
    classified: classified.length,
    classificationRate: Math.round((classified.length / total) * 100),
    stages,
    unclassified,
    keyInsight: buildKeyInsight(stages),
  };
}
