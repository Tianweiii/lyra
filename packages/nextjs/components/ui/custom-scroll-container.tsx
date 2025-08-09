import React, { memo, useEffect, useRef, useState } from "react";
import { cn } from "./utils";
import { Typography } from "@mui/material";

// import { ShootingStars } from "./shooting-stars";
// import { StarsBackground } from "./stars-background";

type CustomScrollContainerProps = {
  className?: string;
};

const custItem = [
  {
    title: "The Promise of Aid, Lost in the Maze",
    description:
      "Every year, billions in financial aid and vouchers fail to reach their intended recipients—lost in bureaucracy, fraud, or inefficiency. People wait, businesses lose trust, and help arrives too late.",
  },
  {
    title: "Direct. Transparent. Unstoppable.",
    description:
      "Our platform delivers subsidies, vouchers, and financial aid directly to recipients—without middlemen, without delays, and with full traceability on the blockchain. Every coin is accounted for.",
  },
  {
    title: "From Public Aid to Private Rewards",
    description:
      "Whether you’re a government agency issuing subsidies or a company rewarding loyal customers, our system guarantees your funds reach the right hands—instantly and securely.",
  },
];

export const CustomScrollContainerView: React.FC<CustomScrollContainerProps> = ({ className }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState<number>(0);

  useEffect(() => {
    const updateMargin = () => {
      if (!carouselRef.current || !containerRef.current) return;

      const scrollableHeight = carouselRef.current.scrollHeight - carouselRef.current.clientWidth;
      setScrollDistance(scrollableHeight);
    };

    updateMargin();
    window.addEventListener("resize", updateMargin);
    return () => window.removeEventListener("resize", updateMargin);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!carouselRef.current || !wrapperRef.current) return;

      const wrapperTop = wrapperRef.current.getBoundingClientRect().top;
      const scrollYInSection = -wrapperTop;

      const maxScroll = carouselRef.current.scrollHeight - carouselRef.current.clientWidth;
      const clampedScroll = Math.min(Math.max(scrollYInSection, 0), maxScroll);

      carouselRef.current.scrollTop = clampedScroll;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // <TracingBeam>
    <div ref={wrapperRef} style={{ height: `calc(100vh + ${scrollDistance}px)` }} className={cn(className)}>
      <div ref={containerRef} className="sticky top-0 h-screen w-screen bg-black overflow-hidden">
        <div className="flex justify-center h-screen items-center gap-10">
          <div className="flex w-[30vw] h-[40%]  items-center justify-center">
            {/* TODO: CHANGE IMAGE IF NEED */}
            <img src="/images/nasa-nature-night.avif" alt="Image" />
          </div>
          <div
            ref={carouselRef}
            className="flex flex-col overflow-y-auto h-full w-[45vw] snap-mandatory hide-scrollbar pointer-events-none"
          >
            {custItem.map((item, i) => (
              <div
                key={i}
                className="min-w-[25vw] min-h-screen border border-white flex flex-col items-center justify-center text-4xl font-bold px-[100px]"
              >
                <Typography fontSize={32} fontWeight={700} mb={3} textAlign={"center"}>
                  {item.title}
                </Typography>
                <Typography textAlign={"center"}>{item.description}</Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <ShootingStars /> */}
      {/* <StarsBackground /> */}
    </div>
    // </TracingBeam>
  );
};

export const CustomScrollContainer = memo(CustomScrollContainerView);
export default CustomScrollContainer;
