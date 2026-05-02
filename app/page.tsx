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
const AMBIENT_STORAGE_KEY = "ambient-sound";
const AMBIENT_TARGET_VOLUME = 0.22;
const FADE_STEP = 0.02;
const FADE_INTERVAL_MS = 90;

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingAutoEnableRef = useRef(false);
  const emojis = useMemo(() => generateRound(), [started]);

  useEffect(() => {
    const audio = new Audio("/audio/forest.mp3");
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    const savedSound = window.localStorage.getItem(AMBIENT_STORAGE_KEY);
    if (savedSound === "on") {
      pendingAutoEnableRef.current = true;
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current.load();
      }

      audioRef.current = null;
    };
  }, []);

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  const fadeTo = (targetVolume: number, onComplete?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    clearFadeInterval();
    fadeIntervalRef.current = setInterval(() => {
      const current = audio.volume;
      const direction = targetVolume > current ? 1 : -1;
      const next = Number((current + direction * FADE_STEP).toFixed(3));
      const reachedTarget = direction > 0 ? next >= targetVolume : next <= targetVolume;

      audio.volume = reachedTarget ? targetVolume : Math.min(1, Math.max(0, next));

      if (reachedTarget) {
        clearFadeInterval();
        onComplete?.();
      }
    }, FADE_INTERVAL_MS);
  };

  const playAmbient = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      await audio.play();
      fadeTo(AMBIENT_TARGET_VOLUME);
      pendingAutoEnableRef.current = false;
      setSoundOn(true);
      setSoundStatus("playing");
      window.localStorage.setItem(AMBIENT_STORAGE_KEY, "on");
    } catch {
      setSoundOn(false);
      setSoundStatus("off");
    }
  };

  const pauseAmbient = () => {
    const audio = audioRef.current;
    if (!audio) return;

    fadeTo(0, () => {
      audio.pause();
    });

    setSoundOn(false);
    setSoundStatus("off");
    pendingAutoEnableRef.current = false;
    window.localStorage.setItem(AMBIENT_STORAGE_KEY, "off");
  };

  useEffect(() => {
    const tryAutoEnable = () => {
      if (!pendingAutoEnableRef.current) return;
      void playAmbient();
    };

    window.addEventListener("pointerdown", tryAutoEnable, { once: true });
    window.addEventListener("keydown", tryAutoEnable, { once: true });

    return () => {
      window.removeEventListener("pointerdown", tryAutoEnable);
      window.removeEventListener("keydown", tryAutoEnable);
    };
  }, []);

  const toggleAmbient = async () => {
    setSoundStatus("idle");

    if (soundOn) {
      pauseAmbient();
      return;
    }

    await playAmbient();
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
