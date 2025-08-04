import React, { RefObject, memo, useEffect, useRef, useState } from "react";

export type CarouselProps = {
  ref?: RefObject<null>;
  data?: number[];
};

export const CarouselView: React.FC<CarouselProps> = () => {
  // const { data, ref } = props;

  const carouselRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState<number>(0);

  useEffect(() => {
    const updateMargin = () => {
      if (!carouselRef.current || !containerRef.current) return;

      const scrollableWidth = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
      setScrollDistance(scrollableWidth);
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

      const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
      const clampedScroll = Math.min(Math.max(scrollYInSection, 0), maxScroll);

      carouselRef.current.scrollLeft = clampedScroll;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: `calc(100vh + ${scrollDistance}px)` }}>
      <div ref={containerRef} className="sticky top-0 h-screen w-screen bg-black overflow-hidden">
        <div ref={carouselRef} className="flex overflow-x-auto h-full w-full items-center gap-10 px-10 hide-scrollbar">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                minWidth: "25vw",
                height: "70vh",
                background: i % 2 === 0 ? "#aaf" : "#faa",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "4rem",
                fontWeight: "bold",
              }}
            >
              Box {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Carousel = memo(CarouselView);
export default Carousel;
