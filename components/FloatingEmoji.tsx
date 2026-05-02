"use client";

import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

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
  const velocityRef = useRef({ x: data.vx, y: data.vy });
  const startedRef = useRef(false);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const maxX = Math.max(0, window.innerWidth - data.size);
    const maxY = Math.max(0, window.innerHeight - data.size);
    x.set((data.x / 100) * maxX);
    y.set((data.y / 100) * maxY);
    velocityRef.current = { x: data.vx, y: data.vy };
    startedRef.current = true;
  }, [data.size, data.vx, data.vy, data.x, data.y, x, y]);

  useAnimationFrame((time) => {
    if (!startedRef.current) return;
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
      return;
    }

    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.033);
    lastTimeRef.current = time;

    const gravity = 920;
    const restitution = 0.84;
    const friction = 0.997;
    const bounceBoost = 3;
    const maxSpeed = 2400;
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const stepDt = dt / steps;
    const maxX = Math.max(0, window.innerWidth - data.size);
    const maxY = Math.max(0, window.innerHeight - data.size);
    const velocity = velocityRef.current;
    let nextX = x.get();
    let nextY = y.get();

    for (let i = 0; i < steps; i += 1) {
      velocity.y += gravity * stepDt;
      velocity.x *= friction;

      velocity.x = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.x));
      velocity.y = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.y));

      nextX += velocity.x * stepDt;
      nextY += velocity.y * stepDt;

      if (nextX <= 0) {
        nextX = 0;
        velocity.x = Math.abs(velocity.x) * restitution * bounceBoost;
      } else if (nextX >= maxX) {
        nextX = maxX;
        velocity.x = -Math.abs(velocity.x) * restitution * bounceBoost;
      }

      if (nextY <= 0) {
        nextY = 0;
        velocity.y = Math.abs(velocity.y) * restitution * bounceBoost;
      } else if (nextY >= maxY) {
        nextY = maxY;
        velocity.y = -Math.abs(velocity.y) * restitution * bounceBoost;
      }
    }

    x.set(nextX);
    y.set(nextY);
    rotation.set(velocity.x * 0.02);
  });

  return (
    <motion.button
      aria-label={`ลูกบอลสุ่มเลข ${data.id}`}
      disabled={disabled}
      onClick={() => onPick(data.number, data.id)}
      className="absolute select-none rounded-full border border-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
      style={{
        x,
        y,
        rotate: rotation,
        width: data.size,
        height: data.size,
        filter: "blur(0.1px)",
        background: `radial-gradient(circle at 30% 28%, #ffffffdd 0 18%, ${data.colors[0]} 44%, ${data.colors[1]} 100%)`,
      }}
      whileTap={{ scale: 0.9 }}
    >
      <span className="sr-only">เลขสุ่ม {data.number}</span>
    </motion.button>
  );
}
