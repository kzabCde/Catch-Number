"use client";

import { motion } from "framer-motion";

type StartButtonProps = {
  label: string;
  onClick: () => void;
};

export function StartButton({ label, onClick }: StartButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      className="glass-card rounded-full px-7 py-3 text-lg font-semibold text-purple-700 shadow-glow"
    >
      {label}
    </motion.button>
  );
}
