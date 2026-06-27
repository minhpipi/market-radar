// ============================================================
// BUSINESS REPORT — Báo cáo CEO đọc trong 3 phút
// Route: /report
// ============================================================

import { loadComments } from "@/src/lib/market-radar/dataLoader";
import { classify } from "@/src/lib/market-radar/classifier";
import { runBusinessQuestionEngine } from "@/src/lib/market-radar/businessQuestionEngine";
import { runDecisionMining } from "@/src/lib/market-radar/decisionEngine";

// ── DATA LAYER ────────────────────────────────────────────────────────────
const loaded = loadComments();
const comments = loaded.map(c => ({ ...c, comment: c.text }));
const classified = comments.map(c => ({ ...c, ...classify(c.text) }));

const previousWeekData: Record<string, number> = {
  "Rào Cản Niềm Tin": 22, "Rào Cản Chất Lượng": 18, "Rào Cản Tài Chính": 12,
};

const report = runBusinessQuestionEngine(classified, {
  periodLabel: "Tuần 20–26/06/2025",
  previousData: previousWeekData,
});

const decision = runDecisionMining(comments.map(c => c.text));

// ── Tính top pain, top opportunity, top actions ───────────────────────────

// Top 3 nỗi đau — force có nhiều Pain signal nhất
const painForces = report.allForces
  .filter(f => {
    const painCount = classified.filter(c =>
      c.marketForce === f.force && c.signal === "Pain"
    ).length;
    return painCount > 0;
  })
  .map(f => ({
    ...f,
    painCount: classified.filter(c => c.marketForce === f.force && c.signal === "Pain").length,
    samples: classified.filter(c => c.marketForce === f.force && c.signal === "Pain").slice(0, 2).map(c => c.text),
  }))
  .sort((a, b) => b.painCount - a.painCount)
  .slice(0, 3);

// Top cơ hội — force có trend "up" hoặc pct cao nhất
const topOpportunity = report.allForces.find(f =>
  f.force === "Rào Cản Bằng Chứng Xã Hội" || f.trend === "up"
) || report.allForces[0];

// Giai đoạn mua đông nhất
const topStage = decision.stages[0];
const regretStage = decision.stages.find(s => s.stage === "Hối Tiếc");
const buyingStage = decision.stages.find(s => s.stage === "Sắp Mua");

// 3 hành động ưu tiên — lấy từ force có pct cao nhất + trend up
const topActions: { icon: string; action: string; why: string }[] = [];

const topForceData = report.answers
  .flatMap(a => a.findings)
  .sort((a, b) => b.count - a.count);

if (topForceData[0]) {
  topActions.push({
    icon: "1",
    action: topForceData[0].recommendation.find(r => !r.startsWith("⚡")) || topForceData[0].recommendation[1],
    why: `${topForceData[0].force} chiếm ${topForceData[0].percentage}% tín hiệu tuần này`,
  });
}
if (topForceData[1]) {
  topActions.push({
    icon: "2",
    action: topForceData[1].recommendation.find(r => !r.startsWith("⚡")) || topForceData[1].recommendation[1],
    why: `${topForceData[1].force} ${topForceData[1].trend === "up" ? `tăng ${topForceData[1].trendDelta}% so kỳ trước` : "đang ảnh hưởng đến quyết định mua"}`,
  });
}
if (regretStage && regretStage.percentage >= 20) {
  topActions.push({
    icon: "3",
    action: "Gọi điện cho 3 khách gần nhất gặp vấn đề — hỏi thăm và ghi lại phản hồi",
    why: `${regretStage.percentage}% khách đang hối tiếc — mỗi người này đang ảnh hưởng 10-20 người khác`,
  });
} else if (topForceData[2]) {
  topActions.push({
    icon: "3",
    action: topForceData[2].recommendation.find(r => !r.startsWith("⚡")) || topForceData[2].recommendation[1],
    why: `${topForceData[2].force} ${topForceData[2].trend === "new" ? "mới xuất hiện — cần theo dõi ngay" : `chiếm ${topForceData[2].percentage}%`}`,
  });
}

