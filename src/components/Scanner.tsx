"use client"

import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { QrCode, ScanLine, X, AlertTriangle, ArrowRight, Zap } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function Scanner() {
  const router = useRouter()
  const { user, addTransaction, safeDailySpend } = useStore()
  const [scannedItem, setScannedItem] = useState<{ merchant: string, amount: number, category: string } | null>(null)
  const [isWarning, setIsWarning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDemoScan = () => {
    // Simulate scanning an unplanned clothing item
    setScannedItem({
      merchant: "H&M Stores",
      amount: 150.00,
      category: "Shopping"
    })
    setIsWarning(true) // Immediately trigger the AI interception
  }

  const handleConfirmPay = () => {
    setIsProcessing(true)
    setTimeout(() => {
      addTransaction({
        id: Date.now().toString(),
        title: scannedItem!.merchant,
        amount: scannedItem!.amount,
        date: new Date().toISOString(),
        category: scannedItem!.category,
        type: 'expense',
        confidence: 0.95
      })
      router.push("/dashboard")
    }, 1500)
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-slate-900 relative overflow-hidden flex flex-col">
      {/* Mock Camera View */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-50">
        <div className="w-64 h-64 border-2 border-primary/50 relative">
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary"></div>
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary"></div>
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary"></div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary"></div>
          <motion.div 
            animate={{ y: [0, 250, 0] }} 
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-full h-1 bg-primary shadow-[0_0_15px_#A855F7]"
          />
        </div>
      </div>

      {/* Header */}
      <header className="z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <h1 className="text-white font-bold">Scan DuitNow QR</h1>
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
            <X className="w-6 h-6" />
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 z-10 flex flex-col justify-end p-6 pb-12 space-y-4">
        
        <AnimatePresence>
          {!scannedItem && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="w-full"
            >
              <Button 
                onClick={handleDemoScan}
                className="w-full h-14 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-2xl shadow-xl flex gap-2"
              >
                <QrCode className="w-5 h-5" /> Demo Scan: RM150 Clothing
              </Button>
            </motion.div>
          )}

          {scannedItem && isWarning && !isProcessing && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full"
            >
              <Card className="bg-white border-none shadow-2xl rounded-3xl overflow-hidden">
                <div className="bg-amber-500/10 p-4 flex gap-3 border-b border-amber-500/20">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-600">Spending Sense Alert</h3>
                    <p className="text-xs text-amber-800/80 leading-relaxed mt-1">
                      This RM{scannedItem.amount} purchase matches your impulse buying pattern. 
                      Your safe daily limit is RM{safeDailySpend.toFixed(2)}. Proceeding will lower your Resilience Score.
                    </p>
                  </div>
                </div>
                
                <CardContent className="p-6 space-y-6">
                  <div className="text-center space-y-1">
                    <p className="text-sm text-slate-500 font-medium">Paying {scannedItem.merchant}</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">RM {scannedItem.amount.toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-12 border-slate-200 text-slate-600 rounded-xl"
                      onClick={() => setScannedItem(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="h-12 bg-rose-500 hover:bg-rose-600 text-white rounded-xl"
                      onClick={handleConfirmPay}
                    >
                      Pay Anyway
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-primary animate-spin"></div>
              <p className="font-medium text-slate-600">Processing Payment...</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
