"use client";
import { useEffect, useRef, useState } from "react";

// ── Màu viền cho từng phân cảnh + SceneRest ────────────────────────────────
const SCENE_COLORS: Record<string, string> = {
  hero:    "#f43f5e", // rose
  rest1:   "#a8a29e", // stone
  intro:   "#6366f1", // indigo
  rest2:   "#a8a29e",
  story:   "#10b981", // emerald
  rest3:   "#a8a29e",
  work:    "#f59e0b", // amber
  rest4:   "#a8a29e",
  skills:  "#3b82f6", // blue
  rest5:   "#a8a29e",
  contact: "#ec4899", // pink
};

// ── SceneBorder: bọc từng khối, vẽ viền + nhãn ────────────────────────────
export function SceneBorder({
  id,
  label,
  color,
  children,
}: {
  id: string;
  label: string;
  color: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => {
      setHeight(ref.current?.offsetHeight ?? 0);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-debug-id={id}
      style={{
        outline: `2px dashed ${color}`,
        outlineOffset: "-2px",
        position: "relative",
      }}
    >
      {/* Nhãn trên góc trái */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          background: color,
          color: "#fff",
          fontSize: 11,
          fontFamily: "monospace",
          fontWeight: 700,
          padding: "2px 8px",
          borderBottomRightRadius: 6,
          zIndex: 9999,
          lineHeight: 1.6,
          pointerEvents: "none",
          letterSpacing: "0.05em",
        }}
      >
        {label}
        {height > 0 && (
          <span style={{ opacity: 0.8, marginLeft: 6 }}>
            {Math.round(height)}px /{" "}
            {(height / window.innerHeight).toFixed(2)}vh
          </span>
        )}
      </div>

      {/* Nhãn dưới góc phải */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          background: color,
          color: "#fff",
          fontSize: 10,
          fontFamily: "monospace",
          padding: "2px 8px",
          borderTopLeftRadius: 6,
          zIndex: 9999,
          pointerEvents: "none",
          opacity: 0.75,
        }}
      >
        ↑ {label} end
      </div>

      {children}
    </div>
  );
}

// ── RestBorder: khoảng nghỉ SceneRest ─────────────────────────────────────
export function RestBorder({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(() => setHeight(ref.current?.offsetHeight ?? 0));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const color = "#a8a29e";

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "67vh",
        outline: `2px dashed ${color}`,
        outlineOffset: "-2px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color,
          background: "rgba(255,255,255,0.7)",
          padding: "2px 10px",
          borderRadius: 4,
          letterSpacing: "0.06em",
        }}
      >
        SceneRest #{index} — 67vh /{" "}
        {height > 0 ? `${Math.round(height)}px` : ""}
      </span>
    </div>
  );
}