export default function ReportPage() {
  const today = new Date().toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <main style={{
      maxWidth: 720,
      margin: "0 auto",
      padding: "40px 20px 80px",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      background: "#f8fafc",
      minHeight: "100vh",
    }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, letterSpacing: 1 }}>
          MARKET VOICE AI V2 · {today.toUpperCase()}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>
          Báo Cáo Thị Trường Tuần Này
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
          Phân tích {report.totalComments} tín hiệu · {report.period.label}
        </p>

        <a href="/" style={{
          display: "inline-block", marginTop: 12,
          fontSize: 12, color: "#3b82f6", textDecoration: "none",
        }}>
          ← Xem báo cáo chi tiết
        </a>
      </div>

      {/* ── KEY INSIGHT ── */}
      <div style={{
        background: "#0f172a", color: "#fff",
        borderRadius: 16, padding: "20px 24px", marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>
          Điều quan trọng nhất tuần này
        </div>
        <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.65 }}>
          {decision.keyInsight}
        </div>
      </div>

      {/* ── SECTION 1: NỖI ĐAU LỚN NHẤT ── */}
      <Section icon="🔥" title="Nỗi Đau Lớn Nhất" color="#dc2626" bg="#fff">
        {painForces.map((f, i) => (
          <div key={f.force} style={{
            paddingBottom: 16, marginBottom: 16,
            borderBottom: i < painForces.length - 1 ? "1px solid #f1f5f9" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{
                background: "#fee2e2", color: "#dc2626",
                fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20,
              }}>
                {f.force}
              </span>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {f.painCount} người đang gặp phải
              </span>
              {f.trend === "up" && (
                <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>
                  ↑ Tăng {f.delta}%
                </span>
              )}
            </div>
            <div style={{ display: "grid", gap: 5, marginBottom: 10 }}>
              {f.samples.map((s, j) => (
                <div key={j} style={{
                  fontSize: 13, color: "#475569", fontStyle: "italic",
                  background: "#f8fafc", borderRadius: 8, padding: "7px 12px",
                  borderLeft: "3px solid #fca5a5",
                }}>
                  "{s}"
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              <strong style={{ color: "#dc2626" }}>Phải làm ngay:</strong>{" "}
              {f.force === "Rào Cản Chất Lượng" && "Quay video test chống ẩm + đăng case study công trình 2 năm tuổi"}
              {f.force === "Rào Cản Niềm Tin" && "Đăng 3 video review khách hàng thật ngay tuần này"}
              {f.force === "Rào Cản Hậu Mãi" && "Gọi điện cho khách đang gặp vấn đề trong 24h"}
              {f.force === "Rào Cản Tài Chính" && "Công bố bảng giá tham khảo trên Facebook"}
              {f.force === "Rào Cản Tiến Độ" && "Cam kết tiến độ rõ ràng và gửi cập nhật hàng ngày"}
              {!["Rào Cản Chất Lượng","Rào Cản Niềm Tin","Rào Cản Hậu Mãi","Rào Cản Tài Chính","Rào Cản Tiến Độ"].includes(f.force) && "Tạo nội dung trả lời trực tiếp nỗi lo này"}
            </div>
          </div>
        ))}
      </Section>

      {/* ── SECTION 2: CƠ HỘI LỚN NHẤT ── */}
      <Section icon="💰" title="Cơ Hội Lớn Nhất" color="#16a34a" bg="#fff">
        {(() => {
          const socialProof = classified.filter(c => c.signal === "Recommendation");
          const buying = classified.filter(c =>
            c.signal === "Purchase" && c.marketForce === "Rào Cản Niềm Tin"
          );
          return (
            <div>
              <div style={{ fontSize: 14, color: "#1e293b", marginBottom: 12, lineHeight: 1.65 }}>
                <strong>{buying.length + socialProof.length} người</strong> đang hỏi review và tìm đơn vị uy tín —
                đây là khách hàng đã sẵn sàng mua, chỉ cần thêm bằng chứng để quyết định.
              </div>
              <div style={{ display: "grid", gap: 5, marginBottom: 14 }}>
                {[...buying, ...socialProof].slice(0, 3).map((c, i) => (
                  <div key={i} style={{
                    fontSize: 13, color: "#475569", fontStyle: "italic",
                    background: "#f0fdf4", borderRadius: 8, padding: "7px 12px",
                    borderLeft: "3px solid #86efac",
                  }}>
                    "{c.text}"
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  "Đăng video công trình thực tế — quay tại nhà khách, không cần chỉnh sửa",
                  "Trả lời công khai câu hỏi 'bên nào uy tín' trong group nội thất ngay hôm nay",
                  "Xin phép 3 khách hài lòng gần nhất quay 30 giây video review",
                ].map((rec, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#14532d" }}>
                    <span style={{
                      minWidth: 20, height: 20, background: "#16a34a", color: "#fff",
                      borderRadius: "50%", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1,
                    }}>{i + 1}</span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Section>

      {/* ── SECTION 3: KHÁCH Ở ĐÂU TRONG HÀNH TRÌNH ── */}
      <Section icon="🧭" title="Khách Hàng Đang Ở Bước Nào?" color="#7c3aed" bg="#fff">
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {decision.stages.map(s => {
            const stageColor: Record<string, string> = {
              "Sắp Mua": "#16a34a",
              "Hối Tiếc": "#dc2626",
              "Trước Khi Mua": "#2563eb",
              "So Sánh": "#ca8a04",
              "Giới Thiệu": "#7c3aed",
              "Sau Khi Mua": "#0e7490",
            };
            const color = stageColor[s.stage] || "#64748b";
            return (
              <div key={s.stage} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 120, fontSize: 13, fontWeight: 600, color: "#1e293b", flexShrink: 0 }}>
                  {s.stage}
                </div>
                <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 6, height: 24, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(s.percentage, 3)}%`, height: "100%", background: color, borderRadius: 6, opacity: 0.85 }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color, minWidth: 60 }}>
                  {s.count} · {s.percentage}%
                </div>
              </div>
            );
          })}
        </div>

        {buyingStage && (
          <div style={{
            background: "#f0fdf4", border: "1px solid #86efac",
            borderRadius: 10, padding: "12px 16px", marginBottom: 10, fontSize: 13, color: "#14532d",
          }}>
            💡 <strong>{buyingStage.percentage}% đang hỏi giá</strong> — phản hồi trong 2 giờ có thể chốt đơn ngay.
          </div>
        )}
        {regretStage && regretStage.percentage >= 20 && (
          <div style={{
            background: "#fff1f2", border: "1px solid #fca5a5",
            borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#991b1b",
          }}>
            ⚠️ <strong>{regretStage.percentage}% đang hối tiếc</strong> — đây là rủi ro lan truyền trải nghiệm xấu trên mạng.
          </div>
        )}
      </Section>

      {/* ── SECTION 4: 3 HÀNH ĐỘNG LÀM NGAY ── */}
      <div style={{
        background: "#0f172a", borderRadius: 18, padding: "24px 28px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 22 }}>✅</span>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: 0 }}>
            3 Hành Động Làm Ngay Tuần Này
          </h2>
        </div>
        <div style={{ display: "grid", gap: 14 }}>
          {topActions.map((a, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.07)",
              borderRadius: 12, padding: "16px 18px",
              borderLeft: "3px solid #3b82f6",
            }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{
                  minWidth: 28, height: 28, background: "#3b82f6", color: "#fff",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", lineHeight: 1.5, marginBottom: 4 }}>
                    {a.action}
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Vì sao: {a.why}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, marginTop: 40 }}>
        Market Voice AI V2 · Báo cáo tự động từ {report.totalComments} tín hiệu thị trường
        <br />
        <a href="/" style={{ color: "#3b82f6", textDecoration: "none", marginTop: 6, display: "inline-block" }}>
          Xem phân tích đầy đủ →
        </a>
      </div>

    </main>
  );
}

// ── Component helper ──────────────────────────────────────────────────────
function Section({
  icon, title, color, bg, children,
}: {
  icon: string; title: string; color: string; bg: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: bg, borderRadius: 18, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20,
    }}>
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid #f1f5f9",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0f172a", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: "20px 24px" }}>{children}</div>
    </div>
  );
}
