"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { TrendingUp, AlertTriangle, ShieldCheck, Wallet, Calendar, Settings as SettingsIcon, QrCode, Send, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { SpendGuardModal } from "./BudgetGuardModal"
import { ResilienceModal } from "./ResilienceModal"
import Link from "next/link"
import { t } from "@/lib/translations"

export function Dashboard() {
  const { user, resilienceScore, safeDailySpend, cashflowRisk, debtRiskScore, language } = useStore()
  const [showGuardModal, setShowGuardModal] = useState(false)
  const [showResilienceModal, setShowResilienceModal] = useState(false)
  const strings = t[language]

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{strings.dashGreeting}, {user.name}</h1>
          <p className="text-muted-foreground text-sm">{strings.dashStatus}: <span className="text-primary font-medium">{resilienceScore > 70 ? strings.dashStrong : strings.dashWatch}</span></p>
        </div>
        <div className="flex items-center gap-3">

          <Link href="/settings" className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 hover:text-primary transition-colors">
            <SettingsIcon className="w-5 h-5" />
          </Link>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowResilienceModal(true)}
            className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs relative overflow-hidden group shadow-sm shadow-primary/20 hover:bg-primary/20 transition-colors"
          >
            <span className="absolute inset-0 bg-white/20 blur-sm translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
            {resilienceScore}%
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <Wallet className="w-3 h-3" /> {strings.dashBalance}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-xl font-bold">RM {user.currentBalance.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">{strings.dashNextIn} 14 {strings.dashDays}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-primary/20">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs text-primary flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> {strings.dashSafeDaily}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-xl font-bold text-primary text-glow">RM {safeDailySpend.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">{strings.dashLimitsImpulse}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: History, label: strings.actionTransaction, href: "/transactions", color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { icon: Send, label: strings.actionTransfer, href: "/transfer", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: Wallet, label: strings.actionBills, href: "#", color: "text-amber-500", bg: "bg-amber-500/10" },
          { icon: ShieldCheck, label: strings.actionShield, href: "/debt-shield", color: "text-primary", bg: "bg-primary/10" },
        ].map((action) => (
          <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-105 transition-transform`}>
              <action.icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-600">{action.label}</span>
          </Link>
        ))}
      </div>


      {/* Risk Indicators */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="p-4">
          <CardTitle className="text-sm font-medium">{strings.sectionHealthCheck}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{strings.riskCashflow}</span>
              <span className={cn(
                "font-medium",
                cashflowRisk === 'high' ? "text-rose-500" : cashflowRisk === 'medium' ? "text-amber-500" : "text-emerald-500"
              )}>
                {cashflowRisk.toUpperCase()}
              </span>
            </div>
            <Progress value={cashflowRisk === 'high' ? 85 : cashflowRisk === 'medium' ? 60 : 20} className="h-1.5" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{strings.riskDebtShield}</span>
              <span className="text-emerald-500 font-medium">HEALTHY ({debtRiskScore}/100)</span>
            </div>
            <Progress value={debtRiskScore} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold px-1">{strings.sectionInsights}</h3>
        <motion.div 
          className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-start cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowGuardModal(true)}
        >
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600">{strings.insightBrokeDate}</p>
            <p className="text-[11px] text-amber-800/80">{strings.insightBrokeDesc}</p>
          </div>
        </motion.div>

        <motion.div 
          className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex gap-3 items-start"
          whileHover={{ scale: 1.02 }}
        >
          <div className="p-2 rounded-xl bg-primary/20 text-primary">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-primary">{strings.insightSavings}</p>
            <p className="text-[11px] text-primary-800/80">{strings.insightSavingsDesc}</p>
          </div>

        </motion.div>
      </div>
      
      {/* Mini Transactions */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold">{strings.sectionRecent}</h3>
          <button className="text-[10px] text-primary uppercase font-bold tracking-wider">{strings.viewAll}</button>
        </div>
        <Card className="glass-card">
          <CardContent className="p-0">
            {useStore.getState().transactions.slice(0, 3).map((t, i) => (
              <div key={t.id} className={cn(
                "p-4 flex justify-between items-center",
                i !== 2 && "border-b border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
                    {t.category === 'Food' ? '🍱' : t.category === 'Transport' ? '🚗' : '🛍️'}
                  </div>
                  <div>
                    <p className="text-xs font-medium">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">{t.category}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-rose-500">-RM {t.amount.toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <SpendGuardModal 
        isOpen={showGuardModal} 
        onClose={() => setShowGuardModal(false)} 
      />

      <ResilienceModal
        isOpen={showResilienceModal}
        onClose={() => setShowResilienceModal(false)}
        score={resilienceScore}
      />
    </div>
  )
}

