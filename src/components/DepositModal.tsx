"use client"

import { useState } from "react"
import { useStore, SavingsPocket } from "@/store/useStore"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { t } from "@/lib/translations"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  pocket: SavingsPocket | null
}

export function DepositModal({ isOpen, onClose, pocket }: DepositModalProps) {
  const { addFundsToPocket, language } = useStore()
  const strings = t[language]
  
  const [amount, setAmount] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pocket) return
    
    addFundsToPocket(pocket.id, parseFloat(amount))
    setAmount("")
    onClose()
  }

  if (!pocket) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] glass-card border-white/10 text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {strings.saveAddFundsTo || "Add Funds to"} {pocket.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
              {strings.saveAmountToSave || "Amount to Save (RM)"}
            </label>
            <Input
              required
              type="number"
              placeholder="e.g. 50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white/5 border-white/10 h-14 rounded-xl text-lg text-center font-bold text-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {[10, 20, 50, 100].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val.toString())}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/20 hover:border-primary/50 transition-colors text-xs font-bold"
              >
                +RM {val}
              </button>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-lg shadow-primary/20"
            >
              {strings.saveConfirmDeposit || "Confirm Deposit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
