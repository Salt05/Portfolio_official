import { useState, useEffect } from "react";
import { motion } from "motion/react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+0123456789";
const TARGET_TEXT = "Turning imagination into playable realities";

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [displayText, setDisplayText] = useState("");
  const [phase, setPhase] = useState<"scrambling" | "subtext">("scrambling");

  useEffect(() => {
    let iteration = 0;

    // Disable body scroll when preloader is active
    document.body.style.overflow = "hidden";

    const interval = setInterval(() => {
      setDisplayText((prev) => {
        return TARGET_TEXT.split("")
          .map((letter, index) => {
            if (index < iteration) {
              return TARGET_TEXT[index];
            }
            if (TARGET_TEXT[index] === " ") return " ";
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });

      if (iteration >= TARGET_TEXT.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("subtext"), 400);
      }

      iteration += 1; // Tốc độ chạy hiệu ứng
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === "subtext") {
      const timer = setTimeout(() => {
        onComplete();
        // Restore scrolling right before exit animation finishes
        setTimeout(() => {
          document.body.style.overflow = "";
        }, 1000);
      }, 2000); // Đợi 2 giây sau khi hiện chữ subtext rồi mới kéo lên
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <motion.div
      initial={{ y: 0 }}
      exit={{ y: "-100vh", transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } }}
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#E7EEFB] overflow-hidden"
    >
      {/* Background Gradient nhẹ để tạo chiều sâu trên nền #E7EEFB */}
      <div className="absolute inset-0 opacity-50 bg-gradient-to-br from-white/30 via-transparent to-black/5" />

      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center w-full h-full">
        {/* Main Text */}
        <h1 className="tracking-[0.4em] text-xs uppercase text-stone-500 mb-8 h-[30px] flex items-center justify-center">
          {displayText}
        </h1>

        {/* Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{
            opacity: phase === "subtext" ? 1 : 0,
            y: phase === "subtext" ? 0 : 10,
            filter: phase === "subtext" ? "blur(0px)" : "blur(4px)"
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute bottom-12 text-sm md:text-base italic font-serif text-stone-900 tracking-[0.4em]"
        >
          CREATED BY SALT
        </motion.div>
      </div>
    </motion.div>
  );
}
