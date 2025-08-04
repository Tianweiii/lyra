import React, { memo } from "react";
import { Meteors } from "./meteors";
import { motion } from "motion/react";

export const BentoGridsView = () => {
  return (
    <div className="grid px-[200px] gap-8 h-[90vh]">
      <div className="grid grid-cols-1 xl:grid-cols-[60%_40%] gap-8">
        <motion.div
          className="border-white/40 border rounded-2xl h-full"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0 }}
          viewport={{ once: true }}
        >
          <p>User Authentication with Sui&apos;s zkLogin, made for better security and privacy.</p>
        </motion.div>

        <motion.div
          className="border-white/40 border rounded-2xl relative flex flex-col justify-end p-10 overflow-hidden h-full"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <p>Send, receive and convert both fiat currencies and stablecoins from anywhere, anytime</p>
          <Meteors number={20} />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[40%_60%] gap-8">
        <motion.div
          className="border-white/40 border rounded-2xl h-full"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p>Always receive the latest transaction rates with real-time market update support</p>
        </motion.div>

        <motion.div
          className="border-white/40 border rounded-2xl h-full"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        />
      </div>
    </div>
  );
};

export const BentoGrids = memo(BentoGridsView);
export default BentoGrids;
