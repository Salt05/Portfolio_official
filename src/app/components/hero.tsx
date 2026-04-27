import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform, useScroll } from "motion/react";
import { useRef, useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { useSceneEasedProgress } from "./atmosphere";

const HERO_PHRASE = "from logic & light.";
const HERO_PHRASE_CHARS = HERO_PHRASE.split("");

type HeroProps = {
  activeLanternIndex?: number;
  onLanternSelect?: (index: number) => void;
};

function createNeutralCharOffsets() {
  return HERO_PHRASE_CHARS.map(() => ({ x: 0, y: 0 }));
}

const MAGNET_CONFIGS = [
  { radius: 660, pullStrength: 2.1, maxStretch: 30, returnSpring: 0.085, damping: 0.87, centerDeadZone: 14 },
  { radius: 630, pullStrength: 1.9, maxStretch: 28, returnSpring: 0.085, damping: 0.87, centerDeadZone: 13 },
  { radius: 690, pullStrength: 2.3, maxStretch: 33, returnSpring: 0.085, damping: 0.87, centerDeadZone: 15 },
  { radius: 660, pullStrength: 2.1, maxStretch: 30, returnSpring: 0.085, damping: 0.87, centerDeadZone: 14 },
] as const;

export function Hero({ activeLanternIndex = 0, onLanternSelect }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);
  const shape3Ref = useRef<HTMLDivElement>(null);
  const shape4Ref = useRef<HTMLDivElement>(null);

  const shape1MagnetX = useMotionValue(0);
  const shape1MagnetY = useMotionValue(0);
  const shape2MagnetX = useMotionValue(0);
  const shape2MagnetY = useMotionValue(0);
  const shape3MagnetX = useMotionValue(0);
  const shape3MagnetY = useMotionValue(0);
  const shape4MagnetX = useMotionValue(0);
  const shape4MagnetY = useMotionValue(0);

  const shape1MagnetXSmooth = useSpring(shape1MagnetX, { stiffness: 220, damping: 24, mass: 0.35 });
  const shape1MagnetYSmooth = useSpring(shape1MagnetY, { stiffness: 220, damping: 24, mass: 0.35 });
  const shape2MagnetXSmooth = useSpring(shape2MagnetX, { stiffness: 220, damping: 24, mass: 0.35 });
  const shape2MagnetYSmooth = useSpring(shape2MagnetY, { stiffness: 220, damping: 24, mass: 0.35 });
  const shape3MagnetXSmooth = useSpring(shape3MagnetX, { stiffness: 220, damping: 24, mass: 0.35 });
  const shape3MagnetYSmooth = useSpring(shape3MagnetY, { stiffness: 220, damping: 24, mass: 0.35 });
  const shape4MagnetXSmooth = useSpring(shape4MagnetX, { stiffness: 220, damping: 24, mass: 0.35 });
  const shape4MagnetYSmooth = useSpring(shape4MagnetY, { stiffness: 220, damping: 24, mass: 0.35 });
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const magnetBodiesRef = useRef([
    { x: 0, y: 0, vx: 0, vy: 0 },
    { x: 0, y: 0, vx: 0, vy: 0 },
    { x: 0, y: 0, vx: 0, vy: 0 },
    { x: 0, y: 0, vx: 0, vy: 0 },
  ]);
  const [magnetActive, setMagnetActive] = useState({
    shape1: false,
    shape2: false,
    shape3: false,
    shape4: false,
  });
  
  const [vh, setVh] = useState(0);
  const [vw, setVw] = useState(0);
  useEffect(() => {
    setVh(window.innerHeight);
    setVw(window.innerWidth);
    const handleResize = () => {
      setVh(window.innerHeight);
      setVw(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let rafId = 0;

    const shapeRefs = [shape1Ref, shape2Ref, shape3Ref, shape4Ref] as const;
    const xValues = [shape1MagnetX, shape2MagnetX, shape3MagnetX, shape4MagnetX] as const;
    const yValues = [shape1MagnetY, shape2MagnetY, shape3MagnetY, shape4MagnetY] as const;

    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      pointerRef.current.active = true;
    };

    const onPointerEnd = () => {
      pointerRef.current.active = false;
    };

    const tick = () => {
      const pointer = pointerRef.current;
      const nextActive = [false, false, false, false];

      for (let index = 0; index < shapeRefs.length; index += 1) {
        const el = shapeRefs[index].current;
        const body = magnetBodiesRef.current[index];
        const cfg = MAGNET_CONFIGS[index];

        let ax = -body.x * cfg.returnSpring;
        let ay = -body.y * cfg.returnSpring;

        if (pointer.active && el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = pointer.x - cx;
          const dy = pointer.y - cy;
          const distance = Math.hypot(dx, dy);

          if (distance < cfg.radius && distance > 0.001) {
            const influence = 1 - distance / cfg.radius;
            // Taper attraction near the center so direction flips do not cause jitter.
            const centerSoftness = Math.min(distance / 42, 1);
            const pull = Math.pow(influence, 1.8) * cfg.pullStrength * centerSoftness;

            if (distance > cfg.centerDeadZone) {
              ax += (dx / distance) * pull;
              ay += (dy / distance) * pull;
            }
            nextActive[index] = true;
          }
        }

        body.vx = (body.vx + ax) * cfg.damping;
        body.vy = (body.vy + ay) * cfg.damping;
        body.x += body.vx;
        body.y += body.vy;

        const stretch = Math.hypot(body.x, body.y);
        if (stretch > cfg.maxStretch && stretch > 0.001) {
          const scale = cfg.maxStretch / stretch;
          body.x *= scale;
          body.y *= scale;
          body.vx *= 0.75;
          body.vy *= 0.75;
        }

        xValues[index].set(body.x);
        yValues[index].set(body.y);
      }

      setMagnetActive((prev) => {
        const shape1 = nextActive[0];
        const shape2 = nextActive[1];
        const shape3 = nextActive[2];
        const shape4 = nextActive[3];
        if (
          prev.shape1 === shape1 &&
          prev.shape2 === shape2 &&
          prev.shape3 === shape3 &&
          prev.shape4 === shape4
        ) {
          return prev;
        }
        return { shape1, shape2, shape3, shape4 };
      });

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerEnd);
    window.addEventListener("blur", onPointerEnd);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerEnd);
      window.removeEventListener("blur", onPointerEnd);
      window.cancelAnimationFrame(rafId);
    };
  }, [
    shape1MagnetX,
    shape1MagnetY,
    shape2MagnetX,
    shape2MagnetY,
    shape3MagnetX,
    shape3MagnetY,
    shape4MagnetX,
    shape4MagnetY,
  ]);

  const p = useSceneEasedProgress(
    ref,
    { stiffness: 80, damping: 22, mass: 0.4 },
    ["start start", "end start"],
  );
  
  const y = useTransform(p, [0, 1], [0, 200]);
  const opacity = useTransform(p, [0, 0.8], [1, 0]);
  const scale = useTransform(p, [0, 1], [1, 1.15]);

  // Interactive light for the "from logic & light." line
  const [charOffsets, setCharOffsets] = useState(createNeutralCharOffsets);
  const charRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const smoothLightX = useSpring(lightX, { stiffness: 260, damping: 28, mass: 0.2 });
  const smoothLightY = useSpring(lightY, { stiffness: 260, damping: 28, mass: 0.2 });
  const glow = useMotionTemplate`radial-gradient(circle at ${smoothLightX}% ${smoothLightY}%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 16%, rgba(255,255,255,0.08) 34%, rgba(255,255,255,0) 50%)`;

  const handlePhrasePointerMove = (event: React.PointerEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    lightX.set(Math.max(0, Math.min(100, x)));
    lightY.set(Math.max(0, Math.min(100, y)));

    const influenceRadius = 180;
    const maxPush = 35;
    const nextOffsets = HERO_PHRASE_CHARS.map((char, index) => {
      if (char === " ") {
        return { x: 0, y: 0 };
      }

      const charEl = charRefs.current[index];
      if (!charEl) {
        return { x: 0, y: 0 };
      }

      const charRect = charEl.getBoundingClientRect();
      const cx = charRect.left + charRect.width / 2;
      const cy = charRect.top + charRect.height / 2;
      const dx = cx - event.clientX;
      const dy = cy - event.clientY;
      const distance = Math.hypot(dx, dy);

      if (distance >= influenceRadius) {
        return { x: 0, y: 0 };
      }

      const force = (1 - distance / influenceRadius) * maxPush;
      const nx = distance === 0 ? 0 : dx / distance;
      const ny = distance === 0 ? -1 : dy / distance;
      return { x: nx * force, y: ny * force };
    });

    setCharOffsets(nextOffsets);
  };

  const resetPhraseLight = () => {
    setCharOffsets(createNeutralCharOffsets());
    lightX.set(50);
    lightY.set(50);
  };

  const handleLanternSelect = (index: number) => {
    onLanternSelect?.(index);
  };

  // Star animations (0 to 0.13 global scroll progress)

  
  // Distance down: star starts at ~80vh. Intro text is vertically centered in the next 100vh section,
  // but there is a 67vh "Rest1" border between Hero and Intro.
  // Top of Intro = 100vh (Hero) + 67vh (Rest) = 167vh.
  // Text is at roughly 167vh + 30vh = 197vh.
  // To move from 80vh to ~190vh (just above the text), it needs to translate down by ~110vh = 1.1 * vh.
  const starY = useTransform(smoothScrollProgress, [0, 0.13], [0, vh * 1.1]);
  
  // Star starts at 18vw. Text is at max(0, (vw - 1024)/2) + padding. 
  // Let's translate it to around the center-left.
  const maxW = 1024;
  const targetX = vw > maxW ? (vw - maxW) / 2 : vw < 768 ? 24 : 64; // padding md:px-16 is 64px
  const startX = vw * 0.18;
  const starX = useTransform(smoothScrollProgress, [0, 0.13], [0, targetX - startX - 20]); // slightly left and above text
  
  const starRotate = useTransform(smoothScrollProgress, [0, 0.13], [0, 260]);

  const shape2BaseY = useTransform(p, [0, 1], [0, -150]);
  const shape2Y = useTransform([shape2BaseY, shape2MagnetYSmooth], ([base, offset]) => base + offset);

  const starCombinedX = useTransform([starX, shape3MagnetXSmooth], ([base, offset]) => base + offset);
  const starCombinedY = useTransform([starY, shape3MagnetYSmooth], ([base, offset]) => base + offset);

  const shape4BaseY = useTransform(p, [0, 1], [0, -100]);
  const shape4Y = useTransform([shape4BaseY, shape4MagnetYSmooth], ([base, offset]) => base + offset);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center px-6 md:px-16">
      <motion.div style={{ y, opacity, scale }} className="relative z-10 text-center max-w-[1200px]">
        <h1 className="text-[clamp(3rem,10vw,9rem)] leading-[0.95] font-light text-stone-800 tracking-tight">
          <motion.span initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }} className="block">
            Build worlds
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            onPointerMove={handlePhrasePointerMove}
            onPointerLeave={resetPhraseLight}
            onPointerCancel={resetPhraseLight}
            whileTap={{ scale: 0.98 }}
            className="group relative mx-auto block w-fit cursor-pointer select-none italic font-serif text-rose-400/90 md:whitespace-nowrap"
          >
            <span className="block md:whitespace-nowrap">
              {HERO_PHRASE_CHARS.map((char, index) => (
                <motion.span
                  key={`base-char-${index}`}
                  ref={(el) => {
                    charRefs.current[index] = el;
                  }}
                  animate={{ x: charOffsets[index]?.x ?? 0, y: charOffsets[index]?.y ?? 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 12, mass: 1 }}
                  className="inline-block will-change-transform"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-0 block text-transparent [background-clip:text] [-webkit-background-clip:text] md:whitespace-nowrap"
              style={{ backgroundImage: glow, opacity: 1 }}
            >
              {HERO_PHRASE_CHARS.map((char, index) => (
                <motion.span
                  key={`glow-char-${index}`}
                  animate={{ x: charOffsets[index]?.x ?? 0, y: charOffsets[index]?.y ?? 0 }}
                  transition={{ type: "spring", stiffness: 150, damping: 12, mass: 1 }}
                  className="inline-block will-change-transform"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.span>
          </motion.span>
        </h1>
      </motion.div>

      {/* Floating Geometric Elements (Foreground) */}
      <motion.div
        ref={shape1Ref}
        onClick={() => handleLanternSelect(0)}
        style={{ rotate: useTransform(p, [0, 1], [0, 90]), x: shape1MagnetXSmooth, y: shape1MagnetYSmooth }}
        className="absolute top-[20%] left-[10%] w-32 h-32 z-20 pointer-events-auto cursor-pointer"
      >
        <motion.div 
          animate={magnetActive.shape1 ? { y: 0, x: 0, rotate: 0 } : { y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 8, 0] }} 
          transition={magnetActive.shape1 ? { duration: 0.25, ease: "easeOut" } : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className={`relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-pink-200/70 to-rose-100/50 transition-[filter,box-shadow] duration-500 ${
            activeLanternIndex === 0
              ? "brightness-110 saturate-125 shadow-[0_0_38px_rgba(244,114,182,0.58),0_20px_60px_-15px_rgba(244,114,182,0.45)]"
              : "brightness-100 saturate-100 shadow-[0_20px_60px_-15px_rgba(244,114,182,0.4)]"
          }`}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-3xl"
          style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.3) 34%, rgba(255,255,255,0) 74%)" }}
          animate={activeLanternIndex === 0 ? { opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] } : { opacity: 0, scale: 0.94 }}
          transition={activeLanternIndex === 0 ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.35, ease: "easeOut" }}
        />
      </motion.div>
      <motion.div
        ref={shape2Ref}
        onClick={() => handleLanternSelect(1)}
        style={{ x: shape2MagnetXSmooth, y: shape2Y }}
        className="absolute top-[15%] right-[12%] w-24 h-24 z-20 pointer-events-auto cursor-pointer"
      >
        <motion.div 
          animate={magnetActive.shape2 ? { y: 0, x: 0 } : { y: [0, 15, 0], x: [0, -15, 0] }} 
          transition={magnetActive.shape2 ? { duration: 0.25, ease: "easeOut" } : { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className={`relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-sky-200/70 to-blue-100/40 transition-[filter,box-shadow] duration-500 ${
            activeLanternIndex === 1
              ? "brightness-110 saturate-125 shadow-[0_0_38px_rgba(125,211,252,0.6),0_20px_60px_-15px_rgba(125,211,252,0.5)]"
              : "brightness-100 saturate-100 shadow-[0_20px_60px_-15px_rgba(125,211,252,0.5)]"
          }`}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.28) 34%, rgba(255,255,255,0) 74%)" }}
          animate={activeLanternIndex === 1 ? { opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] } : { opacity: 0, scale: 0.94 }}
          transition={activeLanternIndex === 1 ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.35, ease: "easeOut" }}
        />
      </motion.div>
      <motion.div
        ref={shape3Ref}
        onClick={() => handleLanternSelect(2)}
        style={{
          y: starCombinedY,
          x: starCombinedX,
          rotate: starRotate,
        }}
        className="absolute bottom-[20%] left-[18%] w-24 h-24 z-20 pointer-events-auto cursor-pointer">
        <motion.div 
          animate={magnetActive.shape3 ? { y: 0, x: 0 } : { y: [0, -18, 0], x: [0, -10, 0] }} 
          transition={magnetActive.shape3 ? { duration: 0.25, ease: "easeOut" } : { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="relative w-full h-full">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-[12%] rounded-full blur-md"
            style={{ background: "radial-gradient(circle, rgba(255,255,255,0.75) 0%, rgba(221,214,254,0.35) 38%, rgba(255,255,255,0) 78%)" }}
            animate={activeLanternIndex === 2 ? { opacity: [0.72, 1, 0.72], scale: [1, 1.06, 1] } : { opacity: 0, scale: 0.84 }}
            transition={activeLanternIndex === 2 ? { duration: 1.9, repeat: Infinity, ease: "easeInOut" } : { duration: 0.35, ease: "easeOut" }}
          />
          <svg
            viewBox="0 0 100 100"
            className={`h-full w-full transition-[filter,drop-shadow] duration-500 ${
              activeLanternIndex === 2
                ? "brightness-110 saturate-125 drop-shadow-[0_0_34px_rgba(196,181,253,0.68)]"
                : "brightness-100 saturate-100 drop-shadow-[0_20px_25px_rgba(167,139,250,0.4)]"
            }`}
          >
            <defs>
              <linearGradient id="triGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ddd6fe" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#fae8ff" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              fill="url(#triGrad)"
              stroke="url(#triGrad)"
              strokeWidth="8"
              strokeLinejoin="round"
              d="M50 15 L88 82 L12 82 Z"
            />
          </svg>
        </motion.div>
      </motion.div>
      <motion.div
        ref={shape4Ref}
        onClick={() => handleLanternSelect(3)}
        style={{ x: shape4MagnetXSmooth, y: shape4Y }}
        className="absolute bottom-[25%] right-[15%] w-28 h-28 z-20 pointer-events-auto cursor-pointer"
      >
        <motion.div 
          animate={magnetActive.shape4 ? { y: 0, x: 0, rotate: 12 } : { y: [0, 25, 0], x: [0, 12, 0], rotate: [12, 25, 12] }} 
          transition={magnetActive.shape4 ? { duration: 0.25, ease: "easeOut" } : { duration: 9, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className={`relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100/70 to-orange-100/40 transition-[filter,box-shadow] duration-500 ${
            activeLanternIndex === 3
              ? "brightness-110 saturate-125 shadow-[0_0_38px_rgba(251,191,36,0.58),0_20px_60px_-15px_rgba(251,191,36,0.4)]"
              : "brightness-100 saturate-100 shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)]"
          }`}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.78) 0%, rgba(255,255,255,0.28) 34%, rgba(255,255,255,0) 74%)" }}
          animate={activeLanternIndex === 3 ? { opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] } : { opacity: 0, scale: 0.94 }}
          transition={activeLanternIndex === 3 ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.35, ease: "easeOut" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-stone-500">
        <span className="text-xs tracking-[0.3em] uppercase">Scroll</span>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
