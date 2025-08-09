import React, { memo } from "react";
import { DraggableCardBody, DraggableCardContainer } from "./dragable-card";
import { motion } from "motion/react";

export const GalleryView = () => {
  const items = [
    {
      title: "Bitcoin",
      image: "/images/bitcoin.jpg",
      initial: { top: "148px", left: "25%", rotate: -5 },
      final: { top: "148px", left: "10%", rotate: -5 },
    },
    {
      title: "Ethereum",
      image: "/images/ethereum.jpg",
      initial: { top: "384px", left: "30%", rotate: 13 },
      final: { top: "510px", left: "17%", rotate: 13 },
    },
    {
      title: "Tether",
      image: "/images/tether.jpeg",
      initial: { top: "148px", left: "45%", rotate: 8 },
      final: { top: "148px", left: "70%", rotate: 8 },
    },
    {
      title: "Binance",
      image: "/images/binance.jpg",
      initial: { top: "244px", left: "60%", rotate: 10 },
      final: { top: "550px", right: "20%", rotate: 10 },
    },
    {
      title: "XRP",
      image: "/images/xrp.webp",
      initial: { top: "212px", right: "30%", rotate: 2 },
      final: { top: "-5px", right: "30%", rotate: 2 },
    },
    {
      title: "Solana",
      image: "/images/solana.webp",
      initial: { top: "376px", left: "50%", rotate: -7 },
      final: { top: "650px", left: "45%", rotate: -7 },
    },
    {
      title: "USDC",
      image: "/images/usdc.png",
      initial: { top: "164px", left: "35%", rotate: 4 },
      final: { top: "-10px", left: "30%", rotate: 4 },
    },
  ];

  return (
    <DraggableCardContainer className="relative flex min-h-screen min-w-screen items-center justify-center overflow-clip mt-[200px]">
      <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-neutral-400 md:text-4xl">
        Transfer money from anywhere; anytime
      </p>
      {items.map((item, index) => (
        <motion.div
          key={item.title}
          className="absolute"
          initial={{
            top: item.initial.top,
            left: item.initial.left,
            right: item.initial.right,
            rotate: item.initial.rotate,
          }}
          whileInView={{
            top: item.final.top,
            left: item.final.left,
            right: item.final.right,
            rotate: item.final.rotate,
          }}
          viewport={{
            amount: 0.7,
          }}
          transition={{
            type: "spring",
            stiffness: 150,
            damping: 20,
            delay: index * 0.1,
            duration: 1.2,
          }}
        >
          <DraggableCardBody>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.image}
              alt={item.title}
              className="pointer-events-none relative z-10 h-80 w-80 object-cover"
            />
            <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">{item.title}</h3>
          </DraggableCardBody>
        </motion.div>
      ))}
    </DraggableCardContainer>
  );
};

export const Gallery = memo(GalleryView);
export default Gallery;
