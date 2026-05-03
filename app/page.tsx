"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingEmoji } from "@/components/FloatingEmoji";
import { RevealModal } from "@/components/RevealModal";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { StartButton } from "@/components/StartButton";
import { createForestAmbientUrl } from "@/app/forestAmbient";

const BALL_COLORS: [string, string][] = [
  ["#ff4d6d", "#ffd166"],
  ["#06d6a0", "#118ab2"],
  ["#8338ec", "#ff006e"],
  ["#3a86ff", "#00f5d4"],
  ["#ffbe0b", "#fb5607"],
  ["#90e0ef", "#0077b6"],
];
const BALL_COUNT = 20;
const AMBIENT_TARGET_VOLUME = 0.1;
const FADE_DURATION_MS = 900;

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
    size: 52 + Math.random() * 44,
    vx: (Math.random() * 240 + 120) * (Math.random() > 0.5 ? 1 : -1),
    vy: Math.random() * 140 - 70,
    colors: BALL_COLORS[id % BALL_COLORS.length],
  }));
}

export default function HomePage() {
  const [started, setStarted] = useState(false);
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<number | null>(null);
  const [slowMo, setSlowMo] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [soundStatus, setSoundStatus] = useState<"idle" | "playing" | "off">("off");
  const [respawnToken, setRespawnToken] = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRafRef = useRef<number | null>(null);
  const emojis = useMemo(() => generateRound(), [started]);

  useEffect(() => {
    const audio = new Audio(createForestAmbientUrl());
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      if (fadeRafRef.current !== null) {
        cancelAnimationFrame(fadeRafRef.current);
        fadeRafRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }

      audioRef.current = null;
    };
  }, []);

  const clearFadeFrame = useCallback(() => {
    if (fadeRafRef.current !== null) {
      cancelAnimationFrame(fadeRafRef.current);
      fadeRafRef.current = null;
    }
  }, []);

  const fadeTo = useCallback((targetVolume: number, onComplete?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    clearFadeFrame();
    const startVolume = audio.volume;
    const startTime = performance.now();

    const tick = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / FADE_DURATION_MS);
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress >= 1) {
        audio.volume = targetVolume;
        clearFadeFrame();
        onComplete?.();
        return;
      }

      fadeRafRef.current = requestAnimationFrame(tick);
    };

    fadeRafRef.current = requestAnimationFrame(tick);
  }, [clearFadeFrame]);

  const playAmbient = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      fadeTo(AMBIENT_TARGET_VOLUME);
      setSoundOn(true);
      setSoundStatus("playing");
    } catch {
      setSoundOn(false);
      setSoundStatus("off");
    }
  }, [fadeTo]);

  const pauseAmbient = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    fadeTo(0, () => {
      audio.pause();
    });
    
    setSoundOn(false);
    setSoundStatus("off");
  }, [fadeTo]);

  const toggleAmbient = useCallback(async () => {
    setSoundStatus("idle");

    if (soundOn) {
      pauseAmbient();
      return;
    }

    await playAmbient();
  }, [pauseAmbient, playAmbient, soundOn]);

  const handleStart = useCallback(() => {
    setPicked(null);
    setPickedId(null);
    setStarted((prev) => !prev);
  }, []);

  const onPick = useCallback((value: string, id: number) => {
    setRespawnToken((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    if (picked) return;
    setSlowMo(true);
    setPicked(value);
    setPickedId(id);
    setTimeout(() => setSlowMo(false), 650);
  }, [picked]);

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
              key={`${emoji.id}-${started}-${respawnToken[emoji.id] ?? 0}`}
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
              setRespawnToken({});
              setStarted((prev) => !prev);
            }}
          />
        )}

        <button
          type="button"
          onClick={toggleAmbient}
          className="rounded-full border border-white/40 bg-white/25 px-4 py-2 text-xs font-medium text-purple-800 shadow-lg backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/40"
        >
          {soundOn ? "🌿 Forest Ambient" : soundStatus === "idle" ? "⏳ Sound..." : "🔈 Sound Off"}
        </button>
      </div>

      <RevealModal value={picked ?? ""} open={Boolean(picked)} />
    </main>
  );
}