// ── ScrollRuler: thanh thước đo cố định bên phải ──────────────────────────
export function ScrollRuler() {
  const [info, setInfo] = useState({
    scrollY: 0,
    totalH: 0,
    pct: 0,
    vh: 0,
    scene: "",
  });
  const [delta, setDelta] = useState<{ pct: number; px: number } | null>(null);
  const prevPct = useRef<number>(0);
  const prevScrollY = useRef<number>(0);
  const deltaTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      const scrollY = window.scrollY;
      const totalH  = document.body.scrollHeight - window.innerHeight;
      const pct     = totalH > 0 ? scrollY / totalH : 0;
      const vh      = scrollY / window.innerHeight;

      // Delta so với lần update trước
      const dPct = Math.abs(pct - prevPct.current) * 100;
      const dPx  = Math.abs(scrollY - prevScrollY.current);
      if (dPct > 0.001) {
        setDelta({ pct: dPct, px: dPx });
        if (deltaTimer.current) clearTimeout(deltaTimer.current);
        deltaTimer.current = setTimeout(() => setDelta(null), 1200);
      }
      prevPct.current    = pct;
      prevScrollY.current = scrollY;

      // Detect current scene
      let scene = "";
      document.querySelectorAll("[data-debug-id]").forEach((el) => {
        const rect = (el as HTMLElement).getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5) {
          scene = (el as HTMLElement).dataset.debugId ?? "";
        }
      });

      setInfo({ scrollY: Math.round(scrollY), totalH: Math.round(totalH), pct, vh, scene });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (deltaTimer.current) clearTimeout(deltaTimer.current);
    };
  }, []);

  const pctDisplay = (info.pct * 100).toFixed(1);
  const tickCount  = 20;

  return (
    <div
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: 64,
        height: "100vh",
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        pointerEvents: "none",
        background: "rgba(20,20,30,0.82)",
        backdropFilter: "blur(4px)",
        borderLeft: "1px solid rgba(255,255,255,0.12)",
        fontFamily: "monospace",
        color: "#e2e8f0",
        fontSize: 10,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "6px 4px 4px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 9,
          letterSpacing: "0.08em",
          lineHeight: 1.5,
        }}
      >
        SCROLL<br />RULER
      </div>

      {/* Ruler track */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Tick marks */}
        {Array.from({ length: tickCount + 1 }, (_, i) => {
          const pctPos = i / tickCount;
          const isMajor = i % 5 === 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${pctPos * 100}%`,
                right: 0,
                display: "flex",
                alignItems: "center",
                gap: 3,
                transform: "translateY(-50%)",
              }}
            >
              {isMajor && (
                <span
                  style={{
                    color: "#94a3b8",
                    fontSize: 9,
                    marginLeft: 3,
                    minWidth: 28,
                    textAlign: "right",
                  }}
                >
                  {(pctPos * 100).toFixed(0)}%
                </span>
              )}
              <div
                style={{
                  height: 1,
                  background: isMajor ? "#64748b" : "#334155",
                  width: isMajor ? 14 : 7,
                }}
              />
            </div>
          );
        })}

        {/* Thumb — vị trí hiện tại */}
        <div
          style={{
            position: "absolute",
            top: `${info.pct * 100}%`,
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            transition: "top 0.05s linear",
          }}
        >
          <div
            style={{
              flex: 1,
              height: 2,
              background: "#f43f5e",
              boxShadow: "0 0 6px #f43f5eaa",
            }}
          />
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f43f5e",
              boxShadow: "0 0 8px #f43f5ecc",
              flexShrink: 0,
            }}
          />
        </div>
      </div>

      {/* Footer stats */}
      <div
        style={{
          padding: "6px 4px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          fontSize: 9,
          color: "#94a3b8",
          lineHeight: 1.5,
        }}
      >
        {/* Vị trí hiện tại */}
        <div style={{ color: "#f43f5e", fontWeight: 700, fontSize: 12, textAlign: "center" }}>
          {pctDisplay}%
        </div>

        <div style={{ color: "#64748b", fontSize: 8, textAlign: "center", letterSpacing: "0.06em" }}>
          ── VỊ TRÍ ──
        </div>
        <div title="scrollY px">Y {info.scrollY}px</div>
        <div title="scrolled in viewport units">↕ {info.vh.toFixed(2)}vh</div>
        <div title="total scrollable height">/ {info.totalH}px</div>

        {/* Delta mỗi scroll */}
        <div style={{ color: "#64748b", fontSize: 8, textAlign: "center", letterSpacing: "0.06em", marginTop: 2 }}>
          ── Δ SCROLL ──
        </div>
        <div
          title="% thay đổi mỗi bước scroll"
          style={{
            background: delta ? "rgba(251,191,36,0.18)" : "transparent",
            borderRadius: 3,
            padding: "1px 3px",
            color: delta ? "#fbbf24" : "#475569",
            fontSize: 10,
            fontWeight: delta ? 700 : 400,
            textAlign: "center",
            transition: "all 0.2s",
            minHeight: 16,
          }}
        >
          {delta ? `+${delta.pct.toFixed(2)}%` : "–"}
        </div>
        <div
          title="px thay đổi mỗi bước scroll"
          style={{
            color: delta ? "#fbbf24" : "#475569",
            fontSize: 9,
            textAlign: "center",
            transition: "color 0.2s",
          }}
        >
          {delta ? `+${delta.px}px` : ""}
        </div>

        {/* Tên cảnh hiện tại */}
        {info.scene && (
          <div
            style={{
              marginTop: 2,
              background: "rgba(244,63,94,0.18)",
              borderRadius: 3,
              padding: "1px 3px",
              color: "#fda4af",
              fontSize: 9,
              wordBreak: "break-all",
              textAlign: "center",
            }}
          >
            {info.scene}
          </div>
        )}
      </div>
    </div>
  );
}