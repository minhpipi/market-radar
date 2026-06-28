// ============================================================
// CRAWLER TYPES — chuẩn dữ liệu thô từ mọi nguồn
// ============================================================

export type CrawlerSource = "facebook" | "tiktok" | "youtube" | "zalo" | "google";

// Dữ liệu thô — chưa xử lý, đúng như crawler lấy về
export interface RawComment {
  source: CrawlerSource;
  sourceId: string;      // ID duy nhất từ platform (comment_id, post_id...)
  postId: string;        // ID bài post chứa comment này
  postUrl: string;       // Link bài post gốc
  author: string;        // Tên người đăng
  text: string;          // Nội dung comment
  createdAt: string;     // ISO string hoặc timestamp
  likes?: number;        // Số like nếu có
  metadata?: Record<string, unknown>;
}

// Kết quả sau khi crawl
export interface CrawlResult {
  success: boolean;
  source: CrawlerSource;
  url: string;
  totalFound: number;
  comments: RawComment[];
  error?: string;
  crawledAt: string;
}
