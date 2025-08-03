"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import DottedMap from "dotted-map";
import { motion } from "motion/react";

// import { useTheme } from "next-themes";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

export function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const map = new DottedMap({ height: 100, grid: "diagonal" });

  // const { theme } = useTheme();

  // Intersection Observer to detect when component is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsInView(true);
        } else {
          setIsInView(false);
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of the component is visible
        rootMargin: "0px 0px -100px 0px", // Start animation 100px before it comes into view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  // Auto-replay animation when it finishes
  useEffect(() => {
    if (!isInView) return;

    const longestDelay = (dots.length - 1) * 0.5; // Based on staggered delays
    const animationDuration = 1; // Duration of path animation
    const totalDuration = (longestDelay + animationDuration + 1) * 1000; // Add 1s pause

    const timer = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, totalDuration);

    return () => clearInterval(timer);
  }, [isInView, dots.length]);

  const svgMap = map.getSVG({
    radius: 0.22,
    // color: theme === "dark" ? "#FFFFFF40" : "#00000040",
    // color: theme === "dark" ? "#FFFFFF80" : "#00000060",
    color: "#404040", // Darker gray for better contrast with black background
    shape: "circle",
    backgroundColor: "transparent", // Use transparent instead of black
  });

  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  const createCurvedPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div
      ref={containerRef}
      className="w-full aspect-[2/1] bg-black rounded-lg relative font-sans"
    >
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="world map"
        height="495"
        width="1056"
        draggable={false}
      />
      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <g key={`path-group-${i}`}>
              <motion.path
                d={createCurvedPath(startPoint, endPoint)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.5"
                initial={{
                  pathLength: 0,
                }}
                animate={isInView ? {
                  pathLength: 1,
                } : {
                  pathLength: 0,
                }}
                transition={{
                  duration: 1.2,
                  delay: isInView ? 0.3 * i : 0,
                  ease: "easeInOut",
                }}
                key={`${animationKey}-path-${i}`} // Key changes to trigger re-animation
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" stopOpacity="0" />
            <stop offset="10%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="50%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="90%" stopColor={lineColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {dots.map((dot, i) => (
          <g key={`points-group-${i}`}>
            <g key={`start-${i}`}>
              <circle
                cx={projectPoint(dot.start.lat, dot.start.lng).x}
                cy={projectPoint(dot.start.lat, dot.start.lng).y}
                r="3"
                fill={lineColor}
                filter="url(#glow)"
              />
              {isInView && (
                <circle
                  cx={projectPoint(dot.start.lat, dot.start.lng).x}
                  cy={projectPoint(dot.start.lat, dot.start.lng).y}
                  r="3"
                  fill={lineColor}
                  opacity="0.4"
                  key={`start-pulse-${animationKey}-${i}`}
                >
                  <animate
                    attributeName="r"
                    from="3"
                    to="12"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.4"
                    to="0"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
            <g key={`end-${i}`}>
              <circle
                cx={projectPoint(dot.end.lat, dot.end.lng).x}
                cy={projectPoint(dot.end.lat, dot.end.lng).y}
                r="3"
                fill={lineColor}
                filter="url(#glow)"
              />
              {isInView && (
                <circle
                  cx={projectPoint(dot.end.lat, dot.end.lng).x}
                  cy={projectPoint(dot.end.lat, dot.end.lng).y}
                  r="3"
                  fill={lineColor}
                  opacity="0.4"
                  key={`end-pulse-${animationKey}-${i}`}
                >
                  <animate
                    attributeName="r"
                    from="3"
                    to="12"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.4"
                    to="0"
                    dur="2s"
                    begin="0s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}