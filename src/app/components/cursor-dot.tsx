import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function CursorDot() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 220, damping: 24, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 220, damping: 24, mass: 0.35 });
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");
    const updateInputMode = () => setIsTouchDevice(media.matches);
    updateInputMode();

    const handlePointerMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handlePointerLeave = () => setIsVisible(false);
    const handlePointerEnter = () => setIsVisible(true);

    media.addEventListener("change", updateInputMode);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", handlePointerLeave);
    window.addEventListener("pointerenter", handlePointerEnter);

    return () => {
      media.removeEventListener("change", updateInputMode);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("pointerenter", handlePointerEnter);
    };
  }, [isVisible, x, y]);

  if (isTouchDevice) return null;

  return (
    <>
      <motion.div
        aria-hidden="true"
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.9 }}
        transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        style={{ x, y }}
        className="pointer-events-none fixed top-0 left-0 z-[71] w-7 h-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white mix-blend-difference"
      />
      <motion.div
        aria-hidden="true"
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.7 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        style={{ x: springX, y: springY }}
        className="pointer-events-none fixed top-0 left-0 z-[70] w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
      />
    </>
  );
}
