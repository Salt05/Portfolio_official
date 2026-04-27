import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, useSpring } from "motion/react";
import lanternDay from "../../../image/README/lantern_day.png";
import lanternNight from "../../../image/README/lantern_night.png";

type NavProps = {
  isNightMode: boolean;
  onToggleNightMode: () => void;
};

export function Nav({ isNightMode, onToggleNightMode }: NavProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 80, damping: 22, mass: 0.4 });
  const width = useTransform(p, [0, 1], ["0%", "100%"]);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const prevScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = prevScrollY.current;
    const delta = latest - previous;

    if (latest <= 16) {
      setIsNavHidden(false);
    } else if (delta > 2) {
      setIsNavHidden(true);
    } else if (delta < -2) {
      setIsNavHidden(false);
    }

    prevScrollY.current = latest;
  });

  return (
    <>
      <motion.div
        style={{ width }}
        className={`fixed top-0 left-0 h-[3px] z-50 ${
          isNightMode
            ? "bg-gradient-to-r from-sky-300 via-violet-300 to-rose-300 shadow-[0_0_14px_rgba(191,219,254,0.6)]"
            : "bg-gradient-to-r from-rose-500 via-fuchsia-500 to-blue-500 shadow-[0_0_12px_rgba(236,72,153,0.35)]"
        }`}
      />
      <motion.header
        animate={{ y: isNavHidden ? -96 : 0, opacity: isNavHidden ? 0 : 1 }}
        transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-40 px-6 md:px-16 py-6 flex justify-between items-center"
      >
        <motion.a href="#" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="flex items-center gap-2 text-stone-700">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-rose-300 to-violet-300 shadow-[0_0_15px_rgba(244,114,182,0.6)]" />
          <span className="tracking-[0.2em] text-sm uppercase">SALT</span>
        </motion.a>
        <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden md:flex items-center gap-8 text-sm text-stone-600">
          <a href="#hero" className="hover:text-stone-900 transition-colors">Prologue</a>
          <a href="#story" className="hover:text-stone-900 transition-colors">Story</a>
          <a href="#work" className="hover:text-stone-900 transition-colors">Work</a>
          <a href="#skills" className="hover:text-stone-900 transition-colors">Skills</a>
          <a href="#contact" className="px-5 py-2 rounded-full bg-stone-800 text-stone-50 hover:bg-stone-900 transition-colors">Contact</a>
        </motion.nav>
      </motion.header>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isNavHidden ? 0 : 1,
          pointerEvents: isNavHidden ? "none" : "auto"
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        type="button"
        onClick={onToggleNightMode}
        aria-label={isNightMode ? "Switch to day mode" : "Switch to night mode"}
        title={isNightMode ? "Day mode" : "Night mode"}
        className={`fixed bottom-8 left-6 md:left-16 z-50 h-12 w-12 rounded-xl border backdrop-blur transition-all duration-300 ${
          isNightMode
            ? "border-rose-200/40 bg-slate-900/50 shadow-[0_0_20px_rgba(255,207,145,0.25)]"
            : "border-stone-300/75 bg-white/55 hover:border-rose-500/45 shadow-lg"
        }`}
      >
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-0 rounded-xl transition-opacity duration-300 ${
            isNightMode
              ? "opacity-100 bg-[radial-gradient(circle_at_50%_55%,rgba(255,222,157,0.25)_0%,rgba(255,222,157,0.1)_48%,transparent_76%)]"
              : "opacity-0"
          }`}
        />
        <img
          src={isNightMode ? lanternNight : lanternDay}
          alt=""
          aria-hidden="true"
          className={`relative z-10 h-full w-full object-contain p-1.5 transition-all duration-300 ${
            isNightMode ? "drop-shadow-[0_0_12px_rgba(255,226,170,0.55)]" : ""
          }`}
        />
      </motion.button>
    </>
  );
}
