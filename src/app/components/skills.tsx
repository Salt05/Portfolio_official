import { motion } from "motion/react";
import { 
  Gamepad2,
  Code2,
  Calculator,
  Spline,
  Network,
  Flame,
  Database,
  Figma,
  Coffee
} from "lucide-react";
import { ScaleOnScroll } from "./scale-on-scroll";

const skillsData = [
  { name: "Unity", desc: "Engine, fluently", icon: Gamepad2, color: "text-sky-500" },
  { name: "C#", desc: "First language of thought", icon: Code2, color: "text-purple-500" },
  { name: "Linear Algebra", desc: "Vectors & matrices", icon: Calculator, color: "text-emerald-500" },
  { name: "Interpolation", desc: "Cubic, easing, phases", icon: Spline, color: "text-pink-500" },
  { name: "System Architecture", desc: "Design before code", icon: Network, color: "text-indigo-500" },
  { name: "Firebase", desc: "Realtime backends", icon: Flame, color: "text-orange-500" },
  { name: "SQL Server", desc: "Relational queries", icon: Database, color: "text-blue-400" },
  { name: "Figma", desc: "UI/UX & Prototyping", icon: Figma, color: "text-rose-500" },
  { name: "Java", desc: "OOP & Backend logic", icon: Coffee, color: "text-amber-600" },
];

export function Skills() {
  return (
    <section className="relative px-6 md:px-16 py-40">
      <div className="max-w-5xl mx-auto">
        <ScaleOnScroll>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-20">
            <p className="text-xs tracking-[0.4em] uppercase text-stone-500 mb-4">Chapter IV · Toolkit</p>
            <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-light leading-[1.05] text-stone-800">
              What I reach for<br />
              <span className="italic font-serif text-emerald-400/90">when the room goes quiet.</span>
            </h2>
          </motion.div>
        </ScaleOnScroll>

        <ScaleOnScroll>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {skillsData.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  whileHover={{ scale: 1.02, y: -8 }}
                  className="relative group p-6 rounded-[2rem] flex flex-col items-start gap-4 cursor-pointer bg-white/20 backdrop-blur-2xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden"
                >
                  {/* Subtle highlight glow on hover */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/60 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className={`relative z-10 p-3 rounded-2xl bg-white/60 border border-white/60 shadow-[0_4px_15px_rgba(0,0,0,0.03)] ${skill.color} group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 ease-out`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>

                  <div className="relative z-10 mt-2">
                    <h3 className="font-light text-stone-800 text-lg tracking-wide mb-1">
                      {skill.name}
                    </h3>
                    <p className="text-stone-500 text-sm font-light leading-relaxed">
                      {skill.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </ScaleOnScroll>

        <ScaleOnScroll>
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}
            className="mt-20 pt-12 border-t border-stone-200/80 grid md:grid-cols-3 gap-8 text-stone-600">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">Philosophy</p>
              <p className="leading-relaxed text-sm">Architecture before syntax. Strategy before keystroke.</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">Language</p>
              <p className="leading-relaxed text-sm">I can converse in both Vietnamese and English.</p>
            </div>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-stone-400 mb-3">Off hours</p>
              <p className="leading-relaxed text-sm">Learning English, editing games, and doing reverse engineering to find enjoyment.</p>
            </div>
          </motion.div>
        </ScaleOnScroll>
      </div>
    </section>
  );
}
