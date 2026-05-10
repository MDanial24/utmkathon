"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
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
                        : `Daily spend limit: RM ${initialSafeDaily.toFixed(2)}`
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


      {/* Promotional Banner Carousel */}
      <PromoCarousel />

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

function PromoCarousel() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const slides = [
    {
      image: `${basePath}/assets/GX-Banner-logo.jpeg`,
      label: "Powered by",
      name: "GXBank",
      tagline: "Malaysia's Leading Digital Bank",
      badge: "Official Partner",
      gradient: "from-purple-600/90 via-fuchsia-600/80 to-pink-500/70",
      accent: "bg-purple-500",
    },
    {
      image: `${basePath}/assets/PERSAKA-logo.jpeg`,
      label: "Organized by",
      name: "UTM PERSAKA",
      tagline: "Persatuan Mahasiswa Sains Komputer",
      badge: "UTMKathon 2026",
      gradient: "from-rose-700/85 via-red-600/75 to-slate-700/80",
      accent: "bg-rose-500",
    },
    {
      image: `${basePath}/assets/runcloud-logo.jpeg`,
      label: "Sponsored by",
      name: "RunCloud",
      tagline: "Cloud Server Management Platform",
      badge: "Cloud Sponsor",
      gradient: "from-slate-800/90 via-slate-700/85 to-cyan-900/75",
      accent: "bg-cyan-500",
    },
    {
      image: `${basePath}/assets/selaDevs-logo.jpeg`,
      label: "Built by",
      name: "SELADevs",
      tagline: "GX Youth · UTMKathon 2026",
      badge: "🏆 Team",
      gradient: "from-zinc-900/95 via-emerald-950/90 to-zinc-900/95",
      accent: "bg-emerald-500",
    }
  ]

  const [index, setIndex] = useState(0)
  const [progressKey, setProgressKey] = useState(0)

  const goTo = (i: number) => {
    setIndex(i)
    setProgressKey(prev => prev + 1) // reset animation
  }

  const goNext = () => goTo((index + 1) % slides.length)
  const goPrev = () => goTo((index - 1 + slides.length) % slides.length)

  // Auto-advance timer
  useEffect(() => {
    const timer = setInterval(goNext, 5000)
    return () => clearInterval(timer)
  }, [index])

  const current = slides[index]

  return (
    <div className="space-y-2.5">
      {/* Section Label */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1 h-3.5 rounded-full bg-primary" />
          <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Our Partners</h3>
        </div>
        <span className="text-[9px] text-muted-foreground/60 font-medium tabular-nums">{index + 1}/{slides.length}</span>
      </div>

      {/* Carousel Container */}
      <div className="relative w-full h-36 overflow-hidden rounded-2xl shadow-lg border border-white/5 select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Themed gradient background */}
            <div className={cn("absolute inset-0 bg-gradient-to-br", current.gradient)} />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
            />

            {/* Content layout */}
            <div className="relative z-10 h-full flex items-center px-5 gap-5">
              {/* Logo container */}
              <div className="w-20 h-20 rounded-2xl bg-white shadow-xl shadow-black/20 flex items-center justify-center shrink-0 overflow-hidden p-2.5">
                <img
                  src={current.image}
                  alt={current.name}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-white/50">{current.label}</span>
                <h4 className="text-base font-black text-white leading-tight tracking-tight">{current.name}</h4>
                <p className="text-[10px] text-white/60 leading-relaxed font-medium truncate">{current.tagline}</p>
                <span className="inline-block mt-0.5 text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-white/80 backdrop-blur-sm border border-white/10">
                  {current.badge}
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe gesture layer */}
        <div
          className="absolute inset-0 z-20"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const onMouseUp = (upEvent: MouseEvent) => {
              const diff = startX - upEvent.clientX;
              if (diff > 40) goNext();
              if (diff < -40) goPrev();
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mouseup', onMouseUp);
          }}
          onTouchStart={(e) => {
            const startX = e.touches[0].clientX;
            const onTouchEnd = (endEvent: TouchEvent) => {
              const diff = startX - endEvent.changedTouches[0].clientX;
              if (diff > 40) goNext();
              if (diff < -40) goPrev();
              window.removeEventListener('touchend', onTouchEnd);
            };
            window.addEventListener('touchend', onTouchEnd);
          }}
        />

        {/* Auto-progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-30">
          <motion.div
            key={progressKey}
            className={cn("h-full rounded-r-full", current.accent)}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 5, ease: "linear" }}
          />
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 pt-0.5">
        {slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all duration-400",
              i === index
                ? cn("w-5 h-1.5", slide.accent, "shadow-sm")
                : "w-1.5 h-1.5 bg-foreground/10 hover:bg-foreground/20"
            )}
          />
        ))}
      </div>
    </div>
  )
}

