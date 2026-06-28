"use client";
import { useState } from "react";

const SIGNAL_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  Purchase:       { bg: "#dbeafe", color: "#1d4ed8", label: "Sắp Mua" },
  Pain:           { bg: "#fee2e2", color: "#dc2626", label: "Đang Đau" },
  Desire:         { bg: "#dcfce7", color: "#16a34a", label: "Có Nhu Cầu" },
  Comparing:      { bg: "#fef9c3", color: "#ca8a04", label: "So Sánh" },
  Regret:         { bg: "#fce7f3", color: "#be185d", label: "Hối Tiếc" },
  Recommendation: { bg: "#ede9fe", color: "#6d28d9", label: "Giới Thiệu" },
  Unknown:        { bg: "#f1f5f9", color: "#64748b", label: "Chưa Rõ" },
};

export default function CrawlPage() {
  const [url, setUrl] = useState("");
  const [maxComments, setMaxComments] = useState(50);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState("");

  async function handleCrawl() {
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    setStep("Đang gửi yêu cầu đến Apify...");

    try {
      setStep("Apify đang crawl Facebook — thường mất 1-2 phút...");
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), maxComments }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Crawl thất bại");
      } else {
        setResult(data);
        setStep("");
      }
    } catch (e: any) {
      setError(e.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
      if (!result) setStep("");
    }
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 18px 60px", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>

      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Market Voice AI V2</div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Crawl Dữ Liệu Thật</h1>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Paste link Facebook → hệ thống tự lấy comment và phân tích</p>
        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <a href="/" style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>← Báo cáo đầy đủ</a>
          <a href="/report" style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>📋 Báo cáo CEO</a>
        </div>
      </div>

      {/* INPUT */}
      <div style={{ background: "#fff", borderRadius: 16, padding: "22px 24px", marginBottom: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", display: "block", marginBottom: 6 }}>
            Link bài đăng Facebook
          </label>
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://www.facebook.com/groups/noithat/posts/..."
            style={{
              width: "100%", padding: "10px 14px", fontSize: 13,
              border: "1.5px solid #e2e8f0", borderRadius: 10,
              outline: "none", color: "#1e293b",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>Số comment tối đa:</label>
          {[50, 100, 200].map(n => (
            <button
              key={n}
              onClick={() => setMaxComments(n)}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                border: maxComments === n ? "none" : "1.5px solid #e2e8f0",
                background: maxComments === n ? "#1e40af" : "#fff",
                color: maxComments === n ? "#fff" : "#475569",
              }}
            >{n}</button>
          ))}
        </div>

        <button
          onClick={handleCrawl}
          disabled={loading || !url.trim()}
          style={{
            width: "100%", padding: "12px", borderRadius: 12, fontSize: 14, fontWeight: 700,
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            background: loading ? "#94a3b8" : "#1e40af", color: "#fff",
          }}
        >
          {loading ? "⏳ Đang crawl..." : "🚀 Bắt đầu crawl"}
        </button>

        {step && (
          <div style={{ marginTop: 12, fontSize: 13, color: "#7c3aed", textAlign: "center", fontStyle: "italic" }}>
            {step}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 12, background: "#fff1f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* KẾT QUẢ */}
      {result && (
        <>
          {/* Tổng quan */}
          <div style={{ background: "#0f172a", borderRadius: 16, padding: "20px 24px", marginBottom: 16, color: "#fff" }}>
            <div style={{ fontSize: 11, opacity: 0.5, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>Kết quả crawl</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
              {[
                { label: "Comment lấy được", value: result.totalComments },
                { label: "Đã phân loại", value: result.classifiedCount },
                { label: "Tỷ lệ", value: `${Math.round(result.classifiedCount / result.totalComments * 100)}%` },
              ].map(m => (
                <div key={m.label} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{m.value}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Forces */}
          {result.forceBreakdown?.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", marginBottom: 16, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>🔥 Rào Cản Thị Trường</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {result.forceBreakdown.map((f: any, i: number) => {
                  const colors = ["#1e40af","#15803d","#b45309","#7c3aed","#be185d","#0e7490","#9a3412"];
                  const c = colors[i % colors.length];
                  return (
                    <div key={f.force} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 170, fontSize: 12, color: "#475569", textAlign: "right", flexShrink: 0 }}>{f.force}</div>
                      <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 4, height: 22, overflow: "hidden" }}>
                        <div style={{ width: `${Math.max(f.pct, 2)}%`, height: "100%", background: c, borderRadius: 4, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                          <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{f.count}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", minWidth: 40 }}>{f.pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comment mẫu */}
          {result.comments?.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>💬 Comment Thật Từ Facebook</h2>
              <div style={{ display: "grid", gap: 10 }}>
                {result.comments.map((c: any, i: number) => {
                  const sig = SIGNAL_STYLE[c.signal] || SIGNAL_STYLE.Unknown;
                  return (
                    <div key={i} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, borderLeft: `3px solid ${c.marketForce ? "#3b82f6" : "#e2e8f0"}` }}>
                      <div style={{ fontSize: 13, color: "#1e293b", marginBottom: 8, lineHeight: 1.5 }}>
                        {c.text}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ background: sig.bg, color: sig.color, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>{sig.label}</span>
                        {c.marketForce && (
                          <span style={{ background: "#dbeafe", color: "#1d4ed8", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>⚡ {c.marketForce}</span>
                        )}
                        {c.author && (
                          <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11, padding: "2px 9px", borderRadius: 20 }}>{c.author}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
