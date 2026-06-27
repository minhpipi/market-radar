import { loadComments } from "@/src/lib/market-radar/dataLoader";
import { classify } from "@/src/lib/market-radar/classifier";
import { runBusinessQuestionEngine } from "@/src/lib/market-radar/businessQuestionEngine";
import { runDecisionMining } from "@/src/lib/market-radar/decisionEngine";

const loaded = loadComments();
const classified = loaded.map(c => ({ ...c, comment: c.text, ...classify(c.text) }));
const previousWeekData: Record<string, number> = {
  "Rào Cản Niềm Tin": 22, "Rào Cản Chất Lượng": 18, "Rào Cản Tài Chính": 12,
};
const report = runBusinessQuestionEngine(classified, { periodLabel: "Tuần 20–26/06/2025", previousData: previousWeekData });
const decision = runDecisionMining(loaded.map(c => c.text));

// ── Tính số liệu thật ────────────────────────────────────────────────────

// Nỗi đau lớn nhất — top 3 force có Pain signal
const painList = report.allForces.map(f => ({
  force: f.force,
  count: classified.filter(c => c.marketForce === f.force && c.signal === "Pain").length,
  pct: f.pct,
  trend: f.trend,
  delta: f.delta,
  recs: (() => {
    const map: Record<string, string[]> = {
      "Rào Cản Chất Lượng": ["Quay video test đổ nước lên bề mặt tủ", "Đăng case study công trình sau 2 năm", "Cam kết bảo hành chống ẩm 5 năm"],
      "Rào Cản Niềm Tin":   ["Đăng 3 video review khách hàng thật", "Trả lời công khai câu hỏi uy tín trong group", "Tạo trang công trình đã hoàn thành"],
      "Rào Cản Hậu Mãi":   ["Gọi điện khách gặp vấn đề trong 24h", "Đăng công khai cách xử lý khiếu nại", "Lập lịch check-in 30 ngày sau bàn giao"],
      "Rào Cản Tài Chính":  ["Đăng bảng giá tham khảo theo vật liệu", "Video bóc tách chi phí thực tế", "Gói combo Tiết kiệm / Tiêu chuẩn / Cao cấp"],
      "Rào Cản Tiến Độ":   ["Cam kết tiến độ cụ thể bằng văn bản", "Gửi cập nhật tiến độ hàng ngày qua Zalo", "Đền bù rõ ràng nếu trễ hẹn"],
    };
    return map[f.force] || ["Tạo nội dung trả lời trực tiếp nỗi lo này", "Đăng bằng chứng thực tế", "Theo dõi phản hồi tuần tới"];
  })(),
})).filter(f => f.count > 0).sort((a, b) => b.count - a.count).slice(0, 3);

// Cơ hội — khách đang hỏi review / tìm đơn vị
const opportunityComments = classified.filter(c =>
  c.signal === "Purchase" && (c.subtopic === "Review Seeking" || c.subtopic === "Vendor Selection")
);
const advocacyComments = classified.filter(c => c.signal === "Recommendation");

// Việc làm ngay — 3 hành động cụ thể nhất
const todayActions = [
  painList[0] && {
    action: painList[0].recs[0],
    why: `${painList[0].force} chiếm ${painList[0].count} tín hiệu Pain${painList[0].trend === "up" ? ` — tăng ${painList[0].delta}% so kỳ trước` : ""}`,
  },
  opportunityComments.length > 0 && {
    action: "Trả lời công khai câu hỏi 'bên nào uy tín' trong 3 group nội thất lớn nhất",
    why: `${opportunityComments.length} người đang hỏi review ngay tuần này — đây là khách hàng gần chốt đơn`,
  },
  decision.stages.find(s => s.stage === "Hối Tiếc") && {
    action: "Gọi điện 3 khách gần nhất có phản hồi tiêu cực — hỏi thăm và ghi lại",
    why: `${decision.stages.find(s => s.stage === "Hối Tiếc")?.percentage}% tín hiệu là hối tiếc — đang lan truyền trải nghiệm xấu`,
  },
].filter(Boolean) as { action: string; why: string }[];

