import React from "react";
import { cn } from "@/lib/utils";

export const OrbitingCircles = ({
  className,
  children,
  reverse,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
  iconSize = 30,
  speed = 1,
  ...props
}) => {
  const calculatedDuration = duration / speed;
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-white/[0.08] stroke-1"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}

      <div
        style={{
          "--duration": calculatedDuration,
          "--radius": radius,
          "--delay": -delay,
          "--icon-size": `${iconSize}px`,
        }}
        className={cn(
          "absolute flex size-[var(--icon-size)] transform-gpu animate-orbit items-center justify-center rounded-full border border-white/10 bg-slate-900/90 text-white shadow-lg backdrop-blur-md",
          { "[animation-direction:reverse]": reverse },
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
};
