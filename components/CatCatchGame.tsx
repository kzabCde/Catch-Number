'use client';

import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Ball } from '@/lib/types';

const BALL_COUNT = 18;
const PAD = 24;

const createBalls = (w: number, h: number): Ball[] =>
  Array.from({ length: BALL_COUNT }, (_, id) => ({
    id,
    value: String(Math.floor(Math.random() * 100)).padStart(2, '0'),
    x: PAD + Math.random() * (w - 2 * PAD),
    y: PAD + Math.random() * (h - 2 * PAD),
    vx: (Math.random() * 2 + 0.8) * (Math.random() > 0.5 ? 1 : -1),
    vy: (Math.random() * 2 + 0.8) * (Math.random() > 0.5 ? 1 : -1),
    size: 42 + Math.random() * 22
  }));

export default function CatCatchGame() {
  const arenaRef = useRef<HTMLDivElement>(null);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<Ball | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [dark, setDark] = useState(true);
  const [cat, setCat] = useState({ x: 40, y: 40, face: '😺' });

  const dimensions = useMemo(() => {
    const node = arenaRef.current;
    return { w: node?.clientWidth ?? 360, h: node?.clientHeight ?? 420 };
  }, [balls.length]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    setBalls(createBalls(dimensions.w, dimensions.h));
  }, [dimensions.h, dimensions.w]);

  useEffect(() => {
    if (!isPlaying || winner) return;
    let raf = 0;
    const loop = () => {
      setBalls((prev) => {
        const updated = prev.map((ball) => {
          let x = ball.x + ball.vx;
          let y = ball.y + ball.vy;
          let vx = ball.vx;
          let vy = ball.vy;

          if (x < PAD || x > dimensions.w - PAD) vx *= -1;
          if (y < PAD || y > dimensions.h - PAD) vy *= -1;

          x = Math.min(Math.max(x, PAD), dimensions.w - PAD);
          y = Math.min(Math.max(y, PAD), dimensions.h - PAD);
          return { ...ball, x, y, vx, vy };
        });

        const target = updated[Math.floor(Math.random() * updated.length)];
        if (target) {
          setCat((prevCat) => ({
            x: prevCat.x + (target.x - prevCat.x) * 0.06,
            y: prevCat.y + (target.y - prevCat.y) * 0.06,
            face: ['😺', '😸', '😻'][Math.floor(Math.random() * 3)]
          }));

          const dx = cat.x - target.x;
          const dy = cat.y - target.y;
          if (Math.hypot(dx, dy) < 32) {
            setWinner(target);
            setHistory((h) => [target.value, ...h].slice(0, 20));
            setIsPlaying(false);
            if (soundOn) new Audio('/meow.mp3').play().catch(() => undefined);
            if ('vibrate' in navigator) navigator.vibrate(140);
          }
        }

        return updated;
      });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, winner, dimensions.w, dimensions.h, soundOn, cat.x, cat.y]);

  const start = () => {
    setWinner(null);
    setIsPlaying(true);
    setBalls(createBalls(dimensions.w, dimensions.h));
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-4">
      <header className="rounded-3xl bg-neon-card/80 p-4 shadow-neon">
        <h1 className="text-center text-3xl font-black tracking-wide">🐾 Cat Catch Number</h1>
        <p className="mt-1 text-center text-sm text-cyan-100">Tap start and let the kitty pick your lucky number!</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button onClick={start} className="min-h-12 rounded-full bg-cyan-300 px-8 py-3 text-lg font-bold text-slate-900 shadow-neon">START</button>
          <button onClick={() => setSoundOn((s) => !s)} className="min-h-12 rounded-full bg-white/10 px-4">{soundOn ? '🔊 Sound' : '🔇 Sound'}</button>
          <button onClick={() => setMusicOn((m) => !m)} className="min-h-12 rounded-full bg-white/10 px-4">{musicOn ? '🎵 Music' : '🎵 Off'}</button>
          <button onClick={() => setDark((d) => !d)} className="min-h-12 rounded-full bg-white/10 px-4">{dark ? '🌙 Dark' : '☀️ Light'}</button>
        </div>
      </header>

      <section ref={arenaRef} className="relative h-[52vh] min-h-[360px] overflow-hidden rounded-3xl border border-cyan-200/20 bg-neon-card/70">
        {balls.map((ball) => (
          <motion.button
            key={ball.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => {
              if (!isPlaying) return;
              setWinner(ball);
              setIsPlaying(false);
              setHistory((h) => [ball.value, ...h].slice(0, 20));
            }}
            style={{ left: ball.x, top: ball.y, width: ball.size, height: ball.size }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border text-lg font-bold shadow-neon ${winner?.id === ball.id ? 'scale-125 border-pink-200 bg-pink-400/80' : 'border-cyan-100/60 bg-cyan-300/30 backdrop-blur'}`}
          >
            {ball.value}
          </motion.button>
        ))}
        <motion.div
          animate={{ x: cat.x, y: cat.y, scaleY: isPlaying ? [1, 0.92, 1.02, 1] : 1 }}
          transition={{ duration: 0.45, repeat: isPlaying ? Infinity : 0 }}
          className="pointer-events-none absolute left-0 top-0 text-5xl"
        >
          {cat.face}
        </motion.div>
        {winner && <div className="pointer-events-none absolute inset-0 bg-white/5" />}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-neon-card/80 p-4 text-center shadow-pink">
          <p className="text-sm uppercase tracking-widest text-pink-200">Winning Number</p>
          <motion.p initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="text-7xl font-black text-neon-mint">{winner?.value ?? '--'}</motion.p>
          <div className="mt-3 flex justify-center gap-2">
            <button onClick={start} className="min-h-12 rounded-full bg-pink-300 px-5 font-bold text-slate-900">Replay</button>
            <button onClick={() => navigator.share?.({ title: 'Cat Catch Number', text: `I got ${winner?.value ?? '--'}!` })} className="min-h-12 rounded-full bg-white/10 px-5">Share</button>
          </div>
        </div>

        <aside className="rounded-3xl bg-neon-card/80 p-4">
          <h2 className="mb-2 text-lg font-bold">History</h2>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {history.length === 0 ? <p className="text-sm text-cyan-100">No catches yet.</p> : history.map((num, i) => <div key={`${num}-${i}`} className="rounded-xl bg-white/10 px-3 py-2 text-xl font-semibold">#{i + 1} · {num}</div>)}
          </div>
        </aside>
      </section>
    </main>
  );
}
