import { Stack } from '@mui/material';
import { motion } from 'motion/react';
import React, { memo } from 'react'

export const BentoGridsView = () => {
  return (
    <Stack className="h-[90vh] gap-8 px-[200px]">
      <Stack direction={"row"} className="h-[400px] gap-8">
        <motion.div
          className="border-white/[0.4] border w-[60%] rounded-2xl"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0 }}
          viewport={{ once: true }}
        />

        <motion.div
          className="border-white/[0.4] border-1 flex-1 rounded-2xl"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        />
      </Stack>

      <Stack direction={"row"} className="flex-row h-[400px] gap-8">
        <motion.div
          className="border-white/[0.4] border-1 flex-1 rounded-2xl"
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        />

        <motion.div
          className="border-white/[0.4] border-1 w-[60%] rounded-2xl"
          initial={{ opacity: 0, x: 100 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
        />
      </Stack>
    </Stack>
  );
};

export const BentoGrids = memo(BentoGridsView);
export default BentoGrids;
