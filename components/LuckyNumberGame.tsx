'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';

type Ball = {
  id: number;
  number: string;
  size: number;
  color: string;
  x: number;
  y: number;
  duration: number;
  delay: number;
};

const colors = [
  'from-fuchsia-300/70 to-violet-300/60',
  'from-cyan-300/70 to-blue-300/60',
  'from-pink-300/70 to-rose-300/60',
  'from-emerald-300/70 to-teal-300/60',
  'from-amber-300/70 to-orange-300/60'
];

const makeBalls = (count: number): Ball[] =>
  Array.from({ length: count }, (_, id) => {
    const value = Math.floor(Math.random() * 100);
    return {
      id,
      number: value.toString().padStart(2, '0'),
      size: 52 + Math.random() * 38,
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.random() * 88,
      y: Math.random() * 72,
      duration: 8 + Math.random() * 8,
      delay: Math.random() * 2
    };
  });

export default function LuckyNumberGame() {
  const [started, setStarted] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [balls, setBalls] = useState<Ball[]>(() => makeBalls(22));
  const selected = useMemo(() => balls.find((b) => b.id === selectedId) ?? null, [balls, selectedId]);

  return (
    <main className="relative h-dvh w-full overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(216,180,254,0.25),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(103,232,249,0.2),transparent_40%),radial-gradient(circle_at_70%_80%,rgba(244,114,182,0.2),transparent_50%)]" />

      <div className="relative z-20 mx-auto flex h-full w-full max-w-md flex-col items-center px-5 pb-8 pt-10">
        <h1 className="text-center text-4xl font-black tracking-tight drop-shadow-[0_0_16px_rgba(250,204,21,.6)]">สุ่มเลขนำโชค</h1>
        <p className="mt-2 text-center text-base text-violet-100/90">แตะลูกบอลเพื่อสุ่มเลข</p>

        {!started && (
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => setStarted(true)}
            className="mt-6 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-400 px-10 py-4 text-xl font-bold shadow-glow"
          >
            เริ่มสุ่ม
          </motion.button>
        )}

        <button
          className="mt-auto rounded-full border border-white/30 bg-white/10 px-6 py-3 text-base backdrop-blur"
          onClick={() => {
            setSelectedId(null);
            setBalls(makeBalls(22));
            setStarted(true);
          }}
        >
          สุ่มอีกครั้ง
        </button>
      </div>

      {started && (
        <div className="absolute inset-0 z-10">
          {balls.map((ball) => {
            const isSelected = selectedId === ball.id;
            const isDim = selectedId !== null && !isSelected;
            return (
              <motion.button
                key={ball.id}
                disabled={selectedId !== null}
                onClick={() => setSelectedId(ball.id)}
                className={`absolute rounded-full bg-gradient-to-br ${ball.color} soft-glass border border-white/35 text-lg font-black text-white shadow-glow`}
                style={{ width: ball.size, height: ball.size, left: `${ball.x}%`, top: `${ball.y}%` }}
                animate={
                  selectedId === null
                    ? {
                        x: [0, 20, -15, 0],
                        y: [0, -22, 16, 0],
                        scale: [1, 1.05, 0.98, 1]
                      }
                    : isSelected
                      ? { scale: 1.8 }
                      : { opacity: 0.28, filter: 'blur(2px)' }
                }
                transition={{ duration: ball.duration, repeat: Infinity, ease: 'easeInOut', delay: ball.delay }}
                whileTap={{ scale: 1.08 }}
              >
                {ball.number}
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#110726]/80 backdrop-blur-md"
          >
            <motion.div className="text-sm text-violet-200">เลขของคุณคือ</motion.div>
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: [0.8, 1.12, 1], opacity: 1 }}
              transition={{ duration: 0.8, times: [0, 0.7, 1] }}
              className="mt-3 text-8xl font-black text-yellow-200 drop-shadow-[0_0_30px_rgba(250,204,21,.85)]"
            >
              {selected.number}
            </motion.div>
            <div className="mt-7 flex gap-3">
              <button
                onClick={() => {
                  setSelectedId(null);
                  setBalls(makeBalls(22));
                }}
                className="rounded-full bg-white/15 px-6 py-3 text-base"
              >
                สุ่มอีกครั้ง
              </button>
              <button className="rounded-full bg-gradient-to-r from-pink-400 to-violet-400 px-6 py-3 text-base font-bold">แชร์ผลลัพธ์</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
