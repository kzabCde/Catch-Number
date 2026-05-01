'use client';

import { motion } from 'framer-motion';
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [winner, setWinner] = useState<Ball | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const [dark, setDark] = useState(true);
    (ball: Ball) => {
      setCat((prev) => ({ ...prev, x: ball.x, y: ball.y, mood: `จับได้เลข ${ball.value}!` }));
      if (soundOn) {
        const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctx) {
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
        }
    [soundOn]
      setBalls((prevBalls) =>
        prevBalls.map((ball) => {
        })
      );
  }, [isPlaying, winner, dimensions.w, dimensions.h]);
    setCat({ x: 60, y: dimensions.h - 90, mood: 'แตะลูกบอลเพื่อสุ่มเลข' });
  const handleArenaTouch = (clientX: number, clientY: number) => {
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setCat((prev) => ({ ...prev, x, y, mood: 'กำลังแตะจับลูกบอล' }));
    const hit = balls.find((ball) => Math.hypot(x - ball.x, y - ball.y) <= ball.size * 0.6);
    if (hit) stopWithWinner(hit);

        <h1 className="text-center text-3xl font-black tracking-wide">🐾 แตะลูกบอลเพื่อสุ่มเลข</h1>
        <p className="mt-1 text-center text-sm text-cyan-100">ผู้เล่นแตะหน้าจอให้โดนลูกบอลได้เลย จะแสดงเลขทันที</p>
        onPointerDown={(e) => handleArenaTouch(e.clientX, e.clientY)}
              if (isPlaying) stopWithWinner(ball);
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-20 -translate-x-1/2 -translate-y-1/2"
        </motion.div>
            <button onClick={() => navigator.share?.({ title: 'สุ่มเลขด้วยการแตะลูกบอล', text: `วันนี้สุ่มได้ ${winner?.value ?? '--'} 🎉` })} className="min-h-12 rounded-full bg-white/10 px-5">แชร์ผล</button>
            {history.length === 0 ? <p className="text-sm text-cyan-100">ยังไม่มีประวัติการสุ่ม</p> : history.map((num, i) => (
              <div key={`${num}-${i}`} className="rounded-xl bg-white/10 px-3 py-2 text-xl font-semibold">ครั้งที่ {i + 1} · {num}</div>
            ))}
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
