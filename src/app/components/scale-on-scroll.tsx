import { type ReactNode, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";

type ScaleOnScrollProps = {
  children: ReactNode;
  className?: string;
  minScale?: number;
  progressCeiling?: number;
  freezeAfterFirstView?: boolean;
};

export function ScaleOnScroll({
  children,
  className,
  minScale = 0.9,
  progressCeiling = 1,
  freezeAfterFirstView = false,
}: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const normalizedProgress = useTransform(
    scrollYProgress,
    [0, progressCeiling],
    [0, 1],
    { clamp: true },
  );

  // Scale is strongest near entry/exit and stays stable while element is centered.
  const rawScale = useTransform(
    normalizedProgress,
    [0, 0.25, 0.75, 1],
    [minScale, 1, 1, minScale],
  );
  const scale = useSpring(rawScale, { stiffness: 130, damping: 24, mass: 0.35 });

  return (
    <motion.div
      ref={ref}
      onViewportEnter={() => {
        if (freezeAfterFirstView) {
          setHasEnteredViewport(true);
        }
      }}
      style={{
        scale: freezeAfterFirstView && hasEnteredViewport ? 1 : scale,
        transformOrigin: "100% 100%",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
