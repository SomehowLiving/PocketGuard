import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const CTASection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="cta" ref={ref} className="relative py-32 md:py-48">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold leading-[1] tracking-tight text-ward-text-primary">
                Build with
                <br />
                <span className="text-gradient-cyan">structural safety.</span>
              </h2>

              <p className="mt-8 text-base md:text-lg font-body text-ward-text-secondary max-w-lg mx-auto leading-relaxed">
                Integrate Ward into your wallet, protocol, or platform. Make every risky interaction survivable.
              </p>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="/app"
                  className="inline-flex items-center text-sm font-body font-medium text-primary-foreground bg-primary px-8 py-4 rounded-sm hover:bg-ward-cyan-glow transition-all duration-300 glow-cyan"
                >
                  Integrate Ward
                  <svg className="ml-3 w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center text-sm font-body text-ward-text-secondary hover:text-ward-cyan px-8 py-4 border border-ward-line rounded-sm hover:border-ward-cyan/30 transition-all duration-300"
                >
                  View contracts
                  <svg className="ml-2 w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom geometric accent */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="mt-32 flex justify-center"
        >
          <svg width="200" height="60" viewBox="0 0 200 60" fill="none" className="opacity-[0.08]">
            <line x1="0" y1="30" x2="200" y2="30" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
            <line x1="60" y1="0" x2="60" y2="60" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="100" y2="60" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
            <line x1="140" y1="0" x2="140" y2="60" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
            <rect x="56" y="26" width="8" height="8" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
            <rect x="96" y="26" width="8" height="8" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
            <rect x="136" y="26" width="8" height="8" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
          </svg>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="mt-24 border-t border-ward-line">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-heading text-sm font-semibold text-ward-text-tertiary tracking-tight">
            WARD
          </span>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs font-body text-ward-text-tertiary hover:text-ward-cyan transition-colors duration-300">
              Documentation
            </a>
            <a href="#" className="text-xs font-body text-ward-text-tertiary hover:text-ward-cyan transition-colors duration-300">
              GitHub
            </a>
            <a href="#" className="text-xs font-body text-ward-text-tertiary hover:text-ward-cyan transition-colors duration-300">
              Contact
            </a>
          </div>
          <span className="text-xs font-body text-ward-text-tertiary">
            Infrastructure-grade security.
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
