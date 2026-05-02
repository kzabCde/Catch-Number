"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingEmoji } from "@/components/FloatingEmoji";
import { RevealModal } from "@/components/RevealModal";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { StartButton } from "@/components/StartButton";

const BALL_COLORS: [string, string][] = [
  ["#ff4d6d", "#ffd166"],
  ["#06d6a0", "#118ab2"],
  ["#8338ec", "#ff006e"],
  ["#3a86ff", "#00f5d4"],
  ["#ffbe0b", "#fb5607"],
  ["#90e0ef", "#0077b6"],
];
const BALL_COUNT = 30;

function generateRound() {
  const numbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"));
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return Array.from({ length: BALL_COUNT }, (_, id) => ({
    id,
    number: numbers[id],
    x: Math.random() * 86,
    y: Math.random() * 78,
    duration: 5 + Math.random() * 6,
    size: 52 + Math.random() * 44,
    driftX: 50 + Math.random() * 36,
    driftY: 45 + Math.random() * 38,
    colors: BALL_COLORS[id % BALL_COLORS.length],
  }));
}

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [slowMo, setSlowMo] = useState(false);
  const emojis = useMemo(() => generateRound(), [started]);

  const handleStart = () => {
    setPicked(null);
    setPickedId(null);
    setStarted((prev) => !prev);
  };

  const onPick = (value: string, id: number) => {
    if (picked) return;
    setSlowMo(true);
    setPicked(value);
    setPickedId(id);
    setTimeout(() => setSlowMo(false), 650);
  };

  return (
    <main className="bg-pastel-neon relative flex h-dvh w-full items-center justify-center overflow-hidden p-4">
      <BackgroundEffects />

      <motion.div
        className="absolute inset-0"
        animate={slowMo ? { scale: 1.04, filter: "blur(1px)" } : { scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence>
          {emojis.map((emoji) => (
            <motion.div
              key={`${emoji.id}-${started}`}
              animate={slowMo ? { opacity: 0.35 } : { opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <FloatingEmoji data={emoji} onPick={onPick} disabled={pickedId !== null && pickedId !== emoji.id} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <footer className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 text-center">
        <a
          href="https://nowheredev.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-purple-700/70 underline decoration-purple-500/40 underline-offset-4 transition hover:text-purple-700"
        >
          © 2026 NOWHEREDEV
        </a>
      </footer>

      <div className="absolute bottom-10 z-40 flex gap-3">
        {!picked ? (
          <StartButton label="เริ่มสุ่ม" onClick={handleStart} />
        ) : (
          <StartButton
            label="เล่นอีกครั้ง"
            onClick={() => {
              setPicked(null);
              setPickedId(null);
              setStarted((prev) => !prev);
            }}
          />
        )}
      </div>

      <RevealModal value={picked ?? ""} open={Boolean(picked)} />
    </main>
  );
}
