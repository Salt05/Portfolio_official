import { motion, useTransform } from "motion/react";
import { useRef } from "react";
import { useSceneEasedProgress } from "./atmosphere";
import { ScaleOnScroll } from "./scale-on-scroll";

const chapters = [
  {
    no: "01",
    title: "Where it began",
    body: "Long before code, there were games — the kind I'd quietly take apart, mod, rebuild. I wanted to know why a jump felt right, why a curve felt human.",
  },
  {
    no: "02",
    title: "The HUFLIT years — 2023",
    body: "Software engineering at HUFLIT gave me a vocabulary: architecture, systems, the discipline of thinking before typing. I learned that good code is mostly good decisions, written down.",
  },
  {
    no: "03",
    title: "Math as material",
    body: "Vectors, matrices, interpolation — they stopped being equations and became clay. Cubic phases shape a duck's drift. A seed shapes a puzzle. The math, finally, was the feeling.",
  },
  {
    no: "04",
    title: "What's next",
    body: "Now I'm searching for a Game Dev internship — a studio where I can keep listening, keep architecting, and help build small worlds that mean something.",
  },
];

export function Story() {
  const ref = useRef<HTMLElement>(null!);
  const p = useSceneEasedProgress(ref);
  const lineHeight = useTransform(p, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative px-6 md:px-16 py-40">
      <div className="max-w-6xl mx-auto">
        <ScaleOnScroll>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-24">
            <p className="text-xs tracking-[0.4em] uppercase text-stone-500 mb-4">Chapter II</p>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.05] text-stone-800">
              A story, not<br />
              <span className="italic font-serif text-violet-400/90">a resume.</span>
            </h2>
          </motion.div>
        </ScaleOnScroll>

        <div className="relative grid md:grid-cols-[auto_1fr] gap-x-12">
          <div className="hidden md:block relative w-px bg-stone-200">
            <motion.div style={{ height: lineHeight }} className="absolute top-0 left-0 w-full bg-gradient-to-b from-rose-300 via-violet-300 to-sky-300" />
          </div>
          <div className="space-y-32">
            {chapters.map((c, i) => (
              <ScaleOnScroll key={c.no}>
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-15%" }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="grid md:grid-cols-[120px_1fr] gap-6 items-start">
                  <div className="text-stone-400 tracking-[0.2em] text-sm">{c.no}</div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-light text-stone-800 mb-5">{c.title}</h3>
                    <p className="text-stone-600 leading-relaxed text-lg max-w-xl">{c.body}</p>
                  </div>
                </motion.div>
              </ScaleOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
