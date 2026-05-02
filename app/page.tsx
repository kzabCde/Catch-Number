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

    // เด้งแรงขึ้น
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

  const audioCtxRef = useRef<AudioContext | null>(null);

  const ambientNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gain: GainNode;
  } | null>(null);

  const emojis = useMemo(() => generateRound(), [started]);

  useEffect(() => {
    const saved = localStorage.getItem("ambient-sound");

    if (saved === "on") {
      setSoundOn(true);
    }

    return () => {
      ambientNodesRef.current?.oscillators.forEach((oscillator) =>
        oscillator.stop()
      );

      audioCtxRef.current?.close();

      ambientNodesRef.current = null;
      audioCtxRef.current = null;
    };
  }, []);

  const toggleAmbient = async () => {
    if (!audioCtxRef.current) {
      const context = new AudioContext();

      // master volume
      const gain = context.createGain();
      gain.gain.value = 0;

      // filter ให้เสียงนุ่ม
      const filter = context.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.value = 900;

      gain.connect(filter);
      filter.connect(context.destination);

      // ambient synth
      const configs = [
        {
          freq: 174.61,
          type: "sine" as OscillatorType,
        },
        {
          freq: 261.63,
          type: "triangle" as OscillatorType,
        },
        {
          freq: 329.63,
          type: "sine" as OscillatorType,
        },
      ];

      const oscillators = configs.map((item) => {
        const oscillator = context.createOscillator();

        oscillator.type = item.type;
        oscillator.frequency.value = item.freq;

        oscillator.connect(gain);

        oscillator.start();

        return oscillator;
      });

      audioCtxRef.current = context;

      ambientNodesRef.current = {
        oscillators,
        gain,
      };
    }

    if (!audioCtxRef.current || !ambientNodesRef.current) return;

    const gain = ambientNodesRef.current.gain.gain;

    const now = audioCtxRef.current.currentTime;

    if (soundOn) {
      // fade out
      gain.cancelScheduledValues(now);

      gain.linearRampToValueAtTime(0, now + 0.6);

      setTimeout(async () => {
        await audioCtxRef.current?.suspend();
      }, 650);

      localStorage.setItem("ambient-sound", "off");

      setSoundOn(false);

      return;
    }

    await audioCtxRef.current.resume();

    // fade in
    gain.cancelScheduledValues(now);

    gain.linearRampToValueAtTime(0.035, now + 1.2);

    localStorage.setItem("ambient-sound", "on");

    setSoundOn(true);
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
                  ? {
                      opacity: 0.35,
                    }
                  : {
                      opacity: 1,
                    }
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
            group
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
              {soundOn ? "🔊" : "🔈"}
            </span>

            <span>
              {soundOn
                ? "Ambient ON"
                : "Ambient OFF"}
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
