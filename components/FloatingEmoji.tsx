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

  const velocityRef = useRef({
    x: data.vx,
    y: data.vy,
  });

  const startedRef = useRef(false);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const maxX = Math.max(0, window.innerWidth - data.size);
    const maxY = Math.max(0, window.innerHeight - data.size);

    x.set((data.x / 100) * maxX);
    y.set((data.y / 100) * maxY);

    velocityRef.current = {
      x: data.vx,
      y: data.vy,
    };

    startedRef.current = true;
  }, [data.size, data.vx, data.vy, data.x, data.y, x, y]);

  useAnimationFrame((time) => {
    if (!startedRef.current) return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = time;
      return;
    }

    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = time;

    // ปรับ physics ให้เด้งสูงและลื่นขึ้น
    const gravity = 820;
    const restitution = 0.92;
    const minHorizontalSpeed = 140;

    const maxX = Math.max(0, window.innerWidth - data.size);
    const maxY = Math.max(0, window.innerHeight - data.size);

    const velocity = velocityRef.current;

    // gravity
    velocity.y += gravity * dt;

    let nextX = x.get() + velocity.x * dt;
    let nextY = y.get() + velocity.y * dt;

    // ชนซ้าย
    if (nextX <= 0) {
      nextX = 0;
      velocity.x = Math.abs(velocity.x) * restitution;
    }

    // ชนขวา
    else if (nextX >= maxX) {
      nextX = maxX;
      velocity.x = -Math.abs(velocity.x) * restitution;
    }

    // ชนบน
    if (nextY <= 0) {
      nextY = 0;
      velocity.y = Math.abs(velocity.y) * restitution;
    }

    // ชนล่าง
    else if (nextY >= maxY) {
      nextY = maxY;

      // เด้งแรงขึ้น
      velocity.y = -Math.abs(velocity.y) * restitution;

      // เพิ่มแรงสุ่มตอนเด้ง
      velocity.y -= Math.random() * 120;

      // กันบอลหยุดนิ่งแนวนอน
      if (Math.abs(velocity.x) < minHorizontalSpeed) {
        velocity.x =
          (Math.random() > 0.5 ? 1 : -1) *
          (minHorizontalSpeed + Math.random() * 120);
      }

      // กันบอลนอนพื้น
      if (Math.abs(velocity.y) < 260) {
        velocity.y = -260 - Math.random() * 180;
      }
    }

    // ลดแรงเสียดทานให้น้อยลง
    velocity.x *= 0.998;

    x.set(nextX);
    y.set(nextY);

    // หมุนตามแรง
    rotation.set(velocity.x * 0.03);
  });

  return (
    <motion.button
      aria-label={`ลูกบอลสุ่มเลข ${data.id}`}
      disabled={disabled}
      onClick={() => onPick(data.number, data.id)}
      className="absolute select-none rounded-full border border-white/70 will-change-transform shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      style={{
        x,
        y,
        rotate: rotation,
        width: data.size,
        height: data.size,
        background: `radial-gradient(circle at 30% 28%, #ffffffdd 0 18%, ${data.colors[0]} 44%, ${data.colors[1]} 100%)`,
      }}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 12,
      }}
    >
      <span className="sr-only">เลขสุ่ม {data.number}</span>
    </motion.button>
  );
}
