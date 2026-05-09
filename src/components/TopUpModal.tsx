"use client"

import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, DollarSign, Wallet, ArrowUpCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { t } from "@/lib/translations"

export function TopUpModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addTransaction, language } = useStore()
  const [amount, setAmount] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const strings = t[language]

  const quickFills = [10, 50, 100, 500]

  const handleQuickFill = (val: number) => {
    setAmount(val.toString())
  }

  const handleTopUp = () => {
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) return

    addTransaction({
      id: Date.now().toString(),
      title: "Top Up Wallet",
      amount: numAmount,
      category: "Income",
      date: new Date().toISOString(),
      type: 'income',
      confidence: 1.0
    })

    setIsSuccess(true)
    setTimeout(() => {
      setIsSuccess(false)
      setAmount("")
      onClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-sm glass-card p-6 space-y-6"
      >
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
                <ArrowUpCircle className="w-8 h-8 animate-pulse" />
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold">{strings.topUpTitle}</h2>
                <p className="text-xs text-muted-foreground">Load funds instantly to restore your safe limit.</p>
              </div>

              {/* Amount Input */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">RM</span>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-12 h-14 text-2xl font-black text-slate-900 bg-white border-slate-200 rounded-2xl placeholder:text-slate-200 focus-visible:ring-emerald-500 transition-all"
                />
              </div>

              {/* Quick Fill Chips */}
              <div className="flex justify-between gap-2">
                {quickFills.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleQuickFill(val)}
                    className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 border border-slate-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all"
                  >
                    +RM {val}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
                <Button 
                  disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                  onClick={handleTopUp}
                >
                  Top Up
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-8 text-center space-y-4"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/20"
              >
                <CheckCircle2 className="w-8 h-8" />
              </motion.div>
              <h2 className="text-xl font-bold text-emerald-500">{strings.topUpSuccess}</h2>
              <p className="text-xs text-muted-foreground">{strings.topUpSuccessDesc}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
