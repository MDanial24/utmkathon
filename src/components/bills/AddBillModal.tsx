"use client"

import { useStore, Bill, BillFrequency, AutoPaySafety } from "@/store/useStore"
import { t } from "@/lib/translations"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ReceiptText, Home, Phone, Train, BookOpen, Tv, Info } from "lucide-react"

interface AddBillModalProps {
  isOpen: boolean
  onClose: () => void
  editingBill?: Bill | null
}

const TEMPLATES = [
  { name: 'Rent / Hostel', category: 'Housing', icon: Home, color: 'bg-indigo-500/10 text-indigo-500' },
  { name: 'Phone Bill', category: 'Utilities', icon: Phone, color: 'bg-emerald-500/10 text-emerald-500' },
  { name: 'PTPTN', category: 'Education', icon: BookOpen, color: 'bg-amber-500/10 text-amber-500' },
  { name: 'Internet', category: 'Utilities', icon: ReceiptText, color: 'bg-blue-500/10 text-blue-500' },
  { name: 'Streaming', category: 'Entertainment', icon: Tv, color: 'bg-rose-500/10 text-rose-500' },
  { name: 'Transport Pass', category: 'Transport', icon: Train, color: 'bg-slate-500/10 text-slate-500' },
]

export function AddBillModal({ isOpen, onClose, editingBill }: AddBillModalProps) {
  const { language, addBill, updateBill } = useStore()
  const strings = t[language]

  const [formData, setFormData] = useState<Partial<Bill>>({
    name: "",
    category: "General",
    amount: 0,
    frequency: "monthly",
    dueDay: 5,
    nextDueDate: new Date().toISOString(),
    isLocked: true,
    autopayEnabled: false,
    autopaySafety: "balanced",
    accountNumber: "",
    referenceNumber: "",
    reminderDaysBefore: 3
  })

  useEffect(() => {
    if (editingBill) {
      setFormData(editingBill)
    } else {
      setFormData({
        name: "",
        category: "General",
        amount: 0,
        frequency: "monthly",
        dueDay: 5,
        nextDueDate: new Date().toISOString(),
        isLocked: true,
        autopayEnabled: false,
        autopaySafety: "balanced",
        accountNumber: "",
        referenceNumber: "",
        reminderDaysBefore: 3
      })
    }
  }, [editingBill, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.amount) return

    if (editingBill) {
      const updates = { ...formData };
      // If we're completing setup, move to upcoming
      if (editingBill.status === 'needs_setup' && (formData.accountNumber || formData.referenceNumber)) {
        updates.status = 'upcoming';
      }
      updateBill(editingBill.id, updates)
    } else {
      const newBill: Bill = {
        id: Math.random().toString(36).substring(7),
        name: formData.name || "",
        category: formData.category || "General",
        amount: Number(formData.amount),
        frequency: (formData.frequency as BillFrequency) || "monthly",
        dueDay: Number(formData.dueDay),
        nextDueDate: formData.nextDueDate || new Date().toISOString(),
        isLocked: !!formData.isLocked,
        autopayEnabled: !!formData.autopayEnabled,
        autopaySafety: (formData.autopaySafety as AutoPaySafety) || "balanced",
        accountNumber: formData.accountNumber,
        referenceNumber: formData.referenceNumber,
        reminderDaysBefore: Number(formData.reminderDaysBefore),
        status: "upcoming",
        source: "manual",
        createdAt: new Date().toISOString(),
        paymentHistory: []
      }
      addBill(newBill)
    }
    onClose()
  }

  const applyTemplate = (tpl: any) => {
    setFormData(prev => ({
      ...prev,
      name: tpl.name,
      category: tpl.category
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 overflow-hidden border border-white/10 glass-card shadow-2xl text-white">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-white">{editingBill ? strings.billsEdit : strings.billsAdd}</DialogTitle>
              <DialogDescription className="text-xs font-medium text-white/50">{strings.billsSubheader}</DialogDescription>
            </DialogHeader>

            {/* Templates Section */}
            {!editingBill && (
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-white/30">Quick Templates</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map((tpl) => {
                    const IconComp = tpl.icon
                    return (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => applyTemplate(tpl)}
                        className={`px-3 py-2 rounded-full border flex items-center gap-2.5 transition-all hover:bg-white/10 text-left ${
                          formData.name === tpl.name ? 'border-primary bg-primary/20 ring-1 ring-primary/50 shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${tpl.color.replace('bg-indigo-500/10', 'bg-indigo-500/20').replace('bg-emerald-500/10', 'bg-emerald-500/20').replace('bg-amber-500/10', 'bg-amber-500/20').replace('bg-blue-500/10', 'bg-blue-500/20').replace('bg-rose-500/10', 'bg-rose-500/20').replace('bg-slate-500/10', 'bg-white/10')}`}>
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-black text-white/90 truncate">{tpl.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-white/50">{strings.billsName}</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Phone Bill" 
                  className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/50">{strings.billsAmount} (RM)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={formData.amount === 0 ? "" : formData.amount} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(p => ({ ...p, amount: val === "" ? 0 : Number(val) }));
                    }}
                    placeholder="0.00"
                    className="rounded-xl border-white/10 bg-white/5 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white/50">{strings.billsDueDay}</Label>
                  <Input 
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDay === 0 ? "" : formData.dueDay} 
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(p => ({ ...p, dueDay: val === "" ? 0 : Number(val) }));
                    }}
                    placeholder="5"
                    className="rounded-xl border-white/10 bg-white/5 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-white/50">{strings.billsAccNum}</Label>
                <Input 
                  value={formData.accountNumber} 
                  onChange={e => setFormData(p => ({ ...p, accountNumber: e.target.value }))}
                  placeholder="e.g. 123456789" 
                  className="rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/20"
                  required
                />
              </div>

              <div className="space-y-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-white">{strings.billsLock}</Label>
                    <p className="text-[10px] text-white/40">Protect money for this bill</p>
                  </div>
                  <Switch 
                    checked={formData.isLocked} 
                    onCheckedChange={val => setFormData(p => ({ ...p, isLocked: val }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-bold text-white">{strings.billsAutoPayToggle}</Label>
                    <p className="text-[10px] text-white/40">Pay automatically on due date</p>
                  </div>
                  <Switch 
                    checked={formData.autopayEnabled} 
                    onCheckedChange={val => setFormData(p => ({ ...p, autopayEnabled: val }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white/5 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl font-bold text-white/50 hover:text-white hover:bg-white/5">
              {strings.billsCancel}
            </Button>
            <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/80 text-white font-black px-8 shadow-lg shadow-primary/20">
              {editingBill ? strings.billsSave : strings.billsAdd}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
