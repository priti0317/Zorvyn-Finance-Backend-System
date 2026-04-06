"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ExpenseChart from "@/app/components/ExpenseChart";

// ─── GLOBAL STYLES ───────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #13131a;
    --surface-2: #1c1c27;
    --border: rgba(255,255,255,0.07);
    --accent: #6c63ff;
    --accent-2: #ff6584;
    --accent-3: #43e8d8;
    --text-primary: #f0f0f8;
    --text-secondary: #7b7b9a;
    --income: #43e8d8;
    --expense: #ff6584;
    --balance: #a78bfa;
    --radius: 16px;
    --shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  body { background: var(--bg); color: var(--text-primary); font-family: 'DM Sans', sans-serif; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { box-shadow: 0 0 0 0 rgba(108,99,255,0.35); }
    70%  { box-shadow: 0 0 0 12px rgba(108,99,255,0); }
    100% { box-shadow: 0 0 0 0 rgba(108,99,255,0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes barGrow {
    from { transform: scaleY(0); }
    to   { transform: scaleY(1); }
  }
  @keyframes lineDrawIn {
    from { stroke-dashoffset: 1000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }

  .fade-up { animation: fadeUp 0.45s ease both; }
  .fade-up-1 { animation: fadeUp 0.45s 0.05s ease both; }
  .fade-up-2 { animation: fadeUp 0.45s 0.10s ease both; }
  .fade-up-3 { animation: fadeUp 0.45s 0.15s ease both; }
  .fade-up-4 { animation: fadeUp 0.45s 0.20s ease both; }

  .bar-animate {
    transform-origin: bottom;
    animation: barGrow 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
  }

  .chart-line {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: lineDrawIn 1.2s ease forwards;
  }
`;

// ─── SKELETON ────────────────────────────────────────────────────────────────
function Skeleton({ w = "100%", h = 20 }: { w?: string | number; h?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: 8,
      background: "linear-gradient(90deg, #1c1c27 25%, #25253a 50%, #1c1c27 75%)",
      backgroundSize: "400px 100%",
      animation: "shimmer 1.4s infinite",
    }} />
  );
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ title, value, accent, delay = 0 }: { title: string; value: number; accent?: string; delay?: number }) {
  const color = accent || "var(--text-primary)";
  return (
    <div className="fade-up" style={{
      animationDelay: `${delay}s`, flex: 1, minWidth: 140,
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "20px 22px",
      position: "relative", overflow: "hidden", transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.5)`; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
    >
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: color, opacity: 0.06, filter: "blur(30px)", pointerEvents: "none" }} />
      <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 10 }}>{title}</p>
      <p style={{ fontSize: 26, fontFamily: "'Syne', sans-serif", fontWeight: 700, color }}>₹{(value || 0).toLocaleString("en-IN")}</p>
    </div>
  );
}

// ─── ACTIVITY ROW ────────────────────────────────────────────────────────────
function ActivityRow({ r, idx }: { r: any; idx: number }) {
  const isExpense = r.type === "expense";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
      borderRadius: 10, background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(108,99,255,0.06)")}
      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent")}
    >
      <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isExpense ? "rgba(255,101,132,0.12)" : "rgba(67,232,216,0.12)", fontSize: 16, flexShrink: 0 }}>
        {isExpense ? "↑" : "↓"}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: "var(--text-primary)" }}>{isExpense ? "Spent" : "Received"}{r.category ? ` on ${r.category}` : ""}</p>
        <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{new Date(r.date).toLocaleString()}</p>
      </div>
      <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, color: isExpense ? "var(--expense)" : "var(--income)" }}>
        {isExpense ? "−" : "+"}₹{(r.amount || 0).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative", maxWidth: 340 }}>
      <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", fontSize: 15, pointerEvents: "none" }}>🔍</span>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="Search by email…"
        style={{ width: "100%", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px 10px 40px", color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
        onFocus={e => (e.target.style.borderColor = "var(--accent)")}
        onBlur={e => (e.target.style.borderColor = "var(--border)")}
      />
    </div>
  );
}

// ─── PAGINATION ──────────────────────────────────────────────────────────────
const PAGE_SIZE = 5;
function Pagination({ total, page, onPage }: { total: number; page: number; onPage: (p: number) => void }) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", marginTop: 24 }}>
      <PagBtn label="←" disabled={page === 0} onClick={() => onPage(page - 1)} />
      {Array.from({ length: pages }).map((_, i) => <PagBtn key={i} label={String(i + 1)} active={i === page} onClick={() => onPage(i)} />)}
      <PagBtn label="→" disabled={page === pages - 1} onClick={() => onPage(page + 1)} />
    </div>
  );
}
function PagBtn({ label, active, disabled, onClick }: any) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: 36, height: 36, borderRadius: 8, border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)", background: active ? "rgba(108,99,255,0.18)" : "var(--surface)", color: active ? "#fff" : disabled ? "var(--text-secondary)" : "var(--text-primary)", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 13, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.15s", opacity: disabled ? 0.4 : 1 }}>
      {label}
    </button>
  );
}

