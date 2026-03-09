import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Intercept",
    desc: "Risky interaction is detected and rerouted before reaching your main wallet.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <path d="M24 4v16" stroke="hsl(185 75% 52%)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 20l-12 12" stroke="hsl(185 75% 52%)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 4" />
        <path d="M24 20l12 12" stroke="hsl(185 75% 52%)" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        <circle cx="24" cy="20" r="3" fill="hsl(185 75% 52%)" fillOpacity="0.2" stroke="hsl(185 75% 52%)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Isolate",
    desc: "A disposable smart-wallet execution pocket is generated on-the-fly.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <rect x="12" y="12" width="24" height="24" rx="2" stroke="hsl(185 75% 52%)" strokeWidth="1.5" />
        <rect x="18" y="18" width="12" height="12" rx="1" stroke="hsl(185 75% 52%)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="24" cy="24" r="2" fill="hsl(185 75% 52%)" fillOpacity="0.4" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Execute",
    desc: "The interaction runs inside the isolated pocket with bounded risk exposure.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <rect x="14" y="14" width="20" height="20" rx="2" stroke="hsl(185 75% 52%)" strokeWidth="1.5" />
        <path d="M20 24h8M24 20v8" stroke="hsl(185 75% 52%)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="24" cy="24" r="16" stroke="hsl(185 75% 52%)" strokeWidth="0.5" strokeDasharray="2 6" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "Contain",
    desc: "If malicious, damage is trapped. Your main wallet remains untouched.",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
        <rect x="8" y="8" width="32" height="32" rx="3" stroke="hsl(185 75% 52%)" strokeWidth="1.5" />
        <rect x="16" y="16" width="16" height="16" rx="1" stroke="hsl(185 75% 52%)" strokeWidth="1" />
        <path d="M16 24h-8M32 24h8M24 16v-8M24 32v8" stroke="hsl(185 75% 52%)" strokeWidth="0.5" opacity="0.5" />
      </svg>
    ),
  },
];

// Each step occupies an equal slice of the scroll range [0.05 … 0.95]
const SCROLL_START = 0.05;
const SCROLL_END = 0.95;
const STEP_RANGE = (SCROLL_END - SCROLL_START) / steps.length; // 0.225 per step

function stepScrollBounds(index: number) {
  const start = SCROLL_START + index * STEP_RANGE;
  const end = start + STEP_RANGE;
  return { start, end };
}

// ─── Step card opacity / y / scale ───────────────────────────────────────────
function useStepCardMotion(scrollYProgress: MotionValue<number>, index: number) {
  const { start, end } = stepScrollBounds(index);
  const isLast = index === steps.length - 1;

  const opacity = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [0, 1, 1, isLast ? 1 : 0]
  );
  const scale = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [0.88, 1, 1, isLast ? 1 : 0.94]
  );
  const y = useTransform(
    scrollYProgress,
    [start, start + 0.04, end - 0.04, end],
    [48, 0, 0, isLast ? 0 : -24]
  );

  return { opacity, scale, y };
}

// ─── Step indicator active state ─────────────────────────────────────────────
function useStepIndicatorMotion(scrollYProgress: MotionValue<number>, index: number) {
  const { start, end } = stepScrollBounds(index);

  // Active when this step's range is in view
  const opacity = useTransform(scrollYProgress, [start, start + 0.04, end - 0.04, end], [0.3, 1, 1, 0.3]);
  const x = useTransform(scrollYProgress, [start, start + 0.04], [0, 8]);
  const descOpacity = useTransform(scrollYProgress, [start, start + 0.04, end - 0.04, end], [0, 1, 1, 0]);

  return { opacity, x, descOpacity };
}

// ─── Flow diagram path length ─────────────────────────────────────────────────
function useFlowMotion(scrollYProgress: MotionValue<number>) {
  const pathLength = useTransform(scrollYProgress, [SCROLL_START, SCROLL_END], [0, 1]);
  const glowOpacity = useTransform(scrollYProgress, [SCROLL_START, SCROLL_START + 0.15], [0, 0.15]);
  return { pathLength, glowOpacity };
}

