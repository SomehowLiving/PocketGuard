import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const archItems = [
  {
    label: "Pocket Factory",
    desc: "On-demand generation of ephemeral smart-wallet containers.",
  },
  {
    label: "Execution Router",
    desc: "Deterministic routing layer that intercepts and redirects risky calls.",
  },
  {
    label: "Containment Module",
    desc: "Bounded execution environment with automatic state rollback.",
  },
  {
    label: "Settlement Layer",
    desc: "Safe result propagation back to the caller after verified execution.",
  },
];

const TrustSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="trust" className="relative py-32 md:py-48">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ward-surface/20 to-transparent" />

      <div className="relative max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left: architecture */}
          <div className="md:col-span-7" ref={ref}>
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="text-xs font-body font-medium tracking-[0.2em] uppercase text-ward-cyan"
            >
              Architecture
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-heading text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight text-ward-text-primary"
            >
              Engineered for
              <br />
              structural safety.
            </motion.h2>

            {/* Architecture blocks */}
            <div className="mt-16 space-y-4">
              {archItems.map((item, i) => (
                <ArchBlock key={item.label} item={item} index={i} />
              ))}
            </div>
          </div>

          {/* Right: deployment status */}
          <div className="md:col-span-4 md:col-start-9 mt-8 md:mt-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 border border-ward-line bg-card rounded-sm"
            >
              <span className="text-xs font-body font-medium tracking-[0.15em] uppercase text-ward-text-tertiary">
                Deployment Status
              </span>

              <div className="mt-8 space-y-6">
                <StatusItem label="Sepolia Testnet" status="Live" active />
                <StatusItem label="Base Sepolia" status="Live" active />
                <StatusItem label="Arbitrum Sepolia" status="Deploying" />
                <StatusItem label="Mainnet" status="Q2 2026" />
              </div>

              <div className="mt-10 pt-6 border-t border-ward-line">
                <span className="text-xs font-body text-ward-text-tertiary">
                  Contracts audited. Architecture reviewed.
                </span>
              </div>
            </motion.div>

            {/* Abstract geometric */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 1.2, delay: 0.6 }}
              className="mt-8 flex justify-end"
            >
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="opacity-10">
                <rect x="10" y="10" width="100" height="100" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
                <rect x="30" y="30" width="60" height="60" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
                <line x1="10" y1="10" x2="30" y2="30" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
                <line x1="110" y1="10" x2="90" y2="30" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
                <line x1="10" y1="110" x2="30" y2="90" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
                <line x1="110" y1="110" x2="90" y2="90" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ArchBlock = ({ item, index }: { item: typeof archItems[number]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-6 p-6 border-l-2 border-ward-line hover:border-ward-cyan/40 transition-colors duration-500 group"
    >
      <span className="text-xs font-body font-medium text-ward-text-tertiary mt-1 tracking-wider">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <h4 className="font-heading text-base font-semibold text-ward-text-primary group-hover:text-ward-cyan transition-colors duration-300">
          {item.label}
        </h4>
        <p className="mt-1.5 text-sm font-body text-ward-text-secondary leading-relaxed">{item.desc}</p>
      </div>
    </motion.div>
  );
};

const StatusItem = ({ label, status, active }: { label: string; status: string; active?: boolean }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-body text-ward-text-secondary">{label}</span>
    <div className="flex items-center gap-2">
      <div
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-ward-cyan animate-pulse-subtle" : "bg-ward-text-tertiary"}`}
      />
      <span className={`text-xs font-body font-medium ${active ? "text-ward-cyan" : "text-ward-text-tertiary"}`}>
        {status}
      </span>
    </div>
  </div>
);

export default TrustSection;
