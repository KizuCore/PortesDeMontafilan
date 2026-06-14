import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        direction === "up" && "translate-y-6 opacity-0",
        direction === "left" && "-translate-x-6 opacity-0",
        direction === "right" && "translate-x-6 opacity-0",
        direction === "none" && "opacity-0",
        inView && "translate-x-0 translate-y-0 opacity-100",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 80,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className}>
      {Array.isArray(children)
        ? children.map((child, i) => (
            <div
              key={i}
              className={cn(
                "transition-all duration-600 ease-out",
                !inView && "translate-y-5 opacity-0",
                inView && "translate-y-0 opacity-100"
              )}
              style={{
                transitionDelay: inView ? `${i * staggerDelay}ms` : "0ms",
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

export function AnimatedImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "h-full w-full object-cover transition-all duration-1000 ease-out",
          inView ? "scale-100 opacity-100" : "scale-105 opacity-0"
        )}
      />
    </div>
  );
}
