// Core data types cho toàn bộ hệ thống

export interface RawComment {
  id: string | number;
  comment: string;
  source?: string;        // "facebook" | "tiktok" | "zalo" | "google_maps"
  date?: string;          // ISO string: "2025-06-01"
  author?: string;
}

export interface ClassifiedComment extends RawComment {
  signal: string;
  topic: string;
  subtopic: string;
  buyerJourney: string | null;
  marketForce: string | null;
  opportunity: { title: string; actions: string[] } | null;
}

// Finding được tính từ dữ liệu thật — không viết cứng
export interface DynamicFinding {
  force: string;

  // Số liệu từ dữ liệu
  count: number;
  percentage: number;

  // Xu hướng so kỳ trước (nếu có)
  trend: "up" | "down" | "new" | "stable";
  trendDelta: number | null;   // +12% hoặc -5%

  // Observation — suy ra từ pattern
  observation: string;

  // Evidence — trích dẫn comment thật
  evidence: string;
  sampleComments: string[];    // 2-3 comment thật làm chứng

  // Business Gap — so sánh signal vs thực tế ngành
  businessGap: string;

  // Recommendation — cụ thể, có số liệu
  recommendation: string[];
}

export interface BusinessAnswer {
  question: string;
  slug: string;
  findings: DynamicFinding[];
  totalSignals: number;
}

export interface ReportData {
  period: {
    label: string;       // "Tuần 26/6 – 2/7/2025"
    start: string;
    end: string;
  };
  totalComments: number;
  classifiedCount: number;
  classificationRate: number;
  topForce: string;
  topForceCount: number;
  topForcePct: number;
  answers: BusinessAnswer[];
  allForces: { force: string; count: number; pct: number; trend: string; delta: number | null }[];
  rawClassified: ClassifiedComment[];
}
