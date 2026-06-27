import { loadComments } from "@/src/lib/market-radar/dataLoader";
import { classify } from "@/src/lib/market-radar/classifier";
import { runBusinessQuestionEngine } from "@/src/lib/market-radar/businessQuestionEngine";
import { runDecisionMining } from "@/src/lib/market-radar/decisionEngine";

const loaded = loadComments();
const classified = loaded.map(c => ({ ...c, comment: c.text, ...classify(c.text) }));
const previousWeekData: Record<string, number> = {
  "Rào Cản Niềm Tin": 22, "Rào Cản Chất Lượng": 18, "Rào Cản Tài Chính": 12,
};
const report = runBusinessQuestionEngine(classified, {
  periodLabel: "Tuần 20–26/06/2025",
  previousData: previousWeekData,
});
const decision = runDecisionMining(loaded.map(c => c.text));

// ── Tính số liệu thật + comment thật ─────────────────────────────────────

const RECS: Record<string, string[]> = {
  "Rào Cản Chất Lượng": ["Quay video test đổ nước lên bề mặt tủ", "Đăng case study công trình sau 2 năm", "Cam kết bảo hành chống ẩm 5 năm"],
  "Rào Cản Niềm Tin":   ["Đăng 3 video review khách hàng thật", "Trả lời công khai câu hỏi uy tín trong group", "Tạo trang công trình đã hoàn thành"],
  "Rào Cản Hậu Mãi":   ["Gọi điện khách gặp vấn đề trong 24h", "Đăng công khai cách xử lý khiếu nại", "Lập lịch check-in 30 ngày sau bàn giao"],
  "Rào Cản Tài Chính":  ["Đăng bảng giá tham khảo theo vật liệu", "Video bóc tách chi phí thực tế", "Gói combo Tiết kiệm / Tiêu chuẩn / Cao cấp"],
  "Rào Cản Tiến Độ":   ["Cam kết tiến độ cụ thể bằng văn bản", "Gửi cập nhật tiến độ hàng ngày qua Zalo", "Đền bù rõ ràng nếu trễ hẹn"],
  "Rào Cản Kiến Thức":  ["Tạo bảng so sánh MDF / HDF / Nhựa picomat", "Video 60 giây giải thích từng loại vật liệu", "Gửi tài liệu giáo dục trước khi tư vấn giá"],
  "Rào Cản Lựa Chọn":  ["Đơn giản hóa còn 3 gói rõ ràng", "Bộ câu hỏi định hướng chọn vật liệu", "Tư vấn viên chủ động đề xuất thay vì hỏi khách"],
};

const painList = report.allForces.map(f => {
  const painComments = classified.filter(c => c.marketForce === f.force && c.signal === "Pain");
  const allComments  = classified.filter(c => c.marketForce === f.force);
  return {
    force: f.force,
    shortName: f.force.replace("Rào Cản ", ""),
    totalCount: allComments.length,
    painCount:  painComments.length,
    trend: f.trend,
    delta: f.delta,
    recs: RECS[f.force] || ["Tạo nội dung trả lời trực tiếp nỗi lo này", "Đăng bằng chứng thực tế", "Theo dõi tuần tới"],
    evidence: allComments.slice(0, 3).map(c => c.text),
  };
}).filter(f => f.painCount > 0).sort((a, b) => b.painCount - a.painCount).slice(0, 3);

// Cơ hội — review + vendor selection
const oppComments = classified.filter(c =>
  c.signal === "Purchase" && (c.subtopic === "Review Seeking" || c.subtopic === "Vendor Selection")
);
const advComments = classified.filter(c => c.signal === "Recommendation");
const oppTotal = oppComments.length + advComments.length;
const oppEvidence = [...oppComments, ...advComments].slice(0, 3).map(c => c.text);

// 3 việc hôm nay
const regretStage = decision.stages.find(s => s.stage === "Hối Tiếc");
const todayActions = [
  painList[0] && {
    action: painList[0].recs[0],
    why: `${painList[0].force} — ${painList[0].totalCount} lượt${painList[0].trend === "up" ? `, tăng ${painList[0].delta}% so kỳ trước` : ""}`,
  },
  oppTotal > 0 && {
    action: "Trả lời công khai câu hỏi 'bên nào uy tín' trong 3 group nội thất lớn nhất",
    why: `${oppTotal} người đang tìm kiếm đơn vị uy tín ngay tuần này`,
  },
  regretStage && {
    action: "Gọi điện 3 khách gần nhất gặp vấn đề — hỏi thăm và ghi lại phản hồi",
    why: `${regretStage.percentage}% tín hiệu là hối tiếc — ${regretStage.count} người đang lan truyền trải nghiệm xấu`,
  },
].filter(Boolean) as { action: string; why: string }[];

// ── Components ────────────────────────────────────────────────────────────

