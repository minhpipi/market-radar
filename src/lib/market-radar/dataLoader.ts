// ============================================================
// DATA LAYER — Market Voice AI V2
// ============================================================
// Nhiệm vụ duy nhất: nhận dữ liệu từ mọi nguồn, trả về
// cùng 1 interface chuẩn để Classifier không cần biết
// dữ liệu đến từ đâu.
//
// Hôm nay:  loadComments() → hardcoded array
// Ngày mai: loadFromCSV()  → parse file
// Sau đó:   loadFromSupabase() → query DB
// Tương lai: loadFromFacebook() → crawl API
//
// Classifier luôn nhận MarketComment[] — không đổi.
// ============================================================

export type DataSource =
  | "facebook"
  | "tiktok"
  | "zalo"
  | "google_maps"
  | "youtube"
  | "csv"
  | "excel"
  | "api"
  | "database"
  | "manual";

export interface MarketComment {
  id: number | string;
  text: string;
  source?: DataSource;
  date?: string;       // ISO: "2025-06-26"
  author?: string;
  url?: string;        // link gốc nếu có
  metadata?: Record<string, unknown>;  // dữ liệu thêm tùy nguồn
}

// ── Adapter interface — mỗi nguồn implement cái này ─────────────────────
export interface DataAdapter {
  source: DataSource;
  load(): Promise<MarketComment[]> | MarketComment[];
}

// ── Loader chính — nhận nhiều adapter, gộp lại ──────────────────────────
export async function loadFromAdapters(
  adapters: DataAdapter[]
): Promise<MarketComment[]> {
  const results = await Promise.all(adapters.map(a => a.load()));
  return results.flat();
}

// ============================================================
// BUILT-IN ADAPTERS
// ============================================================

// 1. Manual / Hardcoded — dùng cho demo và test
export class ManualAdapter implements DataAdapter {
  source: DataSource = "manual";
  private comments: MarketComment[];

  constructor(comments: MarketComment[]) {
    this.comments = comments;
  }

  load(): MarketComment[] {
    return this.comments;
  }
}

// 2. CSV Adapter — placeholder, sau này dùng papaparse
export class CSVAdapter implements DataAdapter {
  source: DataSource = "csv";
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  load(): MarketComment[] {
    // TODO: implement CSV parsing
    // import Papa from 'papaparse';
    // const file = fs.readFileSync(this.filePath, 'utf-8');
    // const result = Papa.parse(file, { header: true });
    // return result.data.map((row, i) => ({ id: i+1, text: row.text, source: 'csv' }));
    console.warn(`CSVAdapter: ${this.filePath} — chưa implement, trả về rỗng`);
    return [];
  }
}

// 3. Supabase Adapter — placeholder
export class SupabaseAdapter implements DataAdapter {
  source: DataSource = "database";
  private table: string;
  private limit: number;

  constructor(table: string, limit = 1000) {
    this.table = table;
    this.limit = limit;
  }

  async load(): Promise<MarketComment[]> {
    // TODO: implement Supabase query
    // const { data } = await supabase.from(this.table).select('*').limit(this.limit);
    // return data.map(row => ({ id: row.id, text: row.comment, source: 'database', date: row.created_at }));
    console.warn(`SupabaseAdapter: table=${this.table} — chưa implement, trả về rỗng`);
    return [];
  }
}

// 4. Facebook Adapter — placeholder
export class FacebookAdapter implements DataAdapter {
  source: DataSource = "facebook";
  private groupId: string;

  constructor(groupId: string) {
    this.groupId = groupId;
  }

  async load(): Promise<MarketComment[]> {
    // TODO: implement Facebook Graph API crawl
    // const posts = await fetchFacebookPosts(this.groupId);
    // return posts.flatMap(p => p.comments.map(c => ({ id: c.id, text: c.message, source: 'facebook', date: c.created_time })));
    console.warn(`FacebookAdapter: group=${this.groupId} — chưa implement, trả về rỗng`);
    return [];
  }
}

// 5. TikTok Adapter — placeholder
export class TikTokAdapter implements DataAdapter {
  source: DataSource = "tiktok";
  private keyword: string;

  constructor(keyword: string) {
    this.keyword = keyword;
  }

  async load(): Promise<MarketComment[]> {
    // TODO: implement TikTok comment crawl
    console.warn(`TikTokAdapter: keyword=${this.keyword} — chưa implement, trả về rỗng`);
    return [];
  }
}

// ============================================================
// CONVENIENCE FUNCTION — dùng ngay không cần setup adapter
// ============================================================

