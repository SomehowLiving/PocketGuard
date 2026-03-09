import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const integrations = [
  {
    title: "Wallets",
    desc: "Protect user wallets from malicious contract interactions and approval exploits.",
    marker: "W",
    tilt: { rotateX: 3, rotateY: -4 },
    origin: { x: "-4px", y: "-6px" },
  },
  {
    title: "DeFi Protocols",
    desc: "Isolate risky swaps, bridges, and yield interactions from core portfolio positions.",
    marker: "D",
    tilt: { rotateX: 2, rotateY: 4 },
    origin: { x: "4px", y: "-5px" },
  },
  {
    title: "Gaming",
    desc: "Sandbox in-game asset transactions so compromised game contracts can't drain players.",
    marker: "G",
    tilt: { rotateX: -3, rotateY: -3 },
    origin: { x: "-3px", y: "-4px" },
  },
  {
    title: "Claim Platforms",
    desc: "Route airdrop claims and reward mints through isolated pockets to prevent phishing drains.",
    marker: "C",
    tilt: { rotateX: -2, rotateY: 5 },
    origin: { x: "5px", y: "-5px" },
  },
];

const IntegrationSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="integration" ref={ref} className="relative py-32 md:py-48">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Header - right-aligned for asymmetry */}
          <div className="md:col-span-6 md:col-start-7">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8 }}
              className="text-xs font-body font-medium tracking-[0.2em] uppercase text-ward-cyan"
            >
              Integration
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 font-heading text-3xl md:text-5xl font-bold leading-[1.05] tracking-tight text-ward-text-primary"
            >
              Drop-in
              <br />
              execution isolation.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base font-body text-ward-text-secondary leading-relaxed"
            >
              Ward integrates as a middleware layer. No protocol changes required. Route interactions through Ward and let the isolation layer handle containment.
            </motion.p>
          </div>
        </div>

        {/* Integration cards - premium hover grid */}
        <div
          className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ perspective: "1200px" }}
        >
          {integrations.map((item, i) => (
            <IntegrationCard
              key={item.title}
              item={item}
              index={i}
              isHovered={hoveredIndex === i}
              isSibling={hoveredIndex !== null && hoveredIndex !== i}
              onHover={() => setHoveredIndex(i)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>

        {/* Code snippet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 p-6 md:p-8 bg-card border border-ward-line rounded-sm max-w-2xl"
        >
          <span className="text-xs font-body font-medium text-ward-text-tertiary tracking-wider uppercase">
            Integration example
          </span>
          <div className="mt-4 font-mono text-sm text-ward-text-secondary leading-loose">
            <span className="text-ward-cyan">ward</span>
            <span className="text-ward-text-tertiary">.</span>
            <span className="text-ward-text-primary">isolate</span>
            <span className="text-ward-text-tertiary">(</span>
            <span className="text-ward-text-primary">transaction</span>
            <span className="text-ward-text-tertiary">)</span>
            <br />
            <span className="text-ward-text-tertiary ml-4">
              {"// → routes through disposable pocket"}
            </span>
            <br />
            <span className="text-ward-text-tertiary ml-4">
              {"// → executes in isolation"}
            </span>
            <br />
            <span className="text-ward-text-tertiary ml-4">
              {"// → returns result or contains failure"}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const IntegrationCard = ({
  item,
  index,
  isHovered,
  isSibling,
  onHover,
  onLeave,
}: {
  item: typeof integrations[number];
  index: number;
  isHovered: boolean;
  isSibling: boolean;
  onHover: () => void;
  onLeave: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`${index % 2 !== 0 ? "md:translate-y-8" : ""}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <motion.div
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        animate={
          isHovered
            ? {
                scale: 1.13,
                x: item.origin.x,
                y: item.origin.y,
                rotateX: item.tilt.rotateX,
                rotateY: item.tilt.rotateY,
                opacity: 1,
                boxShadow:
                  "0 28px 60px -10px hsl(185 75% 52% / 0.18), 0 16px 32px -8px hsl(220 20% 5% / 0.7)",
              }
            : isSibling
            ? {
                scale: 0.96,
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                opacity: 0.55,
                boxShadow: "none",
              }
            : {
                scale: 1,
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                opacity: 1,
                boxShadow: "none",
              }
        }
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="p-8 border border-ward-line bg-card rounded-sm cursor-default"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform, opacity, box-shadow",
          borderColor: isHovered
            ? "hsl(var(--ward-cyan) / 0.35)"
            : undefined,
          transition: "border-color 0.22s ease",
        }}
      >
        <div className="flex items-start gap-6">
          <div
            className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-ward-line rounded-sm text-sm font-heading font-semibold text-ward-cyan transition-colors duration-300"
            style={{
              borderColor: isHovered ? "hsl(var(--ward-cyan) / 0.5)" : undefined,
            }}
          >
            {item.marker}
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-ward-text-primary">{item.title}</h3>
            <p className="mt-2 text-sm font-body text-ward-text-secondary leading-relaxed">{item.desc}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default IntegrationSection;
