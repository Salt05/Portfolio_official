import { useEffect } from "react";
import Lenis from "lenis";

const easeInCubic  = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const linear       = (t: number) => t;

// Mỗi chặng = {endPct, easing, steps}. Chặng N nối từ endPct của chặng (N-1).
type Seg = { end: number; ease: (t: number) => number; steps: number };
const SEGMENTS: Seg[] = [
  { end: 0.065, ease: easeInCubic,  steps: 2 }, // 1
  { end: 0.130, ease: easeOutCubic, steps: 2 }, // 2
  { end: 0.200, ease: easeInCubic,  steps: 2 }, // 3
  { end: 0.270, ease: easeOutCubic, steps: 2 }, // 4
  { end: 0.355, ease: linear,       steps: 3 }, // 5 (chia đều)
  { end: 0.425, ease: easeInCubic,  steps: 2 }, // 6
  { end: 0.490, ease: easeOutCubic, steps: 2 }, // 7
  { end: 0.530, ease: easeInCubic,  steps: 2 }, // 8
  { end: 0.605, ease: easeInCubic,  steps: 2 }, // 9
  { end: 0.685, ease: easeInCubic,  steps: 2 }, // 10
  { end: 0.755, ease: easeOutCubic, steps: 2 }, // 11
  { end: 0.815, ease: linear,       steps: 2 }, // 12 (chia đều)
  { end: 0.895, ease: easeInCubic,  steps: 2 }, // 13
  { end: 1.000, ease: easeOutCubic, steps: 3 }, // 14
];
const TOTAL_STEPS = SEGMENTS.reduce((a, s) => a + s.steps, 0);

export function SmoothScroll() {
  useEffect(() => {
    let lenis: Lenis | null = null;
    let rafId = 0;
    const cleanups: Array<() => void> = [];

    try {
      lenis = new Lenis({
        duration: 1.0,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
      });
      lenis.scrollTo(0, { immediate: true });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      // ── Keyframes từ 0 → timeline, phân phối theo easing ──────────
      const keyframes: number[] = [];
      const computeKeyframes = () => {
        const vh     = window.innerHeight;
        const docH   = document.documentElement.scrollHeight;
        const totalH = Math.max(0, docH - vh);

        keyframes.length = 0;
        keyframes.push(0);
        let prev = 0;
        for (const seg of SEGMENTS) {
          const y0 = prev      * totalH;
          const y1 = seg.end   * totalH;
          for (let i = 1; i <= seg.steps; i++) {
            const t = i / seg.steps;
            keyframes.push(y0 + seg.ease(t) * (y1 - y0));
          }
          prev = seg.end;
        }
      };
      computeKeyframes();
      window.addEventListener("resize", computeKeyframes);
      cleanups.push(() => window.removeEventListener("resize", computeKeyframes));

      // ── Step controller ──────────
      let step = 0;
      let lastWheelTs = 0;
      const COOLDOWN = 65;

      // Đồng bộ biến step với vị trí cuộn hiện tại của trang (để fix lỗi nhảy trang khi kéo scrollbar hoặc click anchor link)
      lenis.on('scroll', (e: any) => {
        if (keyframes.length === 0) return;
        let closestIndex = 0;
        let minDiff = Infinity;
        // Sử dụng e.animatedScroll hoặc e.scroll tùy phiên bản Lenis
        const currentScroll = e.animatedScroll ?? e.scroll;
        for (let i = 0; i < keyframes.length; i++) {
          const diff = Math.abs(keyframes[i] - currentScroll);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        }
        step = closestIndex;
      });

      // Bắt sự kiện click vào các thẻ a có href="#..." để cuộn mượt mà bằng Lenis
      const onAnchorClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');
        if (!anchor) return;
        
        const href = anchor.getAttribute('href');
        if (href && href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const targetEl = document.querySelector(href);
          if (targetEl) {
            lenis?.scrollTo(targetEl, {
              duration: 1.2,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
          }
        }
      };
      document.addEventListener('click', onAnchorClick);
      cleanups.push(() => document.removeEventListener('click', onAnchorClick));

      const onWheel = (e: WheelEvent) => {
        const dir = Math.sign(e.deltaY);
        const inZone = (step < TOTAL_STEPS && dir > 0) || (step > 0 && dir < 0);
        if (!inZone || dir === 0) return; // ngoài vùng → Lenis xử lý bình thường

        e.preventDefault();
        e.stopPropagation();

        const now = performance.now();
        if (now - lastWheelTs < COOLDOWN) return;
        lastWheelTs = now;

        step = Math.max(0, Math.min(TOTAL_STEPS, step + dir));
        lenis?.scrollTo(keyframes[step], {
          duration: 0.75,
          easing: (t: number) => 1 - Math.pow(1 - t, 3),
        });
      };

      window.addEventListener("wheel", onWheel, { passive: false, capture: true });
      cleanups.push(() =>
        window.removeEventListener("wheel", onWheel, { capture: true } as any)
      );
    } catch (err) {
      console.error("[SmoothScroll] init failed:", err);
    }

    return () => {
      cleanups.forEach((fn) => fn());
      cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
