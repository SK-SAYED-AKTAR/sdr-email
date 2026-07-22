"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

export function AnimatedCounter({
  value,
  duration = 1.1,
  formatter,
  className,
}: {
  value: number;
  duration?: number;
  formatter?: (n: number) => string;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const controls = animate(prevValue.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    prevValue.current = value;
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const format = formatter ?? ((n: number) => Math.round(n).toLocaleString());

  return <span className={className}>{format(display)}</span>;
}
