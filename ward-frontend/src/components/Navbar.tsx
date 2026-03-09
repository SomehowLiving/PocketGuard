import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

const Navbar = () => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-ward-line/50 py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-12 max-w-[1200px] mx-auto">
        <motion.span
          className="font-heading text-xl font-semibold tracking-tight text-ward-text-primary"
          animate={{ scale: scrolled ? 0.9 : 1 }}
          transition={{ duration: 0.3 }}
        >
          WARD
        </motion.span>
        <div className="flex items-center gap-8">
          {[
            { href: "#mechanism", label: "How it works" },
            { href: "#integration", label: "Integration" },
            { href: "#trust", label: "Architecture" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden md:block text-sm font-body text-ward-text-secondary hover:text-ward-cyan transition-colors duration-300 relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-ward-cyan group-hover:w-full transition-all duration-300" />
            </a>
          ))}
          <a
            href="/app"
            className={`text-sm font-body font-medium text-primary-foreground bg-primary px-5 py-2.5 rounded-sm transition-all duration-300 ${
              scrolled ? "shadow-[0_0_20px_-5px_hsl(var(--ward-cyan)/0.3)]" : ""
            } hover:bg-ward-cyan-glow`}
          >
            Integrate Ward
          </a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
