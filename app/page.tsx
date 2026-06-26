import { classify } from "@/src/lib/market-radar/classifier";
import { runBusinessQuestionEngine } from "@/src/lib/market-radar/businessQuestionEngine";
import { runDecisionMining } from "@/src/lib/market-radar/decisionEngine";
import { stageColors, stageDescriptions, DecisionStage } from "@/src/lib/market-radar/decisionStages";
import { RawComment, DynamicFinding } from "@/src/lib/market-radar/types";

// ── Dữ liệu ──────────────────────────────────────────────────────────────
const rawComments: RawComment[] = [
  { id: 1,  comment: "Tủ bếp bên nào làm tốt vậy mọi người?",                    source: "facebook", date: "2025-06-20" },
  { id: 2,  comment: "Xin review đơn vị làm tủ bếp uy tín",                       source: "facebook", date: "2025-06-20" },
  { id: 3,  comment: "Tủ nhà mình bị mốc sau 2 năm, xử lý thế nào?",             source: "facebook", date: "2025-06-21" },
  { id: 4,  comment: "Tủ bếp bị ngấm nước từ dưới lên, hỏng hết rồi",            source: "zalo",     date: "2025-06-21" },
  { id: 5,  comment: "Đơn vị nào thi công tốt khu vực Thanh Hóa?",               source: "facebook", date: "2025-06-21" },
  { id: 6,  comment: "Xin review công ty nội thất làm tủ bếp đẹp",               source: "tiktok",   date: "2025-06-22" },
  { id: 7,  comment: "Tủ MDF có nhanh hỏng không hay dùng picomat?",              source: "facebook", date: "2025-06-22" },
  { id: 8,  comment: "Có loại nào chống ẩm tốt cho nhà bếp không?",              source: "facebook", date: "2025-06-22" },
  { id: 9,  comment: "Giá làm tủ bếp hiện nay khoảng bao nhiêu một mét?",        source: "google",   date: "2025-06-22" },
  { id: 10, comment: "Nội thất Đại Phát làm có ổn không mọi người?",              source: "facebook", date: "2025-06-23" },
  { id: 11, comment: "MDF hay nhựa picomat thì tốt hơn cho bếp gia đình?",        source: "facebook", date: "2025-06-23" },
  { id: 12, comment: "Nên chọn loại tủ nào cho nhà bếp nhỏ 8m2?",               source: "zalo",     date: "2025-06-23" },
  { id: 13, comment: "Bếp nhà mình bị phồng rộp sau 1 năm, cánh bị vênh hết",    source: "facebook", date: "2025-06-23" },
  { id: 14, comment: "Rất hài lòng với công trình, sẽ giới thiệu cho bạn bè",    source: "google",   date: "2025-06-24" },
  { id: 15, comment: "Thất vọng quá, tủ xuống cấp nhanh chóng mặt",              source: "facebook", date: "2025-06-24" },
  { id: 16, comment: "Báo giá tủ bếp cho căn bếp 15m2 được không ạ?",           source: "zalo",     date: "2025-06-24" },
  { id: 17, comment: "Chi phí làm tủ bếp toàn bộ khoảng bao nhiêu tiền?",        source: "facebook", date: "2025-06-24" },
  { id: 18, comment: "Gỗ tự nhiên có bền hơn MDF không hay chỉ đẹp hơn?",        source: "tiktok",   date: "2025-06-25" },
  { id: 19, comment: "Biết thế dùng nhựa picomat cho xong, MDF ẩm là hỏng",      source: "facebook", date: "2025-06-25" },
  { id: 20, comment: "Đơn vị có uy tín không? Mình sắp ký hợp đồng rồi",         source: "zalo",     date: "2025-06-25" },
  { id: 21, comment: "Tủ mới làm 8 tháng mà cánh đã cong, bản lề bị xệ",        source: "facebook", date: "2025-06-25" },
  { id: 22, comment: "Bảo hành bao lâu vậy? Có lo gì không nếu bị lỗi?",         source: "zalo",     date: "2025-06-25" },
  { id: 23, comment: "Ai dùng rồi cho mình xin đánh giá thật với",               source: "facebook", date: "2025-06-26" },
  { id: 24, comment: "Chậm tiến độ quá, hẹn 10 ngày mà 3 tuần chưa xong",       source: "facebook", date: "2025-06-26" },
  { id: 25, comment: "Không liên lạc được sau khi bàn giao, gọi không bắt máy",  source: "google",   date: "2025-06-26" },
];

