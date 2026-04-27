import { motion, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { useSceneEasedProgress } from "./atmosphere";
import duckImg from "../../imports/Duck_9_(1).png";
import wacwacImg from "../../imports/Gemini_Generated_Image_qrrp7kqrrp7kqrrp_1.png";
import { ScaleOnScroll } from "./scale-on-scroll";

type Project = {
  year: string;
  title: string;
  role: string;
  tagline: string;
  body: string;
  tags: string[];
  accent: string;
  shape: "circle" | "square" | "triangle";
  imageLink: string;
  caseStudyLink: string;
};

const projects: Project[] = [
  {
    year: "2025",
    title: "WacWac",
    role: "Lead Programmer",
    tagline: "A casual duck race, engineered like a Swiss watch.",
    body: "Ducks should drift, not glide. I designed a phase-based cubic interpolation system so each racer felt physically present — and a deterministic architecture so every replay tells the exact same story.",
    tags: ["Unity", "C#", "Cubic Interpolation", "Deterministic Sim"],
    accent: "from-rose-200 to-orange-100",
    shape: "circle",
    imageLink: "http://play.phatpham.id.vn/",
    caseStudyLink: "https://github.com/Salt05/WacWac",
  },
  {
    year: "2026",
    title: "NumStrata",
    role: "Lead Programmer · Alpha",
    tagline: "Numbers, layered into puzzles.",
    body: "A number-puzzle game built around a seed-driven generator: every level is reproducible, tunable, and infinite. Backed by Firebase for live state, leaderboards, and the quiet glue of cloud.",
    tags: ["Unity", "C#", "Procedural Generation", "Firebase"],
    accent: "from-sky-200 to-violet-200",
    shape: "square",
    imageLink: "/Game/Apply%20Neumorphism%20Style/dist/index.html",
    caseStudyLink: "https://github.com/Salt05/NumStrata",
  },
];

function ShapeMark({
  shape,
  accent,
  progress,
  imageLink,
}: {
  shape: Project["shape"];
  accent: string;
  progress: any;
  imageLink: string;
}) {
  const y = useTransform(progress, [0, 1], [80, -80]);
  const rotate = useTransform(progress, [0, 1], [0, 30]);
  const base = `w-full h-full bg-gradient-to-br ${accent} shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] transition-colors duration-700`;

  return (
    <motion.a 
      href={imageLink}
      target="_blank"
      rel="noopener noreferrer"
      style={{ y, rotate }} 
      className="block aspect-square w-full max-w-md mx-auto cursor-pointer group"
    >
      {shape === "circle" && (
        <div className={`${base} rounded-full relative overflow-hidden flex items-center justify-center`}>
          <img src={duckImg} alt="Duck" className="w-[78%] h-[78%] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[0.85]" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none z-10">
            <span className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full text-sm tracking-[0.2em] uppercase text-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.1)] font-medium">
              Let me see
            </span>
          </div>
        </div>
      )}
      {shape === "square" && (
        <div className={`${base} rounded-3xl relative overflow-hidden`}>
          <img
            src={wacwacImg}
            alt="NumStrata"
            className="w-full h-full rounded-3xl object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[0.93]"
          />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none z-10">
            <span className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full text-sm tracking-[0.2em] uppercase text-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.1)] font-medium">
              Let me see
            </span>
          </div>
        </div>
      )}
      {shape === "triangle" && <div className={base} style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />}
    </motion.a>
  );
}

function ProjectScene({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const p = useSceneEasedProgress(ref as React.RefObject<HTMLElement>);
  const reverse = index % 2 === 1;

  return (
    <div ref={ref} className="relative min-h-[90vh] flex items-center py-20">
      <div className={`grid md:grid-cols-2 gap-12 md:gap-20 items-center w-full ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div className="relative">
          <ShapeMark shape={project.shape} accent={project.accent} progress={p} imageLink={project.imageLink} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
          <div className="flex items-baseline gap-4 text-stone-500 text-sm tracking-[0.2em] mb-6">
            <span>{project.year}</span><span>·</span><span>{project.role}</span>
          </div>
          <h3 className="text-[clamp(2.5rem,5vw,4rem)] font-light text-stone-800 leading-[1.05] mb-4">{project.title}</h3>
          <p className="italic font-serif text-2xl text-stone-500 mb-8">{project.tagline}</p>
          <p className="text-stone-600 leading-relaxed text-lg max-w-lg mb-10">{project.body}</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {project.tags.map((t) => (
              <span key={t} className="px-4 py-2 rounded-full border border-stone-300/70 text-stone-600 text-sm bg-white/40 backdrop-blur-sm">{t}</span>
            ))}
          </div>
          <a 
            href={project.caseStudyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors"
          >
            <span className="border-b border-stone-400 group-hover:border-stone-800">Read the case study</span>
            <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}

export function Work() {
  return (
    <section className="relative px-6 md:px-16 py-40">
      <div className="max-w-7xl mx-auto">
        <ScaleOnScroll>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-32">
            <p className="text-xs tracking-[0.4em] uppercase text-stone-500 mb-4">Chapter III · Selected Work</p>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.05] text-stone-800">
              Two projects.<br />
              <span className="italic font-serif text-sky-400/90">Two small worlds.</span>
            </h2>
          </motion.div>
        </ScaleOnScroll>
        {projects.map((p, i) => (
          <ScaleOnScroll key={p.title}>
            <ProjectScene project={p} index={i} />
          </ScaleOnScroll>
        ))}
      </div>
    </section>
  );
}
