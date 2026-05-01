"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingEmoji } from "@/components/FloatingEmoji";
import { RevealModal } from "@/components/RevealModal";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { StartButton } from "@/components/StartButton";

const EMOJIS = ["🎈", "🫧", "⭐", "🍀", "🐱", "🌈", "☁️", "💎", "✨"];

function generateRound() {
  const numbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"));
  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return EMOJIS.map((emoji, id) => ({
    id,
    emoji,
    number: numbers[id],
    x: 8 + Math.random() * 80,
    y: 12 + Math.random() * 70,
    duration: 5 + Math.random() * 4,
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
