"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export type PetAnimation = "idle" | "walk" | "run" | "wave" | "excited" | "sad" | "happy" | "angry" | "think" | "blink"

interface PetProps {
  animation?: PetAnimation
  size?: number
  className?: string
}

const ANIMATIONS: Record<PetAnimation, { row: number; frames: number }> = {
  idle: { row: 0, frames: 6 },
  walk: { row: 1, frames: 8 },
  run: { row: 2, frames: 8 },
  wave: { row: 3, frames: 4 },
  excited: { row: 4, frames: 5 },
  sad: { row: 5, frames: 8 },
  happy: { row: 6, frames: 6 },
  angry: { row: 7, frames: 6 },
  think: { row: 8, frames: 6 },
  blink: { row: 9, frames: 6 },
}

const ROWS = 10
const COLS = 8 // Maximum columns in the sheet

export function Pet({ animation = "idle", size = 64, className }: PetProps) {
  const [frame, setFrame] = useState(0)
  const anim = ANIMATIONS[animation]

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % anim.frames)
    }, 120) // Frame rate
    return () => clearInterval(interval)
  }, [anim.frames])

  // Reset frame when animation changes
  useEffect(() => {
    setFrame(0)
  }, [animation])

  const xPerc = (frame / COLS) * 100
  const yPerc = (anim.row / ROWS) * 100

  return (
    <div 
      className={cn("relative shrink-0 overflow-hidden", className)}
      style={{ 
        width: size, 
        height: size,
      }}
    >
      <div 
        className="absolute w-full h-full"
        style={{
          backgroundImage: "url('/assets/kebo/spritesheet.webp')",
          backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
          backgroundPosition: `${xPerc}% ${yPerc}%`,
          imageRendering: "pixelated",
        }}
      />
    </div>
  )
}
