import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "./utils";
import { Typography } from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";

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
      "Whether you're a government agency issuing subsidies or a company rewarding loyal customers, our system guarantees your funds reach the right hands—instantly and securely.",
  },
];

const imageVariants = {
  enter: {
    opacity: 1,
    scale: 1,
    rotateZ: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    rotateZ: 5,
    filter: "blur(2px)",
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const CarouselItem = memo(({ item, i, index }: { item: any; i: number; index: number }) => (
  <motion.div
    key={i}
    className="min-w-[25vw] min-h-screen flex flex-col items-center justify-center text-4xl font-bold px-[100px]"
    animate={{
      opacity: i + 1 === index ? 1 : 0.4,
      scale: i + 1 === index ? 1 : 0.95,
    }}
    transition={{
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    }}
  >
    <Typography fontSize={32} fontWeight={700} mb={3} textAlign={"center"}>
      {item.title}
    </Typography>
    <Typography textAlign={"center"}>{item.description}</Typography>
  </motion.div>
));

CarouselItem.displayName = "CarouselItem";

export const CustomScrollContainerView: React.FC<CustomScrollContainerProps> = ({ className }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState<number>(0);
  const [index, setIndex] = useState<number>(1);
  const activeItemDetectionRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const imageMap = useMemo(
    () =>
      ({
        1: "/images/aid.jpg",
        2: "/images/direct.jpg",
        3: "/images/public.jpg",
      }) as Record<number, string>,
    [],
  );

  const throttledScroll = useCallback(() => {
    if (!carouselRef.current || !wrapperRef.current) return;

    const wrapperTop = wrapperRef.current.getBoundingClientRect().top;
    const scrollYInSection = -wrapperTop;
    const maxScroll = carouselRef.current.scrollHeight - carouselRef.current.clientHeight;
    const clampedScroll = Math.min(Math.max(scrollYInSection, 0), maxScroll);

    carouselRef.current.scrollTop = clampedScroll;
  }, []);

  const detectActiveItem = useCallback(() => {
    if (!carouselRef.current || activeItemDetectionRef.current) return;

    activeItemDetectionRef.current = true;

    const carousel = carouselRef.current;
    const items = carousel.children;
    const containerHeight = carousel.clientHeight;
    const scrollTop = carousel.scrollTop;

    for (let i = 0; i < items.length; i++) {
      const item = items[i] as HTMLElement;
      const itemTop = item.offsetTop - scrollTop;
      const itemHeight = item.offsetHeight;
      const itemBottom = itemTop + itemHeight;

      const visibleTop = Math.max(0, itemTop);
      const visibleBottom = Math.min(containerHeight, itemBottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibilityPercentage = visibleHeight / itemHeight;

      if (visibilityPercentage >= 0.6) {
        const newIndex = i + 1;
        if (newIndex !== index) {
          setIndex(newIndex);
        }
        break;
      }
    }

    setTimeout(() => {
      activeItemDetectionRef.current = false;
    }, 16); // ~60fps
  }, [index]);

  const updateScrollDistance = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!carouselRef.current || !containerRef.current) return;
      const scrollableHeight = carouselRef.current.scrollHeight - carouselRef.current.clientHeight;
      setScrollDistance(scrollableHeight);
    }, 100);
  }, []);

  useEffect(() => {
    updateScrollDistance();

    const resizeObserver = new ResizeObserver(updateScrollDistance);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateScrollDistance]);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(throttledScroll);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [throttledScroll]);

  useEffect(() => {
    let animationFrameId: number;

    const handleCarouselScroll = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationFrameId = requestAnimationFrame(detectActiveItem);
    };

    detectActiveItem();

    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener("scroll", handleCarouselScroll, { passive: true });
      return () => {
        carousel.removeEventListener("scroll", handleCarouselScroll);
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [detectActiveItem]);

  const renderedItems = useMemo(
    () => custItem.map((item, i) => <CarouselItem key={i} item={item} i={i} index={index} />),
    [index],
  );

  return (
    <div ref={wrapperRef} style={{ height: `calc(100vh + ${scrollDistance}px)` }} className={cn(className)}>
      <div ref={containerRef} className="sticky top-0 h-screen w-screen bg-black overflow-hidden">
        <div className="flex justify-center h-screen items-center gap-10">
          <div className="w-[30vw] h-[40%] overflow-hidden relative">
            <div className="relative w-full h-full">
              <AnimatePresence mode="wait">
                <motion.img
                  key={index}
                  variants={imageVariants}
                  initial="exit"
                  animate="enter"
                  exit="exit"
                  alt=""
                  src={imageMap[index]}
                  className="absolute inset-0 object-cover"
                  style={{
                    width: "100%",
                    height: "100%",
                  }}
                  loading="eager"
                />
              </AnimatePresence>
              {/* fade over.lay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 70%, black 70%)",
                  willChange: "transform",
                }}
              />
            </div>
          </div>
          <div
            ref={carouselRef}
            className="flex flex-col overflow-y-auto h-full w-[45vw] snap-mandatory hide-scrollbar pointer-events-none"
            style={{ willChange: "scroll-position" }}
          >
            {renderedItems}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CustomScrollContainer = memo(CustomScrollContainerView);
export default CustomScrollContainer;
