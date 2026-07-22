"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function BackgroundScene({ className = "" }: { className?: string }) {
  const mx = useSpring(0.5, { stiffness: 35, damping: 18 });
  const my = useSpring(0.5, { stiffness: 35, damping: 18 });

  const parallaxX = useTransform(mx, [0, 1], [-20, 20]);
  const parallaxY = useTransform(my, [0, 1], [-20, 20]);
  const parallaxXInverse = useTransform(mx, [0, 1], [16, -16]);
  const parallaxYInverse = useTransform(my, [0, 1], [12, -12]);

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      mx.set(e.clientX / window.innerWidth);
      my.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgb(212_175_55/0.16),transparent_45%),radial-gradient(circle_at_85%_75%,rgb(212_175_55/0.12),transparent_50%)]" />

      <motion.div
        style={{ x: parallaxX, y: parallaxY }}
        className="absolute -top-24 -left-16 size-[420px] animate-blob rounded-full bg-gradient-to-br from-gold/25 via-amber-200/15 to-transparent blur-[70px]"
      />
      <motion.div
        style={{ x: parallaxXInverse, y: parallaxYInverse }}
        className="absolute top-1/3 right-[-10%] size-[380px] animate-blob-slow rounded-full bg-gradient-to-br from-black/10 via-black/5 to-transparent blur-[80px] dark:from-white/10 dark:via-white/5"
      />
      <div className="absolute bottom-[-15%] left-1/4 size-[320px] animate-blob rounded-full bg-gradient-to-tr from-gold/20 to-transparent blur-[70px] [animation-delay:-6s]" />

      <div
        className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black_10%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(0 0 0 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="noise-overlay absolute inset-0 opacity-[0.03] mix-blend-overlay" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/40" />
    </div>
  );
}
