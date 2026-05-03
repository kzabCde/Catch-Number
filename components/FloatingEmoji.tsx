"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type EmojiData = {
  id: number;
  number: string;
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  colors: [string, string];
};

export function FloatingEmoji({
  data,
  onPick,
  disabled,
}: {
  data: EmojiData;
  onPick: (value: string, id: number) => void;
  disabled: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotation = useMotionValue(0);
  const scale = useMotionValue(1);

  const [rippling, setRippling] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [shaking, setShaking] = useState(false);

  const velocityRef = useRef({ x: data.vx, y: data.vy });
  const driftRef = useRef({ ax: 0, ay: 0, pauseUntil: 0, burstUntil: 0 });
  const startedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const noiseSeed = useRef(Math.random() * 5000);

  useEffect(() => {
    const maxX = Math.max(0, window.innerWidth - data.size);
    const maxY = Math.max(0, window.innerHeight - data.size);
    x.set((data.x / 100) * maxX);
    y.set((data.y / 100) * maxY);
    velocityRef.current = { x: data.vx, y: data.vy };
    driftRef.current = { ax: 0, ay: 0, pauseUntil: 0, burstUntil: 0 };
    startedRef.current = true;
    lastTimeRef.current = 0;
  }, [data.size, data.vx, data.vy, data.x, data.y, x, y]);

  useAnimationFrame((time) => {
    if (!startedRef.current) return;
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
      return;
    }

    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.033);
    lastTimeRef.current = time;

    const maxX = Math.max(0, window.innerWidth - data.size);
    const maxY = Math.max(0, window.innerHeight - data.size);
    const velocity = velocityRef.current;
    const drift = driftRef.current;

    const t = time * 0.001;
    const noise = Math.sin(noiseSeed.current + t * 1.3) + Math.sin(noiseSeed.current * 0.6 + t * 2.2);
    const jitterX = (Math.random() - 0.5) * 80;
    const jitterY = (Math.random() - 0.5) * 80;

    if (Math.random() < 0.02) {
      drift.ax = (Math.random() - 0.5) * 460;
      drift.ay = (Math.random() - 0.5) * 460;
    }

    if (Math.random() < 0.004) {
      drift.pauseUntil = t + (0.08 + Math.random() * 0.24);
    }

    if (Math.random() < 0.006) {
      drift.burstUntil = t + 0.18;
      const boost = 260 + Math.random() * 320;
      const angle = Math.random() * Math.PI * 2;
      velocity.x += Math.cos(angle) * boost;
      velocity.y += Math.sin(angle) * boost;
    }

    const isPaused = t < drift.pauseUntil;
    const burstMul = t < drift.burstUntil ? 1.35 : 1;

    const accelX = (drift.ax + jitterX + noise * 90) * burstMul;
    const accelY = (drift.ay + jitterY - noise * 90) * burstMul;

    if (!isPaused) {
      velocity.x += accelX * dt;
      velocity.y += accelY * dt;
    } else {
      velocity.x *= 0.9;
      velocity.y *= 0.9;
    }

    velocity.x *= 0.992;
    velocity.y *= 0.992;

    let nextX = x.get() + velocity.x * dt;
    let nextY = y.get() + velocity.y * dt;

    const restitution = 0.9;
    if (nextX <= 0) {
      nextX = 0;
      velocity.x = Math.abs(velocity.x) * restitution;
    } else if (nextX >= maxX) {
      nextX = maxX;
      velocity.x = -Math.abs(velocity.x) * restitution;
    }

    if (nextY <= 0) {
      nextY = 0;
      velocity.y = Math.abs(velocity.y) * restitution;
    } else if (nextY >= maxY) {
      nextY = maxY;
      velocity.y = -Math.abs(velocity.y) * restitution;
    }

    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    velocity.x = clamp(velocity.x, -520, 520);
    velocity.y = clamp(velocity.y, -520, 520);

    const breathe = 1 + Math.sin(t * 2.2 + data.id) * 0.04;
    scale.set(breathe);
    x.set(nextX);
    y.set(nextY);
    rotation.set(velocity.x * 0.022 + Math.sin(t * 3 + data.id) * 5);
  });

  const handleTap = () => {
    setRippling(true);
    setBursting(true);
    setShaking(true);
    window.setTimeout(() => setRippling(false), 360);
    window.setTimeout(() => setBursting(false), 420);
    window.setTimeout(() => setShaking(false), 180);
    onPick(data.number, data.id);
  };

  return (
    <motion.button
      aria-label={`ลูกบอลสุ่มเลข ${data.id}`}
      disabled={disabled}
      onClick={handleTap}
      className="floating-ball absolute select-none rounded-full will-change-transform"
      style={{
        x,
        y,
        rotate: rotation,
        scale,
        width: data.size,
        height: data.size,
        background: `radial-gradient(circle at 30% 28%, #ffffffee 0 18%, ${data.colors[0]} 44%, ${data.colors[1]} 100%)`,
        boxShadow: `0 0 8px ${data.colors[0]}88, 0 0 24px ${data.colors[1]}99, 0 8px 22px rgba(0,0,0,0.24)`,
      }}
      animate={shaking ? { x: [0, -4, 4, -2, 0] } : { x: 0 }}
      transition={{ duration: 0.2 }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="sr-only">เลขสุ่ม {data.number}</span>
      <span className="trail" />
      <span className="spark spark-a" />
      <span className="spark spark-b" />
      <span className={`ripple ${rippling ? "show" : ""}`} />
      <span className={`burst ${bursting ? "show" : ""}`} />
    </motion.button>
  );
}
