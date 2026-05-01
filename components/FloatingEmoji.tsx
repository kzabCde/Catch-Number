"use client";

import { motion } from "framer-motion";

type EmojiData = {
  id: number;
  emoji: string;
  number: string;
  x: number;
  y: number;
  duration: number;
};

export function FloatingEmoji({
  data,
  onPick,
  disabled,
}: {
  data: EmojiData;
  onPick: (value: string, id: number) => void;
  disabled: boolean;
}) {
  return (
    <motion.button
      aria-label={`อิโมจิสุ่มเลข ${data.id}`}
      disabled={disabled}
      onClick={() => onPick(data.number, data.id)}
      className="absolute select-none text-4xl drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] sm:text-5xl"
      style={{ left: `${data.x}%`, top: `${data.y}%`, filter: "blur(0.1px)" }}
      animate={{
        y: [0, -15, 0, 10, 0],
        x: [0, 8, -8, 0],
        rotate: [0, -4, 4, 0],
      }}
      transition={{
        duration: data.duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileTap={{ scale: 0.9 }}
    >
      {data.emoji}
    </motion.button>
  );
}
