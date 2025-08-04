import React, { memo } from "react";
import { DraggableCardBody, DraggableCardContainer } from "./dragable-card";

export const GalleryView = () => {
  const items = [
    {
      title: "Bitcoin",
      image: "/images/bitcoin.jpg",
      className: "absolute top-[148px] left-[10%] rotate-[-5deg]",
    },
    {
      title: "Ethereum",
      image: "/images/ethereum.jpg",
      className: "absolute top-[510px] left-[20%] rotate-[13deg]",
    },
    {
      title: "Tether",
      image: "/images/tether.jpeg",
      className: "absolute top-[148px] left-[70%] rotate-[8deg]",
    },
    {
      title: "Binance",
      image: "/images/binance.jpg",
      className: "absolute top-[550px] right-[20%] rotate-[10deg]",
    },
    {
      title: "XRP",
      image: "/images/xrp.webp",
      className: "absolute top-[100px] right-[30%] rotate-[2deg]",
    },
    {
      title: "Solana",
      image: "/images/solana.webp",
      className: "absolute top-[650px] left-[45%] rotate-[-7deg]",
    },
    {
      title: "USDC",
      image: "/images/usdc.png",
      className: "absolute top-[80px] left-[30%] rotate-[4deg]",
    },
  ];

  return (
    <DraggableCardContainer className="relative flex min-h-screen min-w-screen items-center justify-center overflow-clip mt-[200px]">
      <p className="absolute top-1/2 mx-auto max-w-sm -translate-y-3/4 text-center text-2xl font-black text-neutral-400 md:text-4xl">
        Transfer money from anywhere; anytime
      </p>
      {items.map(item => (
        <DraggableCardBody className={item.className} key={item.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} className="pointer-events-none relative z-10 h-80 w-80 object-cover" />
          <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">{item.title}</h3>
        </DraggableCardBody>
        // <motion.div
        //   key={item.title}
        //   whileInView={{
        //     top: item.className.match(/top-([^\s]+)/)?.[1] ?? "50%",
        //     left: item.className.match(/left-([^\s]+)/)?.[1],
        //     rotate: parseFloat(item.className.match(/rotate-\[?(-?\d+)deg\]?/)?.[1] || "0"),
        //   }}
        //   transition={{
        //     type: "spring",
        //     stiffness: 300,
        //     damping: 20,
        //     duration: 0.3,
        //   }}
        // >
        //   <DraggableCardBody className={item.className} key={item.title}>
        //     {/* eslint-disable-next-line @next/next/no-img-element */}
        //     <img
        //       src={item.image}
        //       alt={item.title}
        //       className="pointer-events-none relative z-10 h-80 w-80 object-cover"
        //     />
        //     <h3 className="mt-4 text-center text-2xl font-bold text-neutral-700 dark:text-neutral-300">{item.title}</h3>
        //   </DraggableCardBody>
        // </motion.div>
      ))}
    </DraggableCardContainer>
  );
};

export const Gallery = memo(GalleryView);
export default Gallery;
