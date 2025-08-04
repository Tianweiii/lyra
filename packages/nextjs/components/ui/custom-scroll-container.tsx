import React, { memo, useEffect, useRef, useState } from "react";
import { cn } from "./utils";
import { Typography } from "@mui/material";

type CustomScrollContainerProps = {
  className?: string;
};

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
    <div ref={wrapperRef} style={{ height: `calc(100vh + ${scrollDistance}px)` }} className={cn(className)}>
      <div ref={containerRef} className="sticky top-0 h-screen w-screen bg-black overflow-hidden">
        <div className="flex justify-center h-screen items-center gap-10">
          <div className="flex w-[30vw] h-[40%] border-white border-1 items-center justify-center">Some image here</div>
          <div
            ref={carouselRef}
            className="flex flex-col overflow-y-auto h-full w-[45vw] snap-mandatory hide-scrollbar pointer-events-none"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                style={{
                  minWidth: "25vw",
                  minHeight: "100vh",
                  background: i % 2 === 0 ? "#aaf" : "#faa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "4rem",
                  fontWeight: "bold",
                  flexDirection: "column",
                  padding: "0px 100px",
                }}
              >
                <Typography fontSize={32} fontWeight={700} mb={3}>
                  Some title here
                </Typography>
                <Typography textAlign={"center"}>
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Quae doloribus et repudiandae obcaecati,
                  delectus? Animi, quaerat nulla aliquam nobis velit in? Vitae aspernatur nesciunt aperiam molestias,
                  quam consequatur!
                </Typography>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomScrollContainer = memo(CustomScrollContainerView);
export default CustomScrollContainer;
