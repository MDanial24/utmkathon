"use client"

import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { CreditCard, Plus, ShieldCheck, Zap, ArrowUpRight, History } from "lucide-react"

export function Cards() {
  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-center pt-6">
        <div>
          <h1 className="text-2xl font-bold">My Cards</h1>
          <p className="text-xs text-muted-foreground">Manage your virtual and physical cards</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Main Card Display */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative group perspective-1000"
      >
        <div className="w-full h-52 rounded-[2rem] bg-gradient-to-br from-primary via-purple-600 to-indigo-700 p-6 text-white shadow-2xl relative overflow-hidden transform-gpu transition-transform duration-500 hover:rotate-y-12">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/20 rounded-full -ml-10 -mb-10 blur-2xl" />
          
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Virtual Card</p>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <p className="text-lg font-bold">Resilience Platinum</p>
                </div>
              </div>
              <div className="w-12 h-8 bg-white/20 rounded-lg backdrop-blur-md border border-white/30 flex items-center justify-center">
                <span className="text-[8px] font-black italic">BEYOND</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="text-xl font-mono tracking-[0.2em]">••••</span>
                <span className="text-xl font-mono tracking-[0.2em]">••••</span>
                <span className="text-xl font-mono tracking-[0.2em]">••••</span>
                <span className="text-xl font-mono">4292</span>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] opacity-70 uppercase tracking-tighter">Card Holder</p>
                  <p className="text-sm font-medium">MUHAMMAD HAZIQ</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] opacity-70 uppercase tracking-tighter">Expires</p>
                  <p className="text-sm font-medium">09/28</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Freeze Card</p>
              <p className="text-[10px] text-muted-foreground">Instantly lock card</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Spend Limit</p>
              <p className="text-[10px] text-muted-foreground">Adjust daily limit</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details List */}
      <section className="space-y-3">
        <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">Card Details</h3>
        <Card className="glass-card">
          <CardContent className="p-0">
            {[
              { icon: History, label: "Transaction History", value: "View All", color: "text-primary" },
              { icon: CreditCard, label: "Card Controls", value: "Locked", color: "text-emerald-500" },
            ].map((item, i) => (
              <div key={item.label} className={`p-4 flex items-center justify-between ${i === 0 ? 'border-b border-slate-200 dark:border-white/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