// ─── MechanismSection ─────────────────────────────────────────────────────────
const MechanismSection = () => {
  // Single tall scroll container — this is the ONLY element useScroll tracks
  const scrollRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  return (
    // Outer wrapper: provides the tall scrollable height AND is the ref target
    <div
      id="mechanism"
      ref={scrollRef}
      style={{ height: `${steps.length * 100 + 50}vh` }} // 450 vh for 4 steps
      className="relative"
    >
      {/* Single sticky viewport — fills exactly 100 vh and never moves */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ward-surface/30 to-transparent pointer-events-none" />

        <div className="relative w-full max-w-[1200px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left: header + step list */}
            <div className="lg:col-span-5">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs font-body font-medium tracking-[0.2em] uppercase text-ward-cyan"
              >
                How Ward Works
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="mt-6 font-heading text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight text-ward-text-primary"
              >
                Execution isolation
                <br />
                in four phases.
              </motion.h2>

              {/* Step indicators */}
              <div className="mt-12 space-y-1">
                {steps.map((step, i) => (
                  <StepIndicator
                    key={step.num}
                    step={step}
                    index={i}
                    scrollYProgress={scrollYProgress}
                  />
                ))}
              </div>
            </div>

            {/* Right: stacked step cards */}
            <div className="lg:col-span-7 relative h-[400px] md:h-[480px]">
              {steps.map((step, i) => (
                <StepVisual
                  key={step.num}
                  step={step}
                  index={i}
                  scrollYProgress={scrollYProgress}
                />
              ))}
              <FlowDiagram scrollYProgress={scrollYProgress} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepIndicator = ({
  step,
  index,
  scrollYProgress,
}: {
  step: (typeof steps)[number];
  index: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const { opacity, x, descOpacity } = useStepIndicatorMotion(scrollYProgress, index);

  return (
    <motion.div
      style={{ opacity, x }}
      className="flex items-start gap-4 py-3 px-4 rounded-sm"
    >
      <span className="text-xs font-body font-medium text-ward-cyan w-6 mt-1">{step.num}</span>
      <div className="flex-1">
        <h3 className="font-heading text-lg font-semibold text-ward-text-primary">{step.title}</h3>
        <motion.p
          style={{ opacity: descOpacity }}
          className="text-sm font-body text-ward-text-secondary leading-relaxed mt-1"
        >
          {step.desc}
        </motion.p>
      </div>
    </motion.div>
  );
};

const StepVisual = ({
  step,
  index,
  scrollYProgress,
}: {
  step: (typeof steps)[number];
  index: number;
  scrollYProgress: MotionValue<number>;
}) => {
  const { opacity, scale, y } = useStepCardMotion(scrollYProgress, index);

  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="w-full max-w-[420px] p-8 md:p-10 border border-ward-line bg-card rounded-sm relative">
        <span className="absolute top-4 right-5 text-xs font-body font-medium text-ward-text-tertiary tracking-wider">
          {step.num}
        </span>
        <div className="mb-8">{step.icon}</div>
        <h3 className="font-heading text-2xl md:text-3xl font-semibold text-ward-text-primary">
          {step.title}
        </h3>
        <p className="mt-4 text-sm font-body text-ward-text-secondary leading-relaxed">
          {step.desc}
        </p>
        <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-ward-cyan/40 via-ward-cyan/10 to-transparent" />
      </div>
    </motion.div>
  );
};

const FlowDiagram = ({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) => {
  const { pathLength, glowOpacity } = useFlowMotion(scrollYProgress);

  return (
    <motion.div
      style={{ opacity: glowOpacity }}
      className="absolute inset-0 pointer-events-none"
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 500 480"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.rect
          x="50" y="40" width="400" height="400" rx="8"
          stroke="hsl(185 75% 52%)" strokeWidth="0.5"
          style={{ pathLength }} fill="none"
        />
        <motion.rect
          x="120" y="110" width="260" height="260" rx="4"
          stroke="hsl(185 75% 52%)" strokeWidth="0.5" strokeDasharray="4 6"
          style={{ pathLength }} fill="none"
        />
        <motion.path
          d="M250 0 L250 110 L250 240"
          stroke="hsl(185 75% 52%)" strokeWidth="1"
          style={{ pathLength }} fill="none"
        />
        <motion.path
          d="M250 240 L120 370"
          stroke="hsl(185 75% 52%)" strokeWidth="0.5" strokeDasharray="3 5"
          style={{ pathLength }} fill="none"
        />
        <motion.path
          d="M250 240 L380 370"
          stroke="hsl(185 75% 52%)" strokeWidth="0.5" strokeDasharray="3 5"
          style={{ pathLength }} fill="none"
        />
      </svg>
    </motion.div>
  );
};

export default MechanismSection;