const previousWeekData: Record<string, number> = {
  "Rào Cản Niềm Tin": 22, "Rào Cản Chất Lượng": 18, "Rào Cản Tài Chính": 12,
};

const SOURCE_LABEL: Record<string, string> = {
  facebook: "Facebook", zalo: "Zalo", tiktok: "TikTok", google: "Google Maps",
};

const SIGNAL_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  Purchase:       { bg: "#dbeafe", color: "#1d4ed8", label: "Sắp Mua" },
  Pain:           { bg: "#fee2e2", color: "#dc2626", label: "Đang Đau" },
  Desire:         { bg: "#dcfce7", color: "#16a34a", label: "Có Nhu Cầu" },
  Comparing:      { bg: "#fef9c3", color: "#ca8a04", label: "So Sánh" },
  Regret:         { bg: "#fce7f3", color: "#be185d", label: "Hối Tiếc" },
  Switching:      { bg: "#f3e8ff", color: "#7c3aed", label: "Muốn Đổi" },
  Recommendation: { bg: "#ede9fe", color: "#6d28d9", label: "Giới Thiệu" },
  Unknown:        { bg: "#f1f5f9", color: "#64748b", label: "Chưa Rõ" },
};

const Q_ICON: Record<string, string> = {
  purchase: "🚀", revenue: "⚠️", fear: "😨", trust: "🛡️", switching: "🔄",
};

const TREND_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  up:     { icon: "↑", color: "#dc2626", bg: "#fee2e2" },
  down:   { icon: "↓", color: "#16a34a", bg: "#dcfce7" },
  new:    { icon: "★", color: "#7c3aed", bg: "#ede9fe" },
  stable: { icon: "→", color: "#64748b", bg: "#f1f5f9" },
};

function TrendBadge({ trend, delta }: { trend: string; delta: number | null }) {
  const s = TREND_STYLE[trend] || TREND_STYLE.stable;
  const label = trend === "new" ? "Mới" : trend === "up" ? `+${delta}%` : trend === "down" ? `-${delta}%` : "Ổn định";
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>
      {s.icon} {label}
    </span>
  );
}

