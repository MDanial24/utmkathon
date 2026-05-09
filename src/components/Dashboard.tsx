"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { TrendingUp, AlertTriangle, ShieldCheck, Wallet, Calendar, Settings as SettingsIcon, QrCode, Send, History, CalendarClock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { SpendGuardModal } from "./BudgetGuardModal"
import { ResilienceModal } from "./ResilienceModal"
import { TopUpModal } from "./TopUpModal"
import Link from "next/link"
import { t } from "@/lib/translations"
import { BalanceDetailDrawer } from "./BalanceDetailDrawer"

export function Dashboard() {
  const {
    user,
    resilienceScore,
    safeDailySpend,
    initialSafeDaily,
    transactions,
    cashflowRisk,
    debtRiskScore,
    language,
    processAutoSave,
    simulateGrowth,
    isSpendGuardActive
  } = useStore()
  const bills = useStore(state => state.bills)
  
  const lockedAmount = bills
    .filter(b => b.isLocked && b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);
  const spendableBalance = user.currentBalance - lockedAmount;
  const [showGuardModal, setShowGuardModal] = useState(false)
  const [showResilienceModal, setShowResilienceModal] = useState(false)
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showBalanceDrawer, setShowBalanceDrawer] = useState(false)
  const [safeDailyView, setSafeDailyView] = useState<'quota' | 'average'>('quota')
  const strings = t[language]

  // Calculate today's spending & quota remaining
  const todayStr = new Date().toDateString()
  const todayExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
    .reduce((sum, t) => sum + t.amount, 0)
  const quotaRemaining = initialSafeDaily - todayExpenses

  // Hydration guard for Next.js persisted state
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    setHasHydrated(true)
    processAutoSave()
    simulateGrowth()
    useStore.getState().updateResilienceScore()
  }, [])

  const getDaysRemaining = () => {
    if (user.incomeSource === "fixed" && user.fixedFrequency === "weekly" && user.weeklyPayDay) {
      const daysMap: Record<string, number> = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
      };
      const targetIndex = daysMap[user.weeklyPayDay.toLowerCase()] ?? 5;
      const today = new Date();
      const todayIndex = today.getDay();
      let diff = targetIndex - todayIndex;
      if (diff <= 0) {
        diff += 7;
      }
      return diff;
    }

    if (!user.nextAllowanceDate) return 14;
    const today = new Date();
    const nextDate = new Date(user.nextAllowanceDate);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 30;
  }

  const getDynamicSafeDaily = () => {
    const balance = user.currentBalance || 0
    if (balance <= 0) return 0.0

    // Fallback if onboarding properties are missing
    if (!user.incomeSource) return safeDailySpend > 0 ? safeDailySpend : 15.0

    const totalCommitments = user.totalCommitments || 0
    let calculatedDaily = 15.0

    if (user.incomeSource === "fixed") {
      const daysLeft = getDaysRemaining()
      
      if (user.fixedFrequency === "weekly") {
        // Divide monthly commitments to 4 weeks (simplified weekly commitment)
        const weeklyCommitment = totalCommitments / 4
        const remainingBalance = Math.max(0, balance - weeklyCommitment)
        calculatedDaily = daysLeft > 0 ? remainingBalance / daysLeft : remainingBalance
      } else {
        // Monthly plan: deduct full monthly commitments from the remaining month balance
        const remainingBalance = Math.max(0, balance - totalCommitments)
        calculatedDaily = daysLeft > 0 ? remainingBalance / daysLeft : remainingBalance
      }
    } else if (user.incomeSource === "lump-sum") {
      const start = user.lumpStartDate ? new Date(user.lumpStartDate) : (user.setupDate ? new Date(user.setupDate) : new Date())
      const duration = user.durationDays || 30
      const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000)
      
      const today = new Date()
      const diffTime = end.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const remainingDays = diffDays > 0 ? diffDays : duration
      
      // Calculate commitments for the remaining period
      const remainingMonths = remainingDays / 30
      const commitmentsForRemainingPeriod = totalCommitments * remainingMonths
      const remainingBalance = Math.max(0, balance - commitmentsForRemainingPeriod)
      
      calculatedDaily = remainingBalance / remainingDays
    } else {
      // irregular / none
      const start = user.setupDate ? new Date(user.setupDate) : new Date()
      const duration = user.durationDays || 30
      const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000)
      
      const today = new Date()
      const diffTime = end.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const remainingDays = diffDays > 0 ? diffDays : duration
      
      // Calculate commitments for the remaining period
      const remainingMonths = remainingDays / 30
      const commitmentsForRemainingPeriod = totalCommitments * remainingMonths
      const remainingBalance = Math.max(0, balance - commitmentsForRemainingPeriod)
      
      calculatedDaily = remainingBalance / remainingDays
    }

    const flooredDaily = Math.floor(calculatedDaily * 100) / 100
    return flooredDaily > 0 ? flooredDaily : 15.0
  }

  // Synchronize store's safeDailySpend with getDynamicSafeDaily() calculation
  const dynamicSafe = getDynamicSafeDaily()
  useEffect(() => {
    if (hasHydrated && dynamicSafe !== safeDailySpend) {
      useStore.setState({ safeDailySpend: dynamicSafe })
    }
  }, [hasHydrated, dynamicSafe, safeDailySpend])

  const getPlanName = () => {
    if (!user.incomeSource) return "Monthly Plan"

    if (user.incomeSource === "fixed") {
      if (user.fixedFrequency === "weekly") {
        return "Weekly Plan"
      } else {
        return "Monthly Plan"
      }
    } else if (user.incomeSource === "lump-sum") {
      const dur = user.lumpDuration || 6
      const unit = user.lumpDurationUnit || "month"
      const capitalizedUnit = unit.charAt(0).toUpperCase() + unit.slice(1)
      const pluralSuffix = dur > 1 ? "s" : ""
      return `${dur} ${capitalizedUnit}${pluralSuffix} Plan`
    } else {
      // irregular / none
      const dur = user.runwayDuration || 3
      const unit = user.runwayDurationUnit || "month"
      const capitalizedUnit = unit.charAt(0).toUpperCase() + unit.slice(1)
      const pluralSuffix = dur > 1 ? "s" : ""
      return `${dur} ${capitalizedUnit}${pluralSuffix} Plan`
    }
  }

  if (!hasHydrated) return null;


  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{strings.dashGreeting}, {user.name}</h1>
          <p className="text-muted-foreground text-sm font-medium text-primary/80">{getPlanName()}</p>
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
          onClick={() => setShowBalanceDrawer(true)}
          className="cursor-pointer"
        >
          <Card className="glass-card hover:ring-primary/30 transition-all active:scale-[0.98]">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs text-muted-foreground flex items-center gap-2">
                <Wallet className="w-3 h-3" /> {strings.dashBalance}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-xl font-bold">RM {user.currentBalance.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">{strings.dashNextIn} {getDaysRemaining()} {strings.dashDays}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className={cn(
              "glass-card border-primary/20 transition-all duration-300 cursor-pointer select-none relative overflow-hidden h-full flex flex-col justify-between",
              safeDailyView === 'quota' && quotaRemaining < 0 && "border-rose-500/30 bg-rose-500/5 shadow-lg shadow-rose-500/5"
            )}
            onClick={() => setSafeDailyView(safeDailyView === 'quota' ? 'average' : 'quota')}
          >
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between space-y-0">
              <CardTitle className={cn(
                "text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors",
                safeDailyView === 'quota' && quotaRemaining < 0 ? "text-rose-400" : "text-primary"
              )}>
                <ShieldCheck className="w-3.5 h-3.5" /> {safeDailyView === 'quota' ? "Today's Quota" : "Safe Daily"}
              </CardTitle>
              {/* Segment Pill indicator */}
              <div className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-full bg-foreground/5 text-muted-foreground/80 border border-border">
                {safeDailyView === 'quota' ? "Quota" : "Average"}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-3 flex-1 flex flex-col justify-center">
              <div>
                {safeDailyView === 'quota' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-xl font-black text-glow tracking-tight leading-none",
                        quotaRemaining < 0 ? "text-rose-500" : "text-emerald-400"
                      )}>
                        {quotaRemaining < 0 ? "-" : ""}RM {Math.abs(quotaRemaining).toFixed(2)}
                      </p>
                      <RefreshCw className={cn(
                        "w-4 h-4 shrink-0 opacity-40 hover:opacity-100 transition-opacity",
                        quotaRemaining < 0 ? "text-rose-400" : "text-emerald-400"
                      )} />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                      {quotaRemaining < 0 
                        ? `Overspent by RM ${Math.abs(quotaRemaining).toFixed(2)} today!`
                        : `RM ${quotaRemaining.toFixed(2)} left of your RM ${initialSafeDaily.toFixed(2)} limit`
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black text-primary text-glow tracking-tight leading-none">
                        RM {safeDailySpend.toFixed(2)}
                      </p>
                      <RefreshCw className="w-4 h-4 shrink-0 text-primary opacity-40 hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1.5 leading-relaxed font-medium">
                      {strings.dashLimitsImpulse}
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      

      {/* Quick Actions */}
      <div className="grid grid-cols-5 gap-1">
        {[
          { icon: History, label: strings.actionTransaction, href: "/transactions", color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { icon: Send, label: strings.actionTransfer, href: "/transfer", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: CalendarClock, label: strings.navCards, href: "/bills", color: "text-purple-500", bg: "bg-purple-500/10", isBills: true },
          { icon: Wallet, label: strings.actionTopUp, href: "#", color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { icon: ShieldCheck, label: strings.actionShield, href: "/debt-shield", color: "text-primary", bg: "bg-primary/10" },
        ].map((action) => {
          const isTopUp = action.label === strings.actionTopUp;
          const label = action.isBills ? strings.billsHeader.split(' ')[0] : action.label;
          const content = (
            <div className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-105 transition-transform`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 truncate w-full text-center">{label}</span>
            </div>
          );

          if (isTopUp) {
            return (
              <button key={action.label} onClick={() => setShowTopUpModal(true)} className="focus:outline-none flex flex-col items-center gap-2">
                {content}
              </button>
            );
          }

          return (
            <Link key={action.label} href={action.href}>
              {content}
            </Link>
          );
        })}
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

        {lockedAmount > 0 && (
          <motion.div 
            className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex gap-3 items-start cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => window.location.href = '/bills'}
          >
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-500">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-purple-600">
                {strings.billsProtected}: RM {lockedAmount.toFixed(2)}
              </p>
              <p className="text-[11px] text-purple-800/80">
                RM {spendableBalance.toFixed(2)} {strings.billsSafe}
              </p>
            </div>
          </motion.div>
        )}
        {isSpendGuardActive ? (
          <motion.div
            className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 items-start cursor-pointer"
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowGuardModal(true)}
          >
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-600">
                {language === 'ms' ? 'Pengawal Bajet Aktif' : 'Spend Guard Active'}
              </p>
              <p className="text-[11px] text-emerald-800/80">
                {language === 'ms'
                  ? 'Kewangan anda dilindungi. Had harian dikurangkan untuk mengelakkan risiko.'
                  : 'Your finances are protected. Daily spending limit reduced to avoid cashflow risk.'}
              </p>
            </div>
          </motion.div>
        ) : (
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
        )}

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
          <Link href="/transactions">
            <button className="text-[10px] text-primary uppercase font-bold tracking-wider hover:opacity-70 transition-opacity">{strings.viewAll}</button>
          </Link>
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

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
      />

      <BalanceDetailDrawer
        open={showBalanceDrawer}
        onClose={() => setShowBalanceDrawer(false)}
      />
    </div>
  )
}

