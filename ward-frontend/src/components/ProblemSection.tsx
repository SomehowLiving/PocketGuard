import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ProblemSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 md:py-48">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Asymmetric layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-6">
          {/* Left: problem statement */}
          <div className="md:col-span-5 md:col-start-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="text-xs font-body font-medium tracking-[0.2em] uppercase text-ward-cyan"
            >
              The Problem
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-heading text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight text-ward-text-primary"
            >
              Detection
              <br />
              alone isn't
              <br />
              enough.
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 w-12 h-px bg-ward-cyan origin-left"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-base font-body text-ward-text-secondary leading-relaxed max-w-sm"
            >
              Current security tools warn you about threats. But by the time you see the alert,
              the transaction has already been signed. Your wallet is already drained.
            </motion.p>
          </div>

          {/* Right: contrast visual */}
          <div className="md:col-span-6 md:col-start-7 mt-8 md:mt-24">
            {/* Detection card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 border border-ward-line bg-card rounded-sm mb-4"
            >
              <div className="flex items-start gap-6">
                <svg className="w-8 h-8 flex-shrink-0 mt-1" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="hsl(0 62% 50%)" strokeWidth="1.5" strokeDasharray="4 3" />
                  <path d="M12 12l8 8M20 12l-8 8" stroke="hsl(0 62% 50%)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Detection</h3>
                  <p className="mt-2 text-sm font-body text-ward-text-secondary leading-relaxed">
                    Identifies threats after interaction is initiated. Alerts fire, but funds are already at risk.
                    Reactive. Post-execution.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Containment card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 border border-ward-cyan/30 bg-card rounded-sm relative glow-cyan"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-ward-cyan rounded-l-sm" />
              <div className="flex items-start gap-6">
                <svg className="w-8 h-8 flex-shrink-0 mt-1" viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="4" width="24" height="24" rx="2" stroke="hsl(185 75% 52%)" strokeWidth="1.5" />
                  <rect x="10" y="10" width="12" height="12" rx="1" stroke="hsl(185 75% 52%)" strokeWidth="1" />
                  <circle cx="16" cy="16" r="3" fill="hsl(185 75% 52%)" fillOpacity="0.3" stroke="hsl(185 75% 52%)" strokeWidth="1" />
                </svg>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Containment</h3>
                  <p className="mt-2 text-sm font-body text-ward-text-secondary leading-relaxed">
                    Isolates execution before interaction completes. Damage is contained in a disposable pocket.
                    Proactive. Pre-execution.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
