import { motion, useTransform, AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { useSceneEasedProgress } from "./atmosphere";
import { ScaleOnScroll } from "./scale-on-scroll";

export function Intro() {
  const ref = useRef<HTMLElement>(null!);
  const p = useSceneEasedProgress(ref);
  const words = "I am drawn to the quiet logic underneath chaos — vectors, matrices, the small interpolations that make a duck race feel alive.".split(" ");
  const [isProfileHovered, setIsProfileHovered] = useState(false);
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center px-6 md:px-16 py-32">
      <div
        className="absolute right-[8%] top-[20%] z-20 flex flex-col items-center cursor-help"
        onMouseEnter={() => setIsProfileHovered(true)}
        onMouseLeave={() => {
          setIsProfileHovered(false);
          setHasPlayedIntro(true);
        }}
      >
        {/* Animated Ring Decor */}
        <motion.div
          animate={{
            scale: isProfileHovered ? 1.3 : 1,
            opacity: isProfileHovered ? 0.6 : 0,
          }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="absolute w-60 h-60 rounded-full border border-stone-400/30 pointer-events-none z-0"
        />

        {/* Simple Circular Profile Image */}
        <motion.div
          animate={{
            scale: isProfileHovered ? 1.15 : 1,
            boxShadow: isProfileHovered ? "0 20px 40px -10px rgba(0,0,0,0.3)" : "0 10px 20px -5px rgba(0,0,0,0.1)"
          }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-60 h-60 rounded-full overflow-hidden border border-stone-200/50 shadow-xl shrink-0"
        >
          <img src="/profile.png" alt="Pham Minh Phat" className="w-full h-full object-cover" />
        </motion.div>

        {/* Subtle Hint Text (Blinks until first hover) */}
        {!hasPlayedIntro && !isProfileHovered && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: [0.2, 0.5, 0.2],
              y: 0 
            }}
            transition={{ 
              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
              y: { duration: 0.8 }
            }}
            className="mt-6 text-stone-400 text-[10px] tracking-[0.3em] uppercase pointer-events-none"
          >
            Behind the silence
          </motion.p>
        )}

        {/* Floating Text Below */}
        <div className={`mt-10 max-w-[300px] text-center transition-all duration-500 ${isProfileHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
          <h3 className="text-stone-800 font-semibold mb-2 tracking-wide text-lg">Salt — Pham Minh Phat</h3>
          <p className="text-stone-600 text-xs md:text-sm leading-relaxed font-light">
            {"At 21, I find my peace in quiet corners with my music or taking slow walks with my dogs, rather than in the hustle.".split(" ").map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={isProfileHovered ? { opacity: 1 } : { opacity: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: (isProfileHovered && !hasPlayedIntro) ? (i * 0.08) : 0 
                }}
                className="inline-block mr-[0.25em]"
              >
                {word}
              </motion.span>
            ))}
          </p>
        </div>
      </div>
      <motion.div
        style={{ y: useTransform(p, [0, 1], [100, -150]) }}
        className="absolute left-[5%] bottom-[15%] w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-100/60 to-teal-50/40 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.3)]" />

      <div className="max-w-5xl mx-auto relative z-10 md:pr-80">
        <ScaleOnScroll>
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-xs tracking-[0.4em] uppercase text-stone-500 mb-12">— A brief introduction</motion.p>
        </ScaleOnScroll>
        <ScaleOnScroll>
          <p className="text-[clamp(1.5rem,3.5vw,2.75rem)] leading-[1.4] text-stone-700 font-light">
            {words.map((w, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0.15 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, margin: "-30% 0px -30% 0px" }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                className="inline-block mr-[0.25em]">
                {w}
              </motion.span>
            ))}
          </p>
        </ScaleOnScroll>
      </div>

      <div className="absolute bottom-12 right-6 md:right-16 md:bottom-16 z-10">
        <ScaleOnScroll>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className="text-stone-500 max-w-none whitespace-nowrap text-right text-lg leading-relaxed font-light">
              Phạm Minh Phát — A third-year software engineering student.
            </p>
          </motion.div>
        </ScaleOnScroll>
      </div>
    </section>
  );
}
