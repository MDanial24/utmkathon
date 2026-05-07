"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

const MESSAGES = [
  "Click me!", 
  "Have a good day!", 
  "Need help?", 
  "Keep it up!", 
  "Doing great!", 
  "Check your stats!", 
  "Stay focused!",
  "Financial freedom!",
  "Save more today!",
  "Invest wisely!"
]

export function CoachFAB() {
  const pathname = usePathname()
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (pathname === '/' || pathname === '/coach' || pathname === '/scan') return null

  return (
    <motion.div 
      drag
      dragElastic={0.1}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-4 z-[100] cursor-grab active:cursor-grabbing flex items-center"
    >
      <div className="relative">
        {/* Chat Bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={MESSAGES[msgIndex]}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.8 }}
            className="absolute -top-4 -left-12 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm px-2 py-1.5 rounded-xl rounded-br-none shadow-lg border border-slate-200 dark:border-white/10 whitespace-nowrap pointer-events-none"
          >
            <p className="text-[6px] font-bold text-primary tracking-tight" style={{ fontFamily: "'Press Start 2P', cursive" }}>
              {MESSAGES[msgIndex]}
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1 right-0 w-2 h-2 bg-white/90 dark:bg-zinc-800/90 border-r border-b border-slate-200 dark:border-white/10 rotate-45" />
          </motion.div>
        </AnimatePresence>

        <Link 
          href="/coach"
          className="block"
        >
          <img 
            src="/assets/yun-icon.png" 
            alt="Coach" 
            className="w-28 h-28 object-contain pointer-events-none drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)]"
          />
        </Link>
      </div>
    </motion.div>
  )
}
