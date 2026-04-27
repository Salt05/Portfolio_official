import { Atmosphere, GrainOverlay, SunsetOrbs } from "./components/atmosphere";
import { SmoothScroll } from "./components/smooth-scroll";
import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { Intro } from "./components/intro";
import { Story } from "./components/story";
import { Work } from "./components/work";
import { Skills } from "./components/skills";
import { Contact } from "./components/contact";
import { Preloader } from "./components/preloader";
import { CursorDot } from "./components/cursor-dot";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const BACKGROUND_PRESETS = [
  "linear-gradient(180deg, #fff3f8 0%, #ffdbe9 44%, #ffe7f1 100%)",
  "linear-gradient(180deg, #eefbff 0%, #d7f0ff 44%, #e4f5ff 100%)",
  "linear-gradient(180deg, #f6f4ff 0%, #e6ddff 44%, #f3eaff 100%)",
  "linear-gradient(180deg, #fff9ef 0%, #ffe3bf 44%, #ffedd4 100%)",
] as const;

const DEFAULT_BACKGROUND = "linear-gradient(180deg, #fafaf9 0%, #fff1f2 50%, #f0f9ff 100%)";
const NIGHT_BACKGROUND_PRESETS = [
  "linear-gradient(180deg, #10121c 0%, #19152a 44%, #1d1123 100%)",
  "linear-gradient(180deg, #0e1724 0%, #132438 44%, #1b2137 100%)",
  "linear-gradient(180deg, #15142a 0%, #201a3b 44%, #1f1f40 100%)",
  "linear-gradient(180deg, #181717 0%, #2a1f25 44%, #322621 100%)",
] as const;
const NIGHT_DEFAULT_BACKGROUND = "linear-gradient(180deg, #0d1018 0%, #151728 50%, #101a2a 100%)";

export default function App() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [activeBackground, setActiveBackground] = useState<number | null>(null);
  const [isNightMode, setIsNightMode] = useState(false);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    const forceTop = () => window.scrollTo(0, 0);
    forceTop();
    const rafId = window.requestAnimationFrame(forceTop);
    const timeoutId = window.setTimeout(forceTop, 60);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleLanternSelect = (index: number) => {
    setActiveBackground((prev) => (prev === index ? null : index));
  };

  const activeGradient = isNightMode
    ? activeBackground === null
      ? NIGHT_DEFAULT_BACKGROUND
      : NIGHT_BACKGROUND_PRESETS[activeBackground]
    : activeBackground === null
      ? DEFAULT_BACKGROUND
      : BACKGROUND_PRESETS[activeBackground];

  return (
    <div data-theme={isNightMode ? "night" : "day"} className="relative min-h-screen text-stone-800 overflow-x-hidden">
      <AnimatePresence mode="sync" initial={false}>
        <motion.div
          key={`${isNightMode ? "night" : "day"}-${activeBackground ?? -1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-0 -z-6"
          style={{ backgroundImage: activeGradient }}
        />
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      </AnimatePresence>

      <SmoothScroll />
      <SunsetOrbs />
      <Atmosphere />
      <GrainOverlay />
      <CursorDot isNightMode={isNightMode} />
      <Nav isNightMode={isNightMode} onToggleNightMode={() => setIsNightMode((prev) => !prev)} />

      <main className="relative">
        <div id="hero" className="relative"><Hero activeLanternIndex={activeBackground ?? -1} onLanternSelect={handleLanternSelect} /></div>
        <div id="intro" className="relative"><Intro /></div>
        <div id="story" className="relative"><Story /></div>
        <div id="work" className="relative"><Work /></div>
        <div id="skills" className="relative"><Skills /></div>
        <div id="contact" className="relative"><Contact /></div>
      </main>
    </div>
  );
}
