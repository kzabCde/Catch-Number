'use client';

import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ball } from '@/lib/types';

const BALL_COUNT = 16;
const PAD = 28;

const format2 = (n: number) => String(n).padStart(2, '0');

const createBalls = (w: number, h: number): Ball[] =>
  Array.from({ length: BALL_COUNT }, (_, id) => ({
    id,
    value: format2(Math.floor(Math.random() * 100)),
    x: PAD + Math.random() * Math.max(1, w - PAD * 2),
    y: PAD + Math.random() * Math.max(1, h - PAD * 2),
    vx: (Math.random() * 1.8 + 0.9) * (Math.random() > 0.5 ? 1 : -1),
    vy: (Math.random() * 1.8 + 0.9) * (Math.random() > 0.5 ? 1 : -1),
    size: 54
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
  const [cat, setCat] = useState({ x: 60, y: 300, mood: 'พร้อมลุย!' });

  const dimensions = useMemo(() => {
    const node = arenaRef.current;
    return { w: node?.clientWidth ?? 380, h: node?.clientHeight ?? 460 };
  }, [balls.length]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    setBalls(createBalls(dimensions.w, dimensions.h));
  }, [dimensions.w, dimensions.h]);

  const playMeow = useCallback(() => {
    if (!soundOn) return;
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 520;
    gain.gain.value = 0.001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03);
    osc.frequency.exponentialRampToValueAtTime(390, ctx.currentTime + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.26);
    osc.start();
    osc.stop(ctx.currentTime + 0.27);
  }, [soundOn]);

  const stopWithWinner = useCallback(
    (ball: Ball) => {
      setWinner(ball);
      setIsPlaying(false);
      setHistory((prev) => [ball.value, ...prev].slice(0, 30));
      setCat((prev) => ({ ...prev, x: ball.x, y: ball.y, mood: `จับได้เลข ${ball.value}!` }));
      if ('vibrate' in navigator) navigator.vibrate([90, 50, 100]);
      playMeow();
    },
    [playMeow]
  );

  useEffect(() => {
    if (!isPlaying || winner) return;

    let raf = 0;
    const loop = () => {
      setBalls((prevBalls) =>
        prevBalls.map((ball) => {
          let x = ball.x + ball.vx;
          let y = ball.y + ball.vy;
          let vx = ball.vx;
          let vy = ball.vy;

          if (x < PAD || x > dimensions.w - PAD) vx *= -1;
          if (y < PAD || y > dimensions.h - PAD) vy *= -1;

          x = Math.min(Math.max(x, PAD), dimensions.w - PAD);
          y = Math.min(Math.max(y, PAD), dimensions.h - PAD);

          return { ...ball, x, y, vx, vy };
        })
      );
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, winner, dimensions.w, dimensions.h]);

  const startGame = () => {
    setWinner(null);
    setIsPlaying(true);
    setCat({ x: 60, y: dimensions.h - 90, mood: 'แตะลูกบอลเพื่อสุ่มเลข' });
    setBalls(createBalls(dimensions.w, dimensions.h));
  };

  const handleArenaTouch = (clientX: number, clientY: number) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect || !isPlaying || winner) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setCat((prev) => ({ ...prev, x, y, mood: 'กำลังแตะจับลูกบอล' }));

    const hit = balls.find((ball) => Math.hypot(x - ball.x, y - ball.y) <= ball.size * 0.6);
    if (hit) stopWithWinner(hit);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 p-4">
      <header className="rounded-3xl bg-neon-card/80 p-4 shadow-neon">
        <h1 className="text-center text-3xl font-black tracking-wide">🐾 แตะลูกบอลเพื่อสุ่มเลข</h1>
        <p className="mt-1 text-center text-sm text-cyan-100">ผู้เล่นแตะหน้าจอให้โดนลูกบอลได้เลย จะแสดงเลขทันที</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button onClick={startGame} className="min-h-12 min-w-28 rounded-full bg-cyan-300 px-8 py-3 text-lg font-bold text-slate-900 shadow-neon">เริ่ม</button>
          <button onClick={() => setSoundOn((s) => !s)} className="min-h-12 min-w-24 rounded-full bg-white/10 px-4">{soundOn ? '🔊 เสียงเปิด' : '🔇 เสียงปิด'}</button>
          <button onClick={() => setMusicOn((m) => !m)} className="min-h-12 min-w-24 rounded-full bg-white/10 px-4">{musicOn ? '🎵 เพลงเปิด' : '🎵 เพลงปิด'}</button>
          <button onClick={() => setDark((d) => !d)} className="min-h-12 min-w-24 rounded-full bg-white/10 px-4">{dark ? '🌙 โหมดมืด' : '☀️ โหมดสว่าง'}</button>
        </div>
      </header>

      <section ref={arenaRef} className="relative h-[54vh] min-h-[380px] overflow-hidden rounded-3xl border border-cyan-200/20 bg-neon-card/70" onPointerDown={(e) => handleArenaTouch(e.clientX, e.clientY)}>
        {balls.map((ball) => (
          <motion.button
            key={ball.id}
            whileTap={{ scale: 0.86 }}
            onClick={() => {
              if (isPlaying) stopWithWinner(ball);
            }}
            style={{ left: ball.x, top: ball.y, width: ball.size, height: ball.size }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border text-xl font-black shadow-neon ${winner?.id === ball.id ? 'scale-125 border-pink-200 bg-pink-400/85' : 'border-cyan-100/60 bg-cyan-300/30 backdrop-blur'}`}
          >
            {ball.value}
          </motion.button>
        ))}

        <motion.div
          animate={{ x: cat.x, y: cat.y, scaleX: isPlaying ? [1, 1.08, 1] : 1, scaleY: isPlaying ? [1, 0.9, 1.04, 1] : 1 }}
          transition={{ duration: 0.55, repeat: isPlaying ? Infinity : 0 }}
          className="pointer-events-none absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-1/2"
        >
          <span className="block text-6xl">🐈</span>
        </motion.div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl bg-neon-card/80 p-4 text-center shadow-pink">
          <p className="text-sm uppercase tracking-widest text-pink-200">ผลที่สุ่มได้</p>
          <motion.p initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="text-7xl font-black text-neon-mint">{winner?.value ?? '--'}</motion.p>
          <p className="mt-2 text-sm text-cyan-100">สถานะแมว: {cat.mood}</p>
          <div className="mt-3 flex justify-center gap-2">
            <button onClick={startGame} className="min-h-12 rounded-full bg-pink-300 px-5 font-bold text-slate-900">เล่นอีกครั้ง</button>
            <button onClick={() => navigator.share?.({ title: 'สุ่มเลขด้วยการแตะลูกบอล', text: `วันนี้สุ่มได้ ${winner?.value ?? '--'} 🎉` })} className="min-h-12 rounded-full bg-white/10 px-5">แชร์ผล</button>
          </div>
        </div>

        <aside className="rounded-3xl bg-neon-card/80 p-4">
          <h2 className="mb-2 text-lg font-bold">ประวัติเลขก่อนหน้า</h2>
          <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
            {history.length === 0 ? <p className="text-sm text-cyan-100">ยังไม่มีประวัติการสุ่ม</p> : history.map((num, i) => (
              <div key={`${num}-${i}`} className="rounded-xl bg-white/10 px-3 py-2 text-xl font-semibold">ครั้งที่ {i + 1} · {num}</div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
