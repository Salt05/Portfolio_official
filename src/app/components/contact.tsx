import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "motion/react";
import { Mail, Github, Linkedin, ArrowUpRight, FileDown } from "lucide-react";
import { ScaleOnScroll } from "./scale-on-scroll";

const QUIET_TEXT = "something quiet.";
const QUIET_CHARS = QUIET_TEXT.split("");

export function Contact() {
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const quietCharRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [quietShadows, setQuietShadows] = useState<string[]>(() =>
    QUIET_CHARS.map(() => "none")
  );
  const [quietOffsets, setQuietOffsets] = useState<Array<{ x: number; y: number }>>(() =>
    QUIET_CHARS.map(() => ({ x: 0, y: 0 }))
  );
  
  // Motion values for spotlight effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { damping: 20, stiffness: 150, mass: 0.2 });
  const smoothMouseY = useSpring(mouseY, { damping: 20, stiffness: 150, mass: 0.2 });
  
  const spotlightGradient = useMotionTemplate`radial-gradient(120px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(255,255,255,0.15), transparent 80%)`;
  const borderGradient = useMotionTemplate`radial-gradient(70px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(255,198,226,0.8), transparent 80%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    // Move spotlight to center smoothly when leaving
    mouseX.set(rect.width / 2);
    mouseY.set(rect.height / 2);
  };

  const updateQuietGlow = (clientX: number, clientY: number) => {
    const radius = 440;
    const startDistance = 200;
    const maxOffset = 5;
    const repelRadius = 240;
    const maxRepel = 35;
    const nextShadows = QUIET_CHARS.map((char, index) => {
      if (char === " ") return "none";
      const el = quietCharRefs.current[index];
      if (!el) return "none";

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distance = Math.hypot(dx, dy);
      if (distance > radius) return "none";

      const influence =
        distance <= startDistance
          ? 1
          : 1 - (distance - startDistance) / (radius - startDistance);
      const nx = distance === 0 ? 0 : dx / distance;
      const ny = distance === 0 ? 0 : dy / distance;
      const offsetX = nx * maxOffset * influence;
      const offsetY = ny * maxOffset * influence;
      const blur = 6 + 18 * influence;
      const alphaMain = 0.06 + 0.44 * influence;
      const alphaSoft = 0.03 + 0.2 * influence;
      const softOffsetX = offsetX * 1.7;
      const softOffsetY = offsetY * 1.7;

      // Directional-only glow: both layers are shifted toward mouse direction
      return `${offsetX.toFixed(2)}px ${offsetY.toFixed(2)}px ${blur.toFixed(2)}px rgba(255,198,226,${alphaMain.toFixed(2)}), ${softOffsetX.toFixed(2)}px ${softOffsetY.toFixed(2)}px ${(blur * 1.45).toFixed(2)}px rgba(255,255,255,${alphaSoft.toFixed(2)})`;
    });

    const nextOffsets = QUIET_CHARS.map((char, index) => {
      if (char === " ") return { x: 0, y: 0 };
      const el = quietCharRefs.current[index];
      if (!el) return { x: 0, y: 0 };

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = centerX - clientX;
      const dy = centerY - clientY;
      const distance = Math.hypot(dx, dy);
      if (distance >= repelRadius) return { x: 0, y: 0 };

      const force = (1 - distance / repelRadius) * maxRepel;
      const nx = distance === 0 ? 0 : dx / distance;
      const ny = distance === 0 ? -1 : dy / distance;
      return { x: nx * force, y: ny * force };
    });

    setQuietShadows(nextShadows);
    setQuietOffsets(nextOffsets);
  };

  const resetQuietGlow = () => {
    setQuietShadows(QUIET_CHARS.map(() => "none"));
    setQuietOffsets(QUIET_CHARS.map(() => ({ x: 0, y: 0 })));
  };

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      updateQuietGlow(event.clientX, event.clientY);
    };

    const onPointerLeave = () => {
      resetQuietGlow();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <section className="relative px-6 md:px-16 pt-40 pb-16 overflow-hidden">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-rose-100/40 via-violet-100/30 to-sky-100/40 blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto text-center relative">
        <ScaleOnScroll progressCeiling={0.58} freezeAfterFirstView>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-xs tracking-[0.4em] uppercase text-stone-500 mb-8">Final Chapter</motion.p>
        </ScaleOnScroll>

        <ScaleOnScroll progressCeiling={0.58} freezeAfterFirstView>
          <motion.h2
            initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-[clamp(3rem,9vw,8rem)] font-light leading-[0.95] text-stone-800 tracking-tight">
            Let's build<br />
            <span
              onPointerLeave={resetQuietGlow}
              onPointerCancel={resetQuietGlow}
              className="italic font-serif text-rose-400/90"
            >
              {QUIET_CHARS.map((char, index) => (
                <motion.span
                  key={`quiet-char-${index}`}
                  ref={(el) => {
                    quietCharRefs.current[index] = el;
                  }}
                  style={{
                    textShadow: quietShadows[index],
                  }}
                  animate={{ 
                    x: quietOffsets[index]?.x ?? 0, 
                    y: quietOffsets[index]?.y ?? 0 
                  }}
                  transition={{ type: "spring", stiffness: 150, damping: 12, mass: 1 }}
                  className="inline-block will-change-[text-shadow,transform]"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </span>
          </motion.h2>
        </ScaleOnScroll>

        <ScaleOnScroll progressCeiling={0.58} freezeAfterFirstView>
          <motion.a
            ref={buttonRef}
            href="mailto:pminhphathi@gmail.com?subject=Applying%20for%20the%20Game%20Designer%20Intern%20position.%20-%20Phạm%20Minh%20Phát"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative inline-flex items-center gap-3 mt-14 px-10 py-5 rounded-full bg-stone-800 text-stone-50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)] transition-[box-shadow,transform] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] cursor-pointer z-10 group">
            
            {/* Dynamic Spotlight Border */}
            <motion.div 
              className="absolute -inset-[1px] rounded-full z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: borderGradient }}
            />
            {/* Solid background covering center to reveal only 1px border glow */}
            <div className="absolute inset-0 bg-stone-800 rounded-full z-0 pointer-events-none" />

            {/* Internal Soft Spotlight */}
            <motion.div 
              className="absolute inset-0 rounded-full z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden"
              style={{ background: spotlightGradient }}
            />
            
            <div className="relative flex items-center gap-3 z-10 pointer-events-none">
              <Mail size={18} />
              
              <div className="relative grid items-center">
                <span className="font-medium col-start-1 row-start-1 transition-all duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:-translate-y-4 group-hover:opacity-0 group-hover:scale-95">
                  Say hello
                </span>
                <span className="font-medium col-start-1 row-start-1 text-rose-200 transition-all duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] translate-y-4 opacity-0 scale-95 group-hover:translate-y-0 group-hover:opacity-100 group-hover:scale-100 whitespace-nowrap">
                  Let's build together
                </span>
              </div>

              <div className="relative w-[18px] h-[18px] overflow-hidden ml-1">
                {/* First arrow - slides out up right */}
                <ArrowUpRight size={18} className="absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-x-full group-hover:-translate-y-full text-stone-50" />
                {/* Second arrow - slides in from bottom left */}
                <ArrowUpRight size={18} className="absolute inset-0 -translate-x-full translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-x-0 group-hover:translate-y-0 text-rose-200" />
              </div>
            </div>
          </motion.a>
        </ScaleOnScroll>

        <ScaleOnScroll progressCeiling={0.58} freezeAfterFirstView>
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.7 }}
            className="mt-16 flex justify-center gap-6">
            {[
              { icon: Github, label: "GitHub", shortText: "Github", href: "https://github.com/Salt05", target: "_blank" },
              { icon: Linkedin, label: "LinkedIn", shortText: "Linkedin", href: "https://www.linkedin.com/in/salt05/", target: "_blank" },
              { icon: Mail, label: "Email", shortText: "Email", href: "mailto:pminhphathi@gmail.com?subject=Applying%20for%20the%20Game%20Designer%20Intern%20position.%20-%20Phạm%20Minh%20Phát" },
              { icon: FileDown, label: "Download CV", shortText: "CV", href: "/CV-GameDesignIntern-PhamMinhPhat.pdf", download: "CV-GameDesignIntern-PhamMinhPhat.pdf" },
            ].map(({ icon: Icon, label, shortText, href, download, target }) => (
              <div key={label} className="flex flex-col items-center gap-2 group">
                <a
                  href={href}
                  download={download}
                  title={label}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}
                  className="relative w-14 h-14 rounded-2xl bg-white/60 backdrop-blur border border-white/80 shadow-[inset_2px_2px_5px_rgba(255,255,255,0.9),inset_-2px_-2px_5px_rgba(0,0,0,0.06),3px_3px_10px_rgba(0,0,0,0.08)] flex items-center justify-center text-stone-600 hover:text-stone-800 transition-colors">
                  {/* Icon ban đầu ở giữa, khi hover sẽ trượt lên mép trên */}
                  <div className="absolute transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-[calc(50%+14px)]">
                    <Icon size={24} />
                  </div>
                </a>
                {/* Text ẩn lúc đầu, hiện ra bên dưới khi hover */}
                <span className="text-sm font-medium text-stone-800 opacity-0 -translate-y-2 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                  {shortText}
                </span>
              </div>
            ))}
          </motion.div>
        </ScaleOnScroll>

        <ScaleOnScroll progressCeiling={0.58} freezeAfterFirstView>
          <div className="mt-12 pt-6 border-t border-stone-200/70 flex flex-col md:flex-row justify-between gap-2 text-sm text-stone-500">
            <span>Phạm Minh Phát · HUFLIT · Hồ Chí Minh City</span>
            <span>© 2026 — Designed with patience, built with care.</span>
          </div>
        </ScaleOnScroll>
      </div>
    </section>
  );
}
