"use client";

import React from "react";
import { motion, useAnimate } from "motion/react";

export const Test = () => {
  const [scope, animate] = useAnimate();

  const onPress = () => {
    animate("#mainContainer", { height: 100, }, { duration: 0.5 });
  };

  return (
    <motion.div
      onClick={onPress}
      ref={scope}
      id="mainContainer"
      className="fixed w-[50px] top-[100px] right-[20px] border-1 rounded-full"
      style={{ height: 50 }}
      initial={{ height: 50 }}
    ></motion.div>
  );
};

export default Test;