// ─── MONTHLY VS YEARLY COMPARISON CHART ─────────────────────────────────────
function ComparisonChart({ monthly, yearly }: { monthly: { income: number; expense: number; balance: number }; yearly: { income: number; expense: number; balance: number } }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const maxVal = Math.max(monthly.income, monthly.expense, yearly.income / 12, yearly.expense / 12, 1);

  const metrics = [
    { key: "income",  label: "Income",  mVal: monthly.income,  yVal: yearly.income / 12,  color: "#43e8d8", icon: "↑" },
    { key: "expense", label: "Expense", mVal: monthly.expense, yVal: yearly.expense / 12, color: "#ff6584", icon: "↑" },
    { key: "balance", label: "Balance", mVal: monthly.balance, yVal: yearly.balance / 12, color: "#a78bfa", icon: "≈" },
  ];

  const pct = (v: number) => Math.max(0, Math.min(100, (Math.abs(v) / maxVal) * 100));

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(108,99,255,0.04) 0%, rgba(255,101,132,0.03) 100%)",
      border: "1px solid var(--border)", borderRadius: "var(--radius)",
      padding: "24px", marginBottom: 20,
      position: "relative", overflow: "hidden",
    }}>
      {/* decorative grid lines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, position: "relative" }}>
        <div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: "-0.2px" }}>Monthly vs Yearly Avg</p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>Yearly values normalised to per-month</p>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {[{ c: "rgba(255,255,255,0.35)", l: "Monthly" }, { c: "rgba(255,255,255,0.12)", l: "Yearly avg" }].map(({ c, l }) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 24, height: 8, borderRadius: 4, background: c }} />
              <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>
        {metrics.map((m, mi) => {
          const isHov = hovered === m.key;
          return (
            <div key={m.key} onMouseEnter={() => setHovered(m.key)} onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default", transition: "opacity 0.2s", opacity: hovered && !isHov ? 0.4 : 1 }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, boxShadow: isHov ? `0 0 10px ${m.color}` : "none", transition: "box-shadow 0.2s" }} />
                  <span style={{ fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 600, color: isHov ? m.color : "var(--text-primary)", transition: "color 0.2s" }}>{m.label}</span>
                </div>
                <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Month: <b style={{ color: m.color, fontFamily: "'Syne', sans-serif" }}>₹{m.mVal.toLocaleString("en-IN")}</b></span>
                  <span style={{ color: "var(--text-secondary)" }}>Yr avg: <b style={{ color: m.color, fontFamily: "'Syne', sans-serif", opacity: 0.7 }}>₹{Math.round(m.yVal).toLocaleString("en-IN")}</b></span>
                </div>
              </div>

              {/* dual bar */}
              <div style={{ position: "relative", height: 28 }}>
                {/* yearly avg bar (background) */}
                <div style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  height: 18, width: `${pct(m.yVal)}%`,
                  background: `${m.color}20`,
                  borderRadius: 4,
                  border: `1px solid ${m.color}35`,
                  transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                  animationDelay: `${mi * 0.12}s`,
                }} />
                {/* monthly bar (foreground) */}
                <div style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  height: 24, width: `${pct(m.mVal)}%`,
                  background: `linear-gradient(90deg, ${m.color}cc, ${m.color})`,
                  borderRadius: 4,
                  boxShadow: isHov ? `0 0 16px ${m.color}66` : "none",
                  transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s",
                  animationDelay: `${mi * 0.12 + 0.1}s`,
                }}>
                  {/* shimmer overlay */}
                  <div style={{ position: "absolute", inset: 0, borderRadius: 4, background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)", backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
                </div>
                {/* difference marker */}
                {Math.abs(m.mVal - m.yVal) > 0 && (
                  <div style={{
                    position: "absolute", left: `${Math.min(pct(m.mVal), pct(m.yVal))}%`,
                    top: "50%", transform: "translateY(-50%)",
                    width: `${Math.abs(pct(m.mVal) - pct(m.yVal))}%`,
                    height: 2,
                    background: m.mVal > m.yVal ? `${m.color}88` : "rgba(255,255,255,0.15)",
                    borderRight: `2px dashed ${m.color}88`,
                    opacity: isHov ? 1 : 0,
                    transition: "opacity 0.2s",
                  }} />
                )}
              </div>

              {/* delta chip */}
              {isHov && (
                <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                  {(() => {
                    const diff = m.mVal - m.yVal;
                    const sign = diff >= 0 ? "+" : "";
                    const col = m.key === "expense" ? (diff > 0 ? "#ff6584" : "#43e8d8") : (diff >= 0 ? "#43e8d8" : "#ff6584");
                    return (
                      <span style={{ fontSize: 11, padding: "2px 10px", borderRadius: 20, background: `${col}15`, border: `1px solid ${col}40`, color: col, fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
                        {sign}₹{Math.abs(diff).toLocaleString("en-IN")} vs yearly avg
                      </span>
                    );
                  })()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── INCOME-SCALED EXPENSE CHART ─────────────────────────────────────────────
function ScaledExpenseChart({ categoryData, monthlyIncome }: { categoryData: Record<string, number>; monthlyIncome: number }) {
  const [hovered, setHovered] = useState<string | null>(null);

  if (!categoryData || Object.keys(categoryData).length === 0) return null;

  const entries = Object.entries(categoryData).sort((a, b) => b[1] - a[1]);
  const totalExpense = entries.reduce((s, [, v]) => s + v, 0);
  const safeIncome = monthlyIncome || totalExpense * 1.5 || 1;

  // income is the 100% ceiling
  const pct = (v: number) => Math.min(100, (v / safeIncome) * 100);
  const spendPct = Math.min(100, (totalExpense / safeIncome) * 100);

  const palette = ["#43e8d8", "#a78bfa", "#f59e0b", "#38bdf8", "#fb923c", "#e879f9", "#86efac", "#fca5a5"];

  const thresholds = [
    { pct: 30,  label: "30%",  color: "rgba(67,232,216,0.25)" },
    { pct: 60,  label: "60%",  color: "rgba(245,158,11,0.25)" },
    { pct: 80,  label: "80%",  color: "rgba(255,101,132,0.25)" },
    { pct: 100, label: "100%", color: "rgba(255,101,132,0.0)" },
  ];

  return (
    <div style={{
      background: "var(--surface-2)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", padding: "24px", marginBottom: 20,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14 }}>Expense Breakdown</p>
          <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 3 }}>Y-axis scaled to monthly income (₹{safeIncome.toLocaleString("en-IN")})</p>
        </div>
        <div style={{
          padding: "6px 14px", borderRadius: 20, fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 700,
          background: spendPct > 80 ? "rgba(255,101,132,0.15)" : spendPct > 60 ? "rgba(245,158,11,0.15)" : "rgba(67,232,216,0.1)",
          border: `1px solid ${spendPct > 80 ? "rgba(255,101,132,0.4)" : spendPct > 60 ? "rgba(245,158,11,0.4)" : "rgba(67,232,216,0.3)"}`,
          color: spendPct > 80 ? "#ff6584" : spendPct > 60 ? "#f59e0b" : "#43e8d8",
        }}>
          {spendPct.toFixed(1)}% of income
        </div>
      </div>

      {/* chart area */}
      <div style={{ position: "relative", height: 220, marginBottom: 12 }}>
        {/* threshold bands */}
        {thresholds.map(t => (
          <div key={t.pct} style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: `${t.pct}%`, borderTop: `1px dashed ${t.color}`,
            pointerEvents: "none",
          }}>
            <span style={{ position: "absolute", right: 4, top: -16, fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{t.label}</span>
          </div>
        ))}

        {/* income ceiling line */}
        <div style={{
          position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: -1,
          borderTop: "1.5px dashed rgba(67,232,216,0.5)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
        }}>
          <span style={{ fontSize: 9, color: "#43e8d8", padding: "1px 6px", background: "rgba(67,232,216,0.1)", borderRadius: 4, fontFamily: "'Syne', sans-serif", fontWeight: 700, marginRight: 2 }}>
            Income ₹{safeIncome.toLocaleString("en-IN")}
          </span>
        </div>

        {/* bars */}
        <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: 6 }}>
          {entries.map(([cat, val], i) => {
            const isHov = hovered === cat;
            const barH = pct(val);
            const col = palette[i % palette.length];
            const dangerZone = pct(val) > 80;
            return (
              <div key={cat} onMouseEnter={() => setHovered(cat)} onMouseLeave={() => setHovered(null)}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", cursor: "pointer" }}
              >
                {/* tooltip */}
                {isHov && (
                  <div style={{
                    position: "absolute", bottom: `${barH + 2}%`, zIndex: 10,
                    background: "#1c1c27", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8, padding: "8px 12px",
                    fontSize: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    pointerEvents: "none", whiteSpace: "nowrap",
                  }}>
                    <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: col, marginBottom: 2 }}>{cat}</p>
                    <p style={{ color: "var(--text-secondary)" }}>₹{val.toLocaleString("en-IN")} <span style={{ color: dangerZone ? "#ff6584" : col }}>({barH.toFixed(1)}%)</span></p>
                  </div>
                )}
                <div className="bar-animate" style={{
                  width: "100%",
                  height: `${barH}%`,
                  background: dangerZone
                    ? `linear-gradient(to top, #ff658466, ${col})`
                    : `linear-gradient(to top, ${col}66, ${col})`,
                  borderRadius: "5px 5px 3px 3px",
                  boxShadow: isHov ? `0 0 20px ${col}66` : dangerZone ? `0 0 10px rgba(255,101,132,0.3)` : "none",
                  transition: "box-shadow 0.2s",
                  animationDelay: `${i * 0.07}s`,
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)", backgroundSize: "200% 100%", animation: "shimmer 2.5s infinite" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* x-axis labels */}
      <div style={{ display: "flex", gap: 6 }}>
        {entries.map(([cat], i) => (
          <div key={cat} style={{ flex: 1, textAlign: "center", fontSize: 9.5, color: hovered === cat ? palette[i % palette.length] : "var(--text-secondary)", fontFamily: "'Syne', sans-serif", fontWeight: 600, transition: "color 0.15s", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {cat.length > 7 ? cat.slice(0, 6) + "…" : cat}
          </div>
        ))}
      </div>

      {/* total vs income progress bar */}
      <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Total expenses</span>
          <span style={{ fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 700, color: spendPct > 80 ? "#ff6584" : "var(--text-primary)" }}>
            ₹{totalExpense.toLocaleString("en-IN")} / ₹{safeIncome.toLocaleString("en-IN")}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3, width: `${spendPct}%`,
            background: spendPct > 80 ? "linear-gradient(90deg, #f59e0b, #ff6584)" : spendPct > 60 ? "linear-gradient(90deg, #43e8d8, #f59e0b)" : "linear-gradient(90deg, #43e8d8, #a78bfa)",
            transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 5 }}>
          <span style={{ fontSize: 10, color: spendPct > 80 ? "#ff6584" : spendPct > 60 ? "#f59e0b" : "#43e8d8", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>
            {spendPct > 80 ? "⚠ High spend" : spendPct > 60 ? "Moderate spend" : "✓ Healthy"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── USER CARD (analyst / admin) ─────────────────────────────────────────────
function UserCard({ u, currentUserId }: { u: any; currentUserId: string }) {
  const [open, setOpen] = useState(false);
  const monthly = { income: u.monthlyIncome || 0, expense: u.monthlyExpense || 0, balance: u.monthlyBalance || 0 };
  const yearly  = { income: u.yearlyIncome  || 0, expense: u.yearlyExpense  || 0, balance: u.yearlyBalance  || 0 };

  return (
    <div className="fade-up" style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", overflow: "hidden", transition: "box-shadow 0.2s",
    }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", cursor: "pointer", userSelect: "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", flexShrink: 0 }}>
            {u.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14 }}>
              {u.email}
              {u.id === currentUserId && <span style={{ marginLeft: 8, fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(108,99,255,0.18)", color: "var(--accent)", fontWeight: 500 }}>You</span>}
            </p>
            <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
              {u.role} · Balance ₹{(u.monthlyBalance || 0).toLocaleString("en-IN")} this month
            </p>
          </div>
        </div>
        <span style={{ color: "var(--text-secondary)", fontSize: 18, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>⌄</span>
      </div>

      {open && (
        <div style={{ padding: "0 22px 24px", borderTop: "1px solid var(--border)" }}>
          <div style={{ paddingTop: 20 }}>

            {/* ── Monthly / Yearly stat rows ── */}
            <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Monthly</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
              <StatCard title="Income"  value={monthly.income}  accent="var(--income)"  delay={0} />
              <StatCard title="Expense" value={monthly.expense} accent="var(--expense)" delay={0.05} />
              <StatCard title="Balance" value={monthly.balance} accent="var(--balance)" delay={0.10} />
            </div>

            <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Yearly</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <StatCard title="Income"  value={yearly.income}  accent="var(--income)"  delay={0} />
              <StatCard title="Expense" value={yearly.expense} accent="var(--expense)" delay={0.05} />
              <StatCard title="Balance" value={yearly.balance} accent="var(--balance)" delay={0.10} />
            </div>

            {/* ── Monthly vs Yearly Comparison ── */}
            <ComparisonChart monthly={monthly} yearly={yearly} />

            {/* ── Income-Scaled Expense Breakdown ── */}
            {u.categoryData && Object.keys(u.categoryData).length > 0 && (
              <ScaledExpenseChart categoryData={u.categoryData} monthlyIncome={monthly.income} />
            )}

            {/* ── Recent Activity ── */}
            {u.recentActivity?.length > 0 && (
              <>
                <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>Recent Activity</p>
                {u.recentActivity.slice(0, 10).map((r: any, i: number) => (
                  <ActivityRow key={r.id || i} r={r} idx={i} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const filteredUsers = allUsersData.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()));
  const pagedUsers = filteredUsers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  useEffect(() => { setPage(0); }, [search]);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        const userRole = data.user.role;
        setRole(userRole);
        setCurrentUserId(data.user.id);
        if (["ADMIN", "ANALYST"].includes(userRole)) {
          await fetchAllUsers(data.user.id, userRole);
        } else {
          await fetchUserSummary();
        }
      } catch {
        router.push("/login");
      }
    };
    verifyUser();
  }, []);

  const fetchUserSummary = async () => {
    try {
      const [activityRes, summaryRes] = await Promise.all([
        fetch("/api/records", { credentials: "include" }),
        fetch("/api/analytics/user-summary", { credentials: "include" }),
      ]);
      if (!activityRes.ok || !summaryRes.ok) throw new Error("API failed");
      const recentActivity = await activityRes.json();
      const summaryData = await summaryRes.json();
      setUserSummary({
        monthly: { income: summaryData.monthlyIncome || 0, expense: summaryData.monthlyExpense || 0, balance: summaryData.monthlyBalance || 0 },
        yearly:  { income: summaryData.yearlyIncome  || 0, expense: summaryData.yearlyExpense  || 0, balance: summaryData.yearlyBalance  || 0 },
        categoryData: summaryData.categoryData,
        recentActivity,
      });
    } catch {
      setError("Failed to load your summary");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async (uid: string, userRole: string) => {
    try {
      const res = await fetch("/api/admin/user-analytics", { credentials: "include" });
      const data = await res.json();
      const filtered = data.filter((u: any) =>
        userRole === "ADMIN" ? (u.id !== uid && u.role !== "ADMIN") : u.role !== "ADMIN"
      );
      const activityRes = await fetch("/api/records", { credentials: "include" });
      const allActivities = await activityRes.json();
      const usersWithActivities = filtered.map((u: any) => ({
        ...u,
        monthlyBalance: (u.monthlyIncome || 0) - (u.monthlyExpense || 0),
        yearlyBalance:  (u.yearlyIncome  || 0) - (u.yearlyExpense  || 0),
        recentActivity: allActivities.filter((r: any) => r.user?.email === u.email),
      }));
      setAllUsersData(usersWithActivities);
    } catch {
      setError("Failed to load all users data");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  if (loading) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ padding: 32, minHeight: "100vh", background: "var(--bg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
          <Skeleton w={180} h={32} />
          <Skeleton w={120} h={32} />
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          {[1, 2, 3].map(i => <Skeleton key={i} w="33%" h={90} />)}
        </div>
        <Skeleton w="100%" h={200} />
      </div>
    </>
  );

  if (error) return (
    <>
      <style>{globalStyles}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ padding: "32px 40px", borderRadius: "var(--radius)", background: "rgba(255,101,132,0.08)", border: "1px solid rgba(255,101,132,0.25)", textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: "var(--expense)", fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>{error}</p>
        </div>
      </div>
    </>
  );

  const roleBadgeColors: Record<string, string> = { ADMIN: "var(--accent)", ANALYST: "var(--accent-3)", VIEWER: "var(--accent-2)" };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ padding: "28px 32px", background: "var(--bg)", minHeight: "100vh" }}>

        {/* HEADER */}
        <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, animation: "pulse-ring 2.5s ease-out infinite" }}>📊</div>
            <div>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: "-0.5px" }}>Dashboard</h1>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600, fontFamily: "'Syne', sans-serif", letterSpacing: "0.08em", border: `1px solid ${roleBadgeColors[role] || "#fff"}`, color: roleBadgeColors[role] || "#fff", background: `${roleBadgeColors[role] || "#fff"}18` }}>{role}</span>
            {role === "ADMIN" && (
              <button onClick={() => router.push("/admin")} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, background: "rgba(108,99,255,0.12)", border: "1px solid rgba(108,99,255,0.3)", color: "var(--accent)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(108,99,255,0.22)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(108,99,255,0.12)")}
              >🛠 Admin Panel</button>
            )}
            <button onClick={logout} style={{ padding: "8px 16px", borderRadius: 10, fontSize: 12, background: "rgba(255,101,132,0.1)", border: "1px solid rgba(255,101,132,0.25)", color: "var(--expense)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,101,132,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,101,132,0.1)")}
            >🚪 Logout</button>
          </div>
        </div>

        {/* VIEWER */}
        {role === "VIEWER" && userSummary && (
          <>
            <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Monthly Overview</p>
            <div className="fade-up-1" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
              <StatCard title="Income"  value={userSummary.monthly.income}  accent="var(--income)"  delay={0} />
              <StatCard title="Expense" value={userSummary.monthly.expense} accent="var(--expense)" delay={0.05} />
              <StatCard title="Balance" value={userSummary.monthly.balance} accent="var(--balance)" delay={0.10} />
            </div>
            <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 12 }}>Yearly Overview</p>
            <div className="fade-up-2" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
              <StatCard title="Income"  value={userSummary.yearly.income}  accent="var(--income)"  delay={0} />
              <StatCard title="Expense" value={userSummary.yearly.expense} accent="var(--expense)" delay={0.05} />
              <StatCard title="Balance" value={userSummary.yearly.balance} accent="var(--balance)" delay={0.10} />
            </div>
            {userSummary.categoryData?.length > 0 && (
              <div className="fade-up-3" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24, marginBottom: 28 }}>
                <ExpenseChart data={userSummary.categoryData} />
              </div>
            )}
            {userSummary.recentActivity?.length > 0 && (
              <div className="fade-up-4" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 24 }}>
                <p style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: 8 }}>Recent Activity</p>
                {userSummary.recentActivity.slice(0, 10).map((r: any, i: number) => (
                  <ActivityRow key={r.id || i} r={r} idx={i} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ADMIN / ANALYST */}
        {(role === "ADMIN" || role === "ANALYST") && (
          <>
            <div className="fade-up-1" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 18 }}>Users Analytics</h2>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found</p>
              </div>
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pagedUsers.length > 0
                ? pagedUsers.map((u, idx) => <UserCard key={u.id || idx} u={u} currentUserId={currentUserId} />)
                : (
                  <div style={{ textAlign: "center", padding: "60px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                    <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No users match your search</p>
                  </div>
                )}
            </div>
            <Pagination total={filteredUsers.length} page={page} onPage={setPage} />
          </>
        )}
      </div>
    </>
  );
}