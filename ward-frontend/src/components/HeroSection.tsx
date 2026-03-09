import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background geometric elements */}
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cyanFade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(185 75% 52%)" stopOpacity="0" />
              <stop offset="50%" stopColor="hsl(185 75% 52%)" stopOpacity="0.08" />
              <stop offset="100%" stopColor="hsl(185 75% 52%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="url(#cyanFade)" strokeWidth="1" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#cyanFade)" strokeWidth="1" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="url(#cyanFade)" strokeWidth="1" />
        </svg>

        <svg
          className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.06]"
          viewBox="0 0 600 600"
          fill="none"
        >
          <rect x="100" y="100" width="400" height="400" stroke="hsl(185 75% 52%)" strokeWidth="1" />
          <rect x="150" y="150" width="300" height="300" stroke="hsl(185 75% 52%)" strokeWidth="1" />
          <rect x="200" y="200" width="200" height="200" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
          <line x1="100" y1="100" x2="200" y2="200" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
          <line x1="500" y1="100" x2="400" y2="200" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
          <line x1="100" y1="500" x2="200" y2="400" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
          <line x1="500" y1="500" x2="400" y2="400" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
        </svg>

        <motion.svg
          className="absolute top-1/3 left-[15%] w-[200px] h-[400px] opacity-[0.1]"
          viewBox="0 0 200 400"
          fill="none"
        >
          <path
            d="M100 0 L100 150 L40 200 L40 400"
            stroke="hsl(185 75% 52%)"
            strokeWidth="1.5"
            strokeDasharray="4 8"
            className="animate-draw-line"
            style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
          />
          <path
            d="M100 150 L160 200 L160 300"
            stroke="hsl(185 75% 52%)"
            strokeWidth="1"
            strokeDasharray="4 8"
            className="animate-draw-line"
            style={{ strokeDasharray: 1000, strokeDashoffset: 1000, animationDelay: "0.5s" }}
          />
        </motion.svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 pt-32 pb-24">
        <div className="mt-24 md:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <span className="inline-block text-xs font-body font-medium tracking-[0.2em] uppercase text-ward-cyan mb-8">
              Execution Isolation Layer
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.92] tracking-tight text-ward-text-primary max-w-4xl"
          >
            Make risky on-chain
            <br />
            interactions
            <br />
            <span className="text-gradient-cyan">survivable.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 text-lg md:text-xl font-body text-ward-text-secondary max-w-xl leading-relaxed"
          >
            Ward routes risky interactions through disposable smart-wallet execution pockets,
            containing damage before it reaches your main wallet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex items-center gap-6"
          >
            <a
              href="#cta"
              className="inline-flex items-center text-sm font-body font-medium text-primary-foreground bg-primary px-7 py-3.5 rounded-sm hover:bg-ward-cyan-glow transition-all duration-300 glow-cyan"
            >
              Start integrating
              <svg className="ml-3 w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#mechanism"
              className="inline-flex items-center text-sm font-body text-ward-text-secondary hover:text-ward-cyan transition-colors duration-300"
            >
              View architecture
              <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </motion.div>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-6 md:left-12 right-6 md:right-12 h-px bg-gradient-to-r from-ward-cyan/30 via-ward-line to-transparent origin-left"
        />
      </div>
    </section>
  );
};

export default HeroSection;