function Block({ icon, title, borderColor, children }: {
  icon: string; title: string; borderColor: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", marginBottom: 16, borderTop: `3px solid ${borderColor}` }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function EvidenceBox({ comments, borderColor }: { comments: string[]; borderColor: string }) {
  return (
    <div style={{ margin: "10px 0 12px", display: "grid", gap: 6 }}>
      {comments.map((c, i) => (
        <div key={i} style={{
          fontSize: 13, color: "#475569", fontStyle: "italic",
          background: "#f8fafc", borderRadius: 8, padding: "8px 12px",
          borderLeft: `3px solid ${borderColor}`,
        }}>
          "{c}"
        </div>
      ))}
    </div>
  );
}

function CountBadge({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: color + "18", color, fontSize: 12, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20,
    }}>
      {count} {label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const dateStr = new Date().toLocaleDateString("vi-VN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 18px 60px", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
          Market Radar · {dateStr}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
          Báo Cáo Sáng Nay
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 10px" }}>
          Phát hiện <strong>{report.totalComments}</strong> tín hiệu · {report.period.label}
        </p>
        <a href="/" style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>← Xem phân tích đầy đủ</a>
      </div>

      {/* KEY INSIGHT */}
      <div style={{ background: "#0f172a", borderRadius: 14, padding: "16px 20px", marginBottom: 16, color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Điều quan trọng nhất</div>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.65 }}>{decision.keyInsight}</div>
      </div>

      {/* 1. NỖI ĐAU LỚN NHẤT */}
      <Block icon="🔥" title="Nỗi Đau Lớn Nhất" borderColor="#dc2626">
        {painList.map((p, i) => (
          <div key={p.force} style={{
            marginBottom: i < painList.length - 1 ? 22 : 0,
            paddingBottom: i < painList.length - 1 ? 22 : 0,
            borderBottom: i < painList.length - 1 ? "1px solid #f1f5f9" : "none",
          }}>
            {/* Tên + số lượt */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>{i + 1}. {p.shortName}</span>
              <CountBadge count={p.totalCount} label="lượt" color="#dc2626" />
              {p.painCount > 0 && <CountBadge count={p.painCount} label="đang gặp" color="#9f1239" />}
              {p.trend === "up" && <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>↑ +{p.delta}%</span>}
              {p.trend === "new" && <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>★ Mới xuất hiện</span>}
            </div>

            {/* Bằng chứng — comment thật */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Bằng chứng từ thị trường
            </div>
            <EvidenceBox comments={p.evidence} borderColor="#fca5a5" />

            {/* Khuyến nghị */}
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Khuyến nghị
            </div>
            {p.recs.map((r, j) => (
              <div key={j} style={{ fontSize: 13, color: "#334155", marginBottom: 5, display: "flex", gap: 6 }}>
                <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span> {r}
              </div>
            ))}
          </div>
        ))}
      </Block>

      {/* 2. CƠ HỘI LỚN NHẤT */}
      <Block icon="💰" title="Cơ Hội Lớn Nhất" borderColor="#16a34a">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>Khách hàng đang hỏi review</span>
          <CountBadge count={oppTotal} label="lượt" color="#16a34a" />
        </div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px" }}>
          Đây là nhóm gần chốt đơn nhất — họ đã có nhu cầu, chỉ cần thêm bằng chứng để quyết định.
        </p>

        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", margin: "10px 0 4px" }}>
          Bằng chứng từ thị trường
        </div>
        <EvidenceBox comments={oppEvidence} borderColor="#86efac" />

        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Khuyến nghị
        </div>
        {["Đăng video công trình thực tế ngay tuần này — không cần chỉnh sửa",
          "Trả lời công khai câu hỏi 'bên nào uy tín' trong group nội thất",
          "Xin phép 3 khách hài lòng gần nhất quay 30 giây video review",
        ].map((r, i) => (
          <div key={i} style={{ fontSize: 13, color: "#334155", marginBottom: 5, display: "flex", gap: 6 }}>
            <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span> {r}
          </div>
        ))}
      </Block>

      {/* 3. GIAI ĐOẠN MUA */}
      <Block icon="🛒" title="Giai Đoạn Mua" borderColor="#7c3aed">
        <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
          {decision.stages.map(s => {
            const colors: Record<string, string> = {
              "Sắp Mua": "#16a34a", "Hối Tiếc": "#dc2626",
              "Trước Khi Mua": "#2563eb", "So Sánh": "#ca8a04",
              "Giới Thiệu": "#7c3aed", "Sau Khi Mua": "#0e7490",
            };
            const c = colors[s.stage] || "#64748b";
            return (
              <div key={s.stage}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 110, fontSize: 13, color: "#475569", flexShrink: 0 }}>{s.stage}</div>
                  <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 22, overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(s.percentage, 3)}%`, height: "100%", background: c, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{s.count} lượt</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c, minWidth: 40, textAlign: "right" }}>{s.percentage}%</div>
                </div>
                {/* Comment mẫu của stage */}
                {s.comments[0] && (
                  <div style={{ marginLeft: 120, fontSize: 12, color: "#94a3b8", fontStyle: "italic", marginBottom: 2 }}>
                    "{s.comments[0]}"
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {regretStage && regretStage.percentage >= 20 && (
          <div style={{ background: "#fff1f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>
            ⚠️ <strong>{regretStage.percentage}%</strong> đang hối tiếc ({regretStage.count} người) — ưu tiên xử lý trước khi mở rộng marketing
          </div>
        )}
      </Block>

      {/* 4. VIỆC NÊN LÀM HÔM NAY */}
      <div style={{ background: "#0f172a", borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: 0 }}>Việc Nên Làm Hôm Nay</h2>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {todayActions.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ minWidth: 26, height: 26, background: "#3b82f6", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.5, marginBottom: 3 }}>{a.action}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{a.why}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 32, fontSize: 12, color: "#94a3b8" }}>
        Market Voice AI V2 · {report.totalComments} tín hiệu · {report.classificationRate}% phân loại
      </div>

    </main>
  );
}