function FindingCard({ f }: { f: DynamicFinding }) {
  return (
    <div style={{ padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20 }}>{f.force}</span>
        <span style={{ background: "#f1f5f9", color: "#475569", fontSize: 12, padding: "3px 12px", borderRadius: 20 }}>{f.count} tín hiệu · {f.percentage}%</span>
        <TrendBadge trend={f.trend} delta={f.trendDelta} />
      </div>
      <div style={{ display: "grid", gap: 9 }}>
        <Block color="#94a3b8" bg="#f8fafc" label="QUAN SÁT">{f.observation}</Block>
        <div style={{ background: "#eff6ff", borderLeft: "3px solid #3b82f6", borderRadius: "0 10px 10px 0", padding: "12px 15px" }}>
          <Label color="#3b82f6">BẰNG CHỨNG</Label>
          <div style={{ fontSize: 13, color: "#1e3a5f", lineHeight: 1.65, marginBottom: 10 }}>{f.evidence}</div>
          <div style={{ display: "grid", gap: 5 }}>
            {f.sampleComments.map((c, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "7px 11px", fontSize: 12, color: "#1e40af", fontStyle: "italic" }}>
                "{c}"
              </div>
            ))}
          </div>
        </div>
        <Block color="#f97316" bg="#fff7ed" label="KHOẢNG CÁCH KINH DOANH">{f.businessGap}</Block>
        <div style={{ background: "#f0fdf4", borderLeft: "3px solid #16a34a", borderRadius: "0 10px 10px 0", padding: "12px 15px" }}>
          <Label color="#16a34a">KHUYẾN NGHỊ HÀNH ĐỘNG</Label>
          <div style={{ display: "grid", gap: 7 }}>
            {f.recommendation.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 13, color: "#14532d", lineHeight: 1.55 }}>
                {r.startsWith("⚡") ? (
                  <div style={{ fontWeight: 700, color: "#dc2626", background: "#fee2e2", borderRadius: 8, padding: "4px 10px", width: "100%" }}>{r}</div>
                ) : (
                  <>
                    <span style={{ minWidth: 19, height: 19, background: "#16a34a", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                    {r}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Block({ color, bg, label, children }: { color: string; bg: string; label: string; children: React.ReactNode }) {
  return (
    <div style={{ background: bg, borderLeft: `3px solid ${color}`, borderRadius: "0 10px 10px 0", padding: "12px 15px" }}>
      <Label color={color}>{label}</Label>
      <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function Label({ color, children }: { color: string; children: React.ReactNode }) {
  return <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 5 }}>{children}</div>;
}

export default function Home() {

  const classified = rawComments.map(raw => ({ ...raw, ...classify(raw.comment) }));

  const report = runBusinessQuestionEngine(classified, {
    periodLabel: "Tuần 20–26/06/2025",
    previousData: previousWeekData,
  });

  // Decision Mining
  const decisionResult = runDecisionMining(rawComments.map(r => r.comment));

  const sourceCount: Record<string, number> = {};
  rawComments.forEach(c => { const s = c.source || "unknown"; sourceCount[s] = (sourceCount[s] || 0) + 1; });

  // Màu funnel cho từng stage
  const funnelWidth = [100, 85, 70, 55, 40, 30];

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 18px 80px", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f0f4f8", minHeight: "100vh" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e40af 100%)", borderRadius: 20, padding: "30px 34px", marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5 }}>Market Voice AI V2</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px" }}>Báo Cáo Quyết Định Kinh Doanh</h1>
        <p style={{ fontSize: 13, opacity: 0.7, margin: "0 0 22px" }}>Ngành Nội Thất · {report.period.label}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { label: "Tín hiệu phân tích", value: report.totalComments },
            { label: "Tỷ lệ phân loại", value: `${report.classificationRate}%` },
            { label: "Câu hỏi trả lời được", value: `${report.answers.length}/5` },
            { label: "Rào cản phát hiện", value: report.allForces.length },
          ].map(m => (
            <div key={m.label} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "13px 16px" }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>{m.value}</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{m.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 7, marginTop: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, opacity: 0.55, alignSelf: "center" }}>Nguồn:</span>
          {Object.entries(sourceCount).map(([src, cnt]) => (
            <span key={src} style={{ background: "rgba(255,255,255,0.14)", fontSize: 11, padding: "2px 11px", borderRadius: 20 }}>
              {SOURCE_LABEL[src] || src} ({cnt})
            </span>
          ))}
        </div>
      </div>

      {/* ── KEY INSIGHT ── */}
      <div style={{ background: "#1e293b", borderRadius: 16, padding: "18px 24px", marginBottom: 20, color: "#fff" }}>
        <div style={{ fontSize: 11, opacity: 0.55, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Insight Quan Trọng Nhất Tuần Này</div>
        <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.6 }}>{decisionResult.keyInsight}</div>
      </div>

      {/* ── DECISION MINING — PHẦN MỚI ── */}
      <div style={{ background: "#fff", borderRadius: 18, padding: "24px 28px", marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 6px" }}>
          🧭 Decision Mining — Khách Hàng Đang Ở Bước Nào?
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px" }}>
          {decisionResult.classified}/{decisionResult.total} tín hiệu được phân loại ({decisionResult.classificationRate}%)
        </p>

        {/* Funnel bars */}
        <div style={{ display: "grid", gap: 12, marginBottom: 28 }}>
          {decisionResult.stages.map((s, i) => {
            const sc = stageColors[s.stage as DecisionStage];
            const barPct = Math.max(s.percentage, 4);
            return (
              <div key={s.stage}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 130, fontSize: 12, fontWeight: 600, color: "#1e293b", flexShrink: 0 }}>{s.stage}</div>
                  <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 6, height: 28, overflow: "hidden", position: "relative" }}>
                    <div style={{
                      width: `${barPct}%`, height: "100%",
                      background: sc.color, opacity: 0.85, borderRadius: 6,
                      display: "flex", alignItems: "center", paddingLeft: 10,
                      transition: "width 0.5s",
                    }}>
                      <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
                        {s.count} · {s.percentage}%
                      </span>
                    </div>
                  </div>
                  <span style={{
                    background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                    fontSize: 11, padding: "2px 10px", borderRadius: 20, flexShrink: 0,
                  }}>
                    {stageDescriptions[s.stage as DecisionStage]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stage cards với insight + comment mẫu */}
        <div style={{ display: "grid", gap: 14 }}>
          {decisionResult.stages.map(s => {
            const sc = stageColors[s.stage as DecisionStage];
            return (
              <div key={s.stage} style={{
                border: `1px solid ${sc.border}`, borderRadius: 14,
                overflow: "hidden",
              }}>
                {/* Stage header */}
                <div style={{ background: sc.bg, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: sc.color }}>{s.stage}</span>
                    <span style={{ fontSize: 12, color: "#64748b", marginLeft: 10 }}>{s.count} tín hiệu · {s.percentage}%</span>
                  </div>
                </div>

                {/* Insight */}
                <div style={{ padding: "12px 18px 10px", borderBottom: `1px solid ${sc.border}` }}>
                  <div style={{ fontSize: 13, color: "#1e293b", lineHeight: 1.6 }}>{s.insight}</div>
                </div>

                {/* Comment mẫu */}
                <div style={{ padding: "10px 18px 14px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>
                    Comment mẫu
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    {s.comments.map((c, i) => (
                      <div key={i} style={{
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: 8, padding: "7px 12px",
                        fontSize: 12, color: "#475569", fontStyle: "italic",
                      }}>
                        "{c}"
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unclassified */}
        {decisionResult.unclassified.length > 0 && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f8fafc", borderRadius: 10, border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
              {decisionResult.unclassified.length} comment chưa phân loại được — cần mở rộng từ điển:
            </div>
            {decisionResult.unclassified.map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>· {c}</div>
            ))}
          </div>
        )}
      </div>

      {/* ── CẢNH BÁO RÀO CẢN LỚN NHẤT ── */}
      {report.topForce && (
        <div style={{ background: "#fff7ed", border: "2px solid #f97316", borderRadius: 16, padding: "16px 22px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
          <div style={{ fontSize: 26, flexShrink: 0 }}>🔥</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#ea580c", letterSpacing: 1, marginBottom: 3 }}>RÀO CẢN LỚN NHẤT TUẦN NÀY</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#1e293b" }}>{report.topForce}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
              {report.topForceCount}/{report.totalComments} tín hiệu ({report.topForcePct}%) — đang làm mất đơn hàng nhiều nhất.
            </div>
          </div>
        </div>
      )}

      {/* ── PHÂN BỔ RÀO CẢN ── */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>📊 Phân Bổ Rào Cản Thị Trường</h2>
        <div style={{ display: "grid", gap: 9 }}>
          {report.allForces.map((f, i) => {
            const colors = ["#1e40af","#15803d","#b45309","#7c3aed","#be185d","#0e7490","#9a3412","#166534"];
            const c = colors[i % colors.length];
            return (
              <div key={f.force} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 170, fontSize: 12, color: "#475569", textAlign: "right", flexShrink: 0 }}>{f.force}</div>
                <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 20, overflow: "hidden" }}>
                  <div style={{ width: `${f.pct}%`, background: c, height: "100%", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 110 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{f.count} · {f.pct}%</span>
                  <TrendBadge trend={f.trend} delta={f.delta} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5 CÂU HỎI KINH DOANH ── */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "28px 0 14px" }}>
        📋 Báo Cáo Theo 5 Câu Hỏi Kinh Doanh
      </h2>

      {report.answers.map(answer => (
        <div key={answer.slug} style={{ background: "#fff", borderRadius: 18, marginBottom: 20, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ background: "#0f172a", padding: "14px 24px", color: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{Q_ICON[answer.slug]}</span>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{answer.question}</span>
          </div>
          {answer.findings.map((f, i) => <FindingCard key={i} f={f} />)}
        </div>
      ))}

      {/* ── PHÂN TÍCH TỪNG TÍN HIỆU ── */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "28px 0 14px" }}>
        🔬 Phân Tích Từng Tín Hiệu
      </h2>

      <div style={{ background: "#fff", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        {classified.map((item, idx) => {
          const sig = SIGNAL_STYLE[item.signal] || SIGNAL_STYLE.Unknown;
          const hasForce = !!item.marketForce;
          const dec = { stage: null, matchedKeyword: null };
          return (
            <div key={idx} style={{
              padding: "13px 18px",
              borderBottom: idx < classified.length - 1 ? "1px solid #f1f5f9" : "none",
              borderLeft: `3px solid ${hasForce ? "#3b82f6" : "#e2e8f0"}`,
            }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ color: "#cbd5e1", fontSize: 11, minWidth: 20, marginTop: 3, textAlign: "right" }}>{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#1e293b", marginBottom: 7, lineHeight: 1.5 }}>💬 {item.comment}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    <span style={{ background: sig.bg, color: sig.color, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>{sig.label}</span>
                    {item.source && <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, padding: "2px 9px", borderRadius: 20 }}>{SOURCE_LABEL[item.source] || item.source}</span>}
                    {item.date && <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, padding: "2px 9px", borderRadius: 20 }}>{item.date}</span>}
                    {item.marketForce && <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>⚡ {item.marketForce}</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 50, color: "#94a3b8", fontSize: 12 }}>
        Market Voice AI V2 · Tiếng nói thị trường → Giai đoạn quyết định → Bằng chứng → Hành động
      </div>
    </main>
  );
}