export default function ReportPage() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "32px 18px 60px", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
          Market Radar · {dateStr}
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>
          Báo Cáo Sáng Nay
        </h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px" }}>
          Phát hiện <strong>{report.totalComments}</strong> tín hiệu thị trường · {report.period.label}
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
          <div key={p.force} style={{ marginBottom: i < painList.length - 1 ? 20 : 0, paddingBottom: i < painList.length - 1 ? 20 : 0, borderBottom: i < painList.length - 1 ? "1px solid #f1f5f9" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 800, color: "#dc2626" }}>{i + 1}.</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{p.force.replace("Rào Cản ", "")}</span>
              <span style={{ fontSize: 12, color: "#64748b", marginLeft: "auto" }}>{p.count} lượt</span>
              {p.trend === "up" && <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>↑ {p.delta}%</span>}
              {p.trend === "new" && <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>★ Mới</span>}
            </div>
            <div style={{ paddingLeft: 30 }}>
              {p.recs.map((r, j) => (
                <div key={j} style={{ fontSize: 13, color: "#334155", marginBottom: 4, display: "flex", gap: 6 }}>
                  <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span> {r}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Block>

      {/* 2. CƠ HỘI LỚN NHẤT */}
      <Block icon="💰" title="Cơ Hội Lớn Nhất" borderColor="#16a34a">
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
          Khách hàng đang hỏi review
        </div>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
          Xuất hiện <strong style={{ color: "#1e293b" }}>{opportunityComments.length + advocacyComments.length} lượt</strong> — đây là nhóm gần chốt đơn nhất
        </div>
        {["Đăng video công trình thực tế ngay tuần này", "Trả lời review công khai trên Facebook / Zalo", "Case study chi tiết 1 công trình gần nhất"].map((r, i) => (
          <div key={i} style={{ fontSize: 13, color: "#334155", marginBottom: 5, display: "flex", gap: 6 }}>
            <span style={{ color: "#16a34a", flexShrink: 0 }}>✓</span> {r}
          </div>
        ))}
      </Block>

      {/* 3. GIAI ĐOẠN MUA */}
      <Block icon="🛒" title="Giai Đoạn Mua" borderColor="#7c3aed">
        <div style={{ display: "grid", gap: 8 }}>
          {decision.stages.map(s => {
            const colors: Record<string, string> = {
              "Sắp Mua": "#16a34a", "Hối Tiếc": "#dc2626",
              "Trước Khi Mua": "#2563eb", "So Sánh": "#ca8a04",
              "Giới Thiệu": "#7c3aed", "Sau Khi Mua": "#0e7490",
            };
            const c = colors[s.stage] || "#64748b";
            return (
              <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 110, fontSize: 13, color: "#475569", flexShrink: 0 }}>{s.stage}</div>
                <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 20, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(s.percentage, 3)}%`, height: "100%", background: c, borderRadius: 4 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c, minWidth: 50, textAlign: "right" }}>
                  {s.percentage}%
                </div>
              </div>
            );
          })}
        </div>
        {decision.stages.find(s => s.stage === "Hối Tiếc" && s.percentage >= 20) && (
          <div style={{ marginTop: 12, background: "#fff1f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#991b1b" }}>
            ⚠️ {decision.stages.find(s => s.stage === "Hối Tiếc")?.percentage}% đang hối tiếc — ưu tiên xử lý trước khi mở rộng marketing
          </div>
        )}
      </Block>

      {/* 4. VIỆC NÊN LÀM HÔM NAY */}
      <div style={{ background: "#0f172a", borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: 0 }}>Việc Nên Làm Hôm Nay</h2>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
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

function Block({ icon, title, borderColor, children }: { icon: string; title: string; borderColor: string; children: React.ReactNode }) {
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
