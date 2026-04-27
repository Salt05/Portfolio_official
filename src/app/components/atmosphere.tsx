import { motion, useScroll, useTransform, useSpring, MotionValue, cubicBezier } from "motion/react";
import { useRef } from "react";

const SPRING = { stiffness: 60, damping: 20, mass: 0.5 };

// ── Easing ─────────────────────────────────────────────────────────────────────
// easeInQuint  = nhanh dần  (cảnh → khoảng nghỉ)
// easeOutQuint = chậm dần   (khoảng nghỉ → cảnh)
const easeInQuint = cubicBezier(0.755, 0.05, 0.855, 0.06);
const easeOutQuint = cubicBezier(0.23, 1, 0.32, 1);

// ── easeInOutCubic cho đường cong orb ─────────────────────────────────────────
// t ∈ [0,1] → giá trị tăng chậm ở đầu/cuối, nhanh ở giữa
function easeInOutCubic(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

// ── Đường cong tham số cho 2 orb ───────────────────────────────────────────────
// Orb A: cung lớn từ trên-giữa → phải → dưới-giữa (hình cung chữ C ngược)
//   x(e) = 50 + 40·sin(π·e)   →  50% ↗ 90% ↘ 50%
//   y(e) = 12 + 68·e           →  12vh  …→  80vh  (trôi dần xuống)
function orbALeft(t: number): number {
  const e = easeInOutCubic(t);
  return 50 + 40 * Math.sin(Math.PI * e);
}
function orbATop(t: number): number {
  const e = easeInOutCubic(t);
  return 12 + 68 * e;
}

// Orb B: cung đối xứng từ dưới-giữa → trái → trên-giữa (hình cung chữ C)
//   x(e) = 55 - 45·sin(π·e)   →  55% ↙ 10% ↗ 55%
//   y(e) = 82 - 62·e           →  82vh  …→  20vh  (trôi dần lên)
function orbBLeft(t: number): number {
  const e = easeInOutCubic(t);
  return 55 - 45 * Math.sin(Math.PI * e);
}
function orbBTop(t: number): number {
  const e = easeInOutCubic(t);
  return 82 - 62 * e;
}

// ── Sunset Orbs ────────────────────────────────────────────────────────────────
const ORB_COLOR =
  "radial-gradient(ellipse at 45% 55%, #ffc4a899, #ff9a8a66 45%, transparent 74%)";

function SunsetOrb({
  leftFn,
  topFn,
  size,
  blur,
  smooth,
  delay = 0,
}: {
  leftFn: (t: number) => number;
  topFn: (t: number) => number;
  size: number;
  blur: number;
  smooth: MotionValue<number>;
  delay?: number;
}) {
  // Lệch pha nhẹ giữa 2 orb để không chuyển đ���ng đồng nhất
  const shifted = useTransform(smooth, (v) =>
    Math.min(1, Math.max(0, v + delay)),
  );

  // Toạ độ tính thẳng từ hàm đường cong — easeInOutCubic đã nhúng trong leftFn/topFn
  const leftVW = useTransform(shifted, leftFn);
  const topVH  = useTransform(shifted, topFn);

  const left = useTransform(leftVW, (v) => `calc(${v}vw - ${size / 2}px)`);
  const top  = useTransform(topVH,  (v) => `calc(${v}vh - ${size / 2}px)`);

  return (
    <motion.div
      style={{
        position: "absolute",
        left,
        top,
        width: size,
        height: size,
        background: ORB_COLOR,
        filter: `blur(${blur}px)`,
        borderRadius: "50%",
        willChange: "transform, left, top",
      }}
    />
  );
}

export function SunsetOrbs() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, SPRING);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: -4 }}
    >
      {/* Orb A — cung lớn sang phải rồi trôi xuống */}
      <SunsetOrb leftFn={orbALeft} topFn={orbATop} size={520} blur={130} smooth={smooth} />
      {/* Orb B — cung đối xứng sang trái rồi trôi lên, lệch pha nhẹ */}
      <SunsetOrb leftFn={orbBLeft} topFn={orbBTop} size={380} blur={110} smooth={smooth} delay={0.03} />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(255,255,255,0.25) 100%)",
        }}
      />
    </div>
  );
}

// ── Original Atmosphere ────────────────────────────────────────────────────────
export function Atmosphere() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, SPRING);
  const y1 = useTransform(smooth, [0, 1], [0, -300]);
  const y2 = useTransform(smooth, [0, 1], [0, 400]);
  const y3 = useTransform(smooth, [0, 1], [0, -200]);
  const hue = useTransform(smooth, [0, 0.5, 1], [0, 30, 60]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        style={{ y: y1, filter: useTransform(hue, (h) => `hue-rotate(${h}deg)`) }}
        className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-rose-200/60 to-orange-100/40 blur-3xl"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute top-[30%] -right-40 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-sky-200/50 to-violet-200/40 blur-3xl"
      />
      <motion.div
        style={{ y: y3 }}
        className="absolute bottom-0 left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-100/50 to-amber-100/40 blur-3xl"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.4)_100%)]" />
    </div>
  );
}

export function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 -z-[5] pointer-events-none opacity-[0.035] mix-blend-multiply"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

export function FloatingShape({
  progress,
  className,
  range = [0, 1],
  yRange = [0, -200],
  rotateRange = [0, 360],
}: {
  progress: MotionValue<number>;
  className?: string;
  range?: [number, number];
  yRange?: [number, number];
  rotateRange?: [number, number];
}) {
  const y = useTransform(progress, range, yRange);
  const rotate = useTransform(progress, range, rotateRange);
  return <motion.div style={{ y, rotate }} className={className} />;
}

export function useSectionScroll() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return { ref, scrollYProgress };
}

// Tiến độ cảnh đã ép theo nhịp easing:
//   nửa đầu (rest → scene)  : easeOutQuint  (chậm dần khi vào cảnh)
//   nửa sau (scene → rest)  : easeInQuint   (nhanh dần khi rời cảnh)
// Trả về MotionValue [0..1] đã smoothed bằng spring để dùng cho mọi useTransform.
export function useSceneEasedProgress(
  target: React.RefObject<HTMLElement>,
  spring = { stiffness: 70, damping: 22, mass: 0.5 },
  offset: ["start end" | "start start", "end start" | "end end"] = [
    "start end",
    "end start",
  ],
) {
  const { scrollYProgress } = useScroll({ target, offset: offset as any });
  const smooth = useSpring(scrollYProgress, spring);
  const eased = useTransform(smooth, [0, 0.5, 1], [0, 0.5, 1], {
    ease: [easeOutQuint, easeInQuint],
  });
  return eased;
}

// Khoảng nghỉ giữa các phân cảnh (~2/3 trang chuẩn)
export function SceneRest() {
  return <div aria-hidden className="w-full" style={{ height: "67vh" }} />;
}
