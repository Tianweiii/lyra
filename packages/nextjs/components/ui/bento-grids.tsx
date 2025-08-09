import React, { memo } from "react";
import { motion } from "motion/react";

export const BentoGridsView = () => {
  return (
    <div className="grid px-6 md:px-12 lg:px-24 xl:px-[200px] gap-8 py-12">
      {/* First Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[60%_40%] gap-8">
        {/* OneClick Login */}
        <motion.div
          className="border-white/20 border rounded-2xl min-h-[300px] p-6 md:p-8 flex flex-col justify-start bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/BentoGrid-1.png')" }}
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-white text-xl md:text-2xl font-bold mb-4">
            One-Click Login,
            <br />
            Any Device
          </div>
          <div className="text-gray-300 text-sm md:text-base leading-relaxed">
            Sign in using Google, Facebook, <br />
            MetaMask, or your existing wallet
            <br /> — no seed phrases required.
          </div>
        </motion.div>

        {/* Unlock Funds */}
        <motion.div
          className="border-white/20 border rounded-2xl relative flex flex-col justify-start p-6 md:p-8 overflow-hidden min-h-[300px] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/BentoGrid-2.png')" }}
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="text-white text-xl md:text-2xl font-bold mt-8 md:mt-20 mb-4">Unlock Funds, Your Way</div>
          <div className="text-gray-300 text-sm md:text-base leading-relaxed">
            Empower users with flexible payment options beyond traditional banks or Web3 wallets, enabling instant,
            privacy-secure transactions with approved merchants.
          </div>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 xl:grid-cols-[40%_60%] gap-8">
        {/* Fast, Secure Payments */}
        <motion.div
          className="border-white/20 border rounded-2xl min-h-[250px] p-6 md:p-8 flex flex-col justify-start bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/BentoGrid-3.png')" }}
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-white text-xl md:text-2xl font-bold mb-4">Fast, Secure Payments</div>
          <div className="text-gray-300 text-sm md:text-base leading-relaxed">
            Eliminate delays and protect privacy with quick, secure transactions for merchants and schools.
          </div>
        </motion.div>

        {/* Transparent Fund Tracking */}
        <motion.div
          className="border-white/20 border rounded-2xl min-h-[250px] p-6 md:p-8 flex flex-col justify-start bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/BentoGrid-4.png')" }}
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-white text-xl md:text-2xl font-bold mb-4">Transparent Fund Tracking for Gov</div>
          <div className="text-gray-300 text-sm md:text-base leading-relaxed">
            Ensure real-time visibility and accountability of public funds, enabling direct, middleman-free payments to
            designated recipients, with full tracking of spending.
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const BentoGrids = memo(BentoGridsView);
export default BentoGrids;
