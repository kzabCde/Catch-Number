"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const BALL_COUNT = 20;

function generateRound() {
  const numbers = Array.from({ length: 100 }, (_, i) =>
    i.toString().padStart(2, "0")
  );

  for (let i = numbers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  return Array.from({ length: BALL_COUNT }, (_, id) => ({
    id,
    number: numbers[id],

    x: Math.random() * 86,
    y: Math.random() * 78,

    size: 52 + Math.random() * 44,

    vx:
      (Math.random() * 420 + 220) *
      (Math.random() > 0.5 ? 1 : -1),

    vy: -(Math.random() * 500 + 280),

    colors: BALL_COLORS[id % BALL_COLORS.length],
  }));
}

export default function HomePage() {
  const [started, setStarted] = useState(false);

  const [picked, setPicked] = useState<string | null>(null);

  const [pickedId, setPickedId] = useState<number | null>(null);

  const [slowMo, setSlowMo] = useState(false);

  const [soundOn, setSoundOn] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fadeRef = useRef<NodeJS.Timeout | null>(null);

  const emojis = useMemo(() => generateRound(), [started]);

  useEffect(() => {
    const saved = localStorage.getItem("ambient-sound");

    const audio = new Audio(
      "https://cdn.pixabay.com/download/audio/2021/08/09/audio_c6ccf98b1d.mp3"
    );

    audio.loop = true;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous";

    audio.volume = 0.22;

    audioRef.current = audio;

    if (saved === "on") {
      setSoundOn(true);
    }

    return () => {
      audio.pause();

      if (fadeRef.current) {
        clearInterval(fadeRef.current);
      }
    };
  }, []);

  const clearFade = () => {
    if (fadeRef.current) {
      clearInterval(fadeRef.current);
    }
  };

  const toggleAmbient = async () => {
    if (!audioRef.current) return;

    clearFade();

    const audio = audioRef.current;

    // ปิดเสียง
    if (soundOn) {
      fadeRef.current = setInterval(() => {
        if (audio.volume > 0.02) {
          audio.volume -= 0.02;
        } else {
          audio.pause();

          audio.volume = 0.22;

          clearFade();
        }
      }, 40);

      localStorage.setItem("ambient-sound", "off");

      setSoundOn(false);

      return;
    }

    // เปิดเสียง
    try {
      audio.volume = 0;

      await audio.play();

      fadeRef.current = setInterval(() => {
        if (audio.volume < 0.22) {
          audio.volume += 0.02;
        } else {
          audio.volume = 0.22;

          clearFade();
        }
      }, 40);

      localStorage.setItem("ambient-sound", "on");

      setSoundOn(true);
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

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
        animate={
          slowMo
            ? {
                scale: 1.04,
                filter: "blur(1px)",
              }
            : {
                scale: 1,
                filter: "blur(0px)",
              }
        }
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <AnimatePresence>
          {emojis.map((emoji) => (
            <motion.div
              key={`${emoji.id}-${started}`}
              animate={
                slowMo
                  ? { opacity: 0.35 }
                  : { opacity: 1 }
              }
              transition={{
                duration: 0.2,
              }}
            >
              <FloatingEmoji
                data={emoji}
                onPick={onPick}
                disabled={
                  pickedId !== null &&
                  pickedId !== emoji.id
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <footer className="absolute bottom-3 left-1/2 z-40 -translate-x-1/2 text-center">
        <a
          href="https://nowheredev.vercel.app/"
          target="_blank"
          rel="noreferrer"
          className="
            text-xs
            text-purple-700/70
            underline
            decoration-purple-500/40
            underline-offset-4
            transition
            hover:text-purple-700
          "
        >
          © 2026 NOWHEREDEV
        </a>
      </footer>

      <div className="absolute bottom-10 z-40 flex gap-3">
        {!picked ? (
          <StartButton
            label="เริ่มสุ่ม"
            onClick={handleStart}
          />
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

        <button
          type="button"
          onClick={toggleAmbient}
          className="
            rounded-full
            border border-white/30
            bg-white/15
            backdrop-blur-xl
            px-4 py-2
            text-xs font-medium
            text-purple-700
            shadow-[0_4px_18px_rgba(0,0,0,0.08)]
            transition-all
            hover:scale-105
            hover:bg-white/25
            active:scale-95
          "
        >
          <span className="flex items-center gap-2">
            <span className="text-sm">
              {soundOn ? "🌿" : "🔈"}
            </span>

            <span>
              {soundOn
                ? "Forest Ambient"
                : "Sound Off"}
            </span>
          </span>
        </button>
      </div>

      <RevealModal
        value={picked ?? ""}
        open={Boolean(picked)}
      />
    </main>
  );
}
