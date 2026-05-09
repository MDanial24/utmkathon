"use client"

import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, BrainCircuit, User, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Transfer() {
  const router = useRouter()
  const { user, addTransaction, safeDailySpend } = useStore()
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const numAmount = parseFloat(amount)
  const hasInsufficientBalance = !isNaN(numAmount) && numAmount > user.currentBalance
  const prediction = !isNaN(numAmount) && numAmount > 0 && !hasInsufficientBalance
    ? numAmount > safeDailySpend * 3
      ? `Sending RM${numAmount} will move your Broke Date 4 days earlier. Are you sure this is necessary?`
      : numAmount > safeDailySpend
        ? `This exceeds your safe daily limit of RM${safeDailySpend.toFixed(2)}.`
        : null
    : null

  const handleTransfer = () => {

    if (!amount || isNaN(parseFloat(amount))) return
    
    setIsProcessing(true)
    setTimeout(() => {
      addTransaction({
        id: Date.now().toString(),
        title: "Ahmad Ali (Maybank)",
        amount: parseFloat(amount),
        date: new Date().toISOString(),
        category: "Transfer",
        type: 'expense',
        confidence: 0.80
      })
      router.push("/dashboard")
    }, 1500)

  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto">
      <header className="bg-white px-4 pt-safe pb-4 sticky top-0 z-50 border-b border-slate-200">
        <div className="flex items-center gap-3 pt-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-slate-600 rounded-full hover:bg-slate-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-slate-900">Transfer</h1>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-6">
        
        {/* Recipient Mock */}
        <Card className="bg-white border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Ahmad Ali</p>
              <p className="text-xs text-slate-500">Maybank • 1622 **** 8899</p>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Amount</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">RM</span>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-14 h-20 text-4xl font-black text-slate-900 bg-white border-slate-200 rounded-2xl placeholder:text-slate-200 focus-visible:ring-primary focus-visible:border-primary transition-all"
            />
          </div>
        </div>

        {/* AI Interception */}
        <AnimatePresence>
          {hasInsufficientBalance && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-600">Insufficient Balance</p>
                  <p className="text-xs text-rose-800/80 leading-relaxed">
                    You cannot transfer more than your available wallet balance of RM {user.currentBalance.toFixed(2)}. Please top up your wallet.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {prediction && (
            <motion.div 
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
                <BrainCircuit className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-600">Cashflow Prediction</p>
                  <p className="text-xs text-amber-800/80 leading-relaxed">{prediction}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ref Input */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Reference</p>
          <Input 
            placeholder="e.g. Dinner yesterday" 
            className="h-14 bg-white border-slate-200 rounded-2xl"
          />
        </div>

      </main>

      {/* Footer Action */}
      <div className="p-4 bg-white border-t border-slate-200 pb-safe">
        <Button 
          onClick={handleTransfer}
          disabled={!amount || isProcessing || hasInsufficientBalance}
          className={`w-full h-14 font-bold rounded-2xl shadow-xl flex gap-2 justify-center items-center ${
            hasInsufficientBalance 
              ? "bg-rose-500 hover:bg-rose-600 text-white cursor-not-allowed" 
              : "bg-primary hover:bg-primary/90 text-white"
          }`}
        >
          {isProcessing ? "Processing..." : hasInsufficientBalance ? "Insufficient Balance" : "Transfer Now"} 
          {!hasInsufficientBalance && <Send className="w-4 h-4 ml-2" />}
        </Button>
      </div>
    </div>
  )
}