// Dữ liệu demo — thay thế khi có dữ liệu thật
const DEMO_COMMENTS: MarketComment[] = [
  { id: 1,  text: "Tủ bếp bên nào làm tốt vậy mọi người?",                   source: "facebook",   date: "2025-06-20" },
  { id: 2,  text: "Xin review đơn vị làm tủ bếp uy tín",                      source: "facebook",   date: "2025-06-20" },
  { id: 3,  text: "Tủ nhà mình bị mốc sau 2 năm, xử lý thế nào?",            source: "facebook",   date: "2025-06-21" },
  { id: 4,  text: "Tủ bếp bị ngấm nước từ dưới lên, hỏng hết rồi",           source: "zalo",       date: "2025-06-21" },
  { id: 5,  text: "Đơn vị nào thi công tốt khu vực Thanh Hóa?",              source: "facebook",   date: "2025-06-21" },
  { id: 6,  text: "Xin review công ty nội thất làm tủ bếp đẹp",              source: "tiktok",     date: "2025-06-22" },
  { id: 7,  text: "Tủ MDF có nhanh hỏng không hay dùng picomat?",             source: "facebook",   date: "2025-06-22" },
  { id: 8,  text: "Có loại nào chống ẩm tốt cho nhà bếp không?",             source: "facebook",   date: "2025-06-22" },
  { id: 9,  text: "Giá làm tủ bếp hiện nay khoảng bao nhiêu một mét?",       source: "google_maps",date: "2025-06-22" },
  { id: 10, text: "Nội thất Đại Phát làm có ổn không mọi người?",             source: "facebook",   date: "2025-06-23" },
  { id: 11, text: "MDF hay nhựa picomat thì tốt hơn cho bếp gia đình?",       source: "facebook",   date: "2025-06-23" },
  { id: 12, text: "Nên chọn loại tủ nào cho nhà bếp nhỏ 8m2?",              source: "zalo",       date: "2025-06-23" },
  { id: 13, text: "Bếp nhà mình bị phồng rộp sau 1 năm, cánh bị vênh hết",   source: "facebook",   date: "2025-06-23" },
  { id: 14, text: "Rất hài lòng với công trình, sẽ giới thiệu cho bạn bè",   source: "google_maps",date: "2025-06-24" },
  { id: 15, text: "Thất vọng quá, tủ xuống cấp nhanh chóng mặt",             source: "facebook",   date: "2025-06-24" },
  { id: 16, text: "Báo giá tủ bếp cho căn bếp 15m2 được không ạ?",          source: "zalo",       date: "2025-06-24" },
  { id: 17, text: "Chi phí làm tủ bếp toàn bộ khoảng bao nhiêu tiền?",       source: "facebook",   date: "2025-06-24" },
  { id: 18, text: "Gỗ tự nhiên có bền hơn MDF không hay chỉ đẹp hơn?",       source: "tiktok",     date: "2025-06-25" },
  { id: 19, text: "Biết thế dùng nhựa picomat cho xong, MDF ẩm là hỏng",     source: "facebook",   date: "2025-06-25" },
  { id: 20, text: "Đơn vị có uy tín không? Mình sắp ký hợp đồng rồi",        source: "zalo",       date: "2025-06-25" },
  { id: 21, text: "Tủ mới làm 8 tháng mà cánh đã cong, bản lề bị xệ",       source: "facebook",   date: "2025-06-25" },
  { id: 22, text: "Bảo hành bao lâu vậy? Có lo gì không nếu bị lỗi?",        source: "zalo",       date: "2025-06-25" },
  { id: 23, text: "Ai dùng rồi cho mình xin đánh giá thật với",              source: "facebook",   date: "2025-06-26" },
  { id: 24, text: "Chậm tiến độ quá, hẹn 10 ngày mà 3 tuần chưa xong",      source: "facebook",   date: "2025-06-26" },
  { id: 25, text: "Không liên lạc được sau khi bàn giao, gọi không bắt máy", source: "google_maps",date: "2025-06-26" },
];

// Hàm đơn giản nhất — page.tsx gọi cái này
export function loadComments(): MarketComment[] {
  return DEMO_COMMENTS;
}

// Hàm nâng cao — khi cần kết hợp nhiều nguồn
export async function loadCommentsFromSources(
  adapters?: DataAdapter[]
): Promise<MarketComment[]> {
  if (!adapters || adapters.length === 0) {
    return loadComments(); // fallback về demo
  }
  return loadFromAdapters(adapters);
}
