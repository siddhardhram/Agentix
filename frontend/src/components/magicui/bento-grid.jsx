import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const BentoGrid = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 md:grid-cols-3 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-2xl",
      // light styles
      "bg-slate-900/60 [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.4),0_12px_24px_rgba(0,0,0,.4)]",
      // dark styles
      "transform-gpu hover:bg-slate-900/80 transition-all duration-300 border border-white/10 hover:border-indigo-500/40",
      className,
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-2">
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mb-2 border border-indigo-500/20 group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-xl font-semibold text-slate-100">
        {name}
      </h3>
      <p className="max-w-lg text-sm text-slate-400">{description}</p>
    </div>

    {cta && (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
        )}
      >
        <Button variant="ghost" asChild size="sm" className="pointer-events-auto text-indigo-300 hover:text-white">
          <a href={href || "#"}>
            {cta}
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </div>
    )}
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-indigo-500/[0.03]" />
  </div>
);
