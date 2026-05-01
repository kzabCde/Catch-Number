"use client";

import { motion, AnimatePresence } from "framer-motion";

export function RevealModal({ value, open }: { value: string; open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-30 flex items-center justify-center bg-white/20 px-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass-card w-full max-w-sm rounded-3xl p-8 text-center"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 210, damping: 16 }}
          >
            <p className="mb-3 text-xl font-semibold text-fuchsia-700">คุณจับได้เลข</p>
            <motion.p
              className="text-7xl font-black text-violet-700 drop-shadow-[0_0_18px_rgba(167,100,255,0.8)]"
              animate={{ scale: [1, 1.12, 1], rotate: [0, 1, -1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
              {value}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
