"use client";

import { motion } from "framer-motion";

type EmojiData = {
  id: number;
  number: string;
  x: number;
  y: number;
  duration: number;
  size: number;
  driftX: number;
  driftY: number;
  colors: [string, string];
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
      className="absolute select-none rounded-full border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
      style={{
        left: `${data.x}%`,
        top: `${data.y}%`,
        width: data.size,
        height: data.size,
        filter: "blur(0.1px)",
        background: `radial-gradient(circle at 30% 28%, #ffffffdd 0 18%, ${data.colors[0]} 44%, ${data.colors[1]} 100%)`,
      }}
      animate={{
        x: [0, data.driftX, 0, -data.driftX, 0],
        y: [0, -data.driftY, 0, data.driftY, 0],
        rotate: [0, -9, 9, 0],
      }}
      transition={{
        duration: data.duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="sr-only">เลขสุ่ม {data.number}</span>
    </motion.button>
  );
}
