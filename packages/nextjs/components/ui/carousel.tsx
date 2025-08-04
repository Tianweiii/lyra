import React, { RefObject, memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

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

  const items = [
    {
      title: "Lower Fees",
      subtitle: "A fraction of traditional fees",
      image: "/images/lower-fees.jpg",
    },
    {
      title: "Faster Settlements",
      subtitle: "Instant or within minutes",
      image: "/images/faster-settlements.jpg",
    },
    {
      title: "Global Accessibility",
      subtitle: "Crypto is borderless",
      image: "/images/global-accessibility.jpg",
    },
    {
      title: "Currency Flexibility",
      subtitle: "Multi-Currency conversions",
      image: "/images/currency-flexibility.jpg",
    },
    {
      title: "Bypassing Capital Controls",
      subtitle: "Bypass currency restrictions",
      image: "/images/bypass-capital.jpg",
    },
    {
      title: "Privacy",
      subtitle: "Greater control over funds",
      image: "/images/priavcy.jpg",
    },
  ];

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
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!carouselRef.current || !wrapperRef.current) return;
          const wrapperTop = wrapperRef.current.getBoundingClientRect().top;
          const scrollYInSection = -wrapperTop;
          const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;
          const clampedScroll = Math.min(Math.max(scrollYInSection, 0), maxScroll);
          carouselRef.current.scrollLeft = clampedScroll;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={wrapperRef} style={{ height: `calc(100vh + ${scrollDistance}px)` }} className="mr-[1000px]">
      <div ref={containerRef} className="sticky top-0 h-screen w-screen bg-black overflow-hidden">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto h-full w-full items-center gap-10 px-10 hide-scrollbar pointer-events-none"
        >
          {items.map((item, i) => (
            <motion.div
              key={i}
              className="relative min-w-[20vw] md:min-w-[40%] h-[70vh] border-1 rounded-3xl overflow-hidden px-[30px] py-[20px]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1 * i,
                ease: "easeOut",
              }}
              viewport={{ once: true }}
              style={{ willChange: "transform, opacity" }}
            >
              {/* Image Background */}
              <div className="absolute inset-0 z-0">
                <Image src={item.image} alt={item.title} fill style={{ objectFit: "cover" }} priority={i === 0} />
                <div className="absolute inset-0 bg-black/40" />
              </div>

              {/* Text Content */}
              <div className="relative z-10">
                <p className="text-left font-sans text-sm font-medium text-white md:text-base">{item.title}</p>
                <p className="mt-2 max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl">
                  {item.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Carousel = memo(CarouselView);
export default Carousel;
