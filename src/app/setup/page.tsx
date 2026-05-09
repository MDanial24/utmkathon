"use client"

import { useStore } from "@/store/useStore"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  User,
  PiggyBank,
  Calendar,
  CreditCard,
  Target,
  ChevronRight,
  ChevronLeft,
  Sun,
  Shield,
  Laptop,
  Home,
  Plane,
  TrendingUp,
  Coins,
  Layers,
  Briefcase,
  Wallet,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SetupPage() {
  const router = useRouter()

  // Setup steps: 1 to 5
  // Step 1: Tell GX Youth about you (Name, Employment)
  // Step 2: The Router Page (Income Source)
  // Step 3: The Dynamic Combination Page
  // Step 4: Fixed commitments
  // Step 5: Savings Goal
  const [step, setStep] = useState(1)

  // Helper to get 1st day of next month
  const getFirstDayOfNextMonth = () => {
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const yyyy = nextMonth.getFullYear()
    const mm = String(nextMonth.getMonth() + 1).padStart(2, '0')
    const dd = '01'
    return `${yyyy}-${mm}-${dd}`
  }

  // Form State
  const [name, setName] = useState("") // Empty by default
  const [employmentStatus, setEmploymentStatus] = useState<"Student" | "Employed" | "Unemployed">("Student")

  // Step 2: Income Source selection ("fixed" | "lump-sum" | "irregular" | "none")
  const [incomeSource, setIncomeSource] = useState<"fixed" | "lump-sum" | "irregular" | "none">("fixed")

  // Step 3: Scenario A - Fixed/Recurring State
  const [fixedAmount, setFixedAmount] = useState(800)
  const [fixedFrequency, setFixedFrequency] = useState<"monthly" | "weekly">("monthly")
  const [fixedNextDate, setFixedNextDate] = useState(getFirstDayOfNextMonth())
  const [weeklyPayDay, setWeeklyPayDay] = useState("Friday")

  // Step 3: Scenario B - Lump Sum State
  const [lumpAmount, setLumpAmount] = useState(5000)
  const [lumpDuration, setLumpDuration] = useState(6)
  const [lumpDurationUnit, setLumpDurationUnit] = useState<"week" | "month" | "year">("month")
  const [lumpStartDate, setLumpStartDate] = useState(() => {
    const now = new Date()
    const yyyy = now.getFullYear()
    const mm = String(now.getMonth() + 1).padStart(2, '0')
    const dd = String(now.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })

  // Step 3: Scenario C - Irregular or None/Savings State
  const [savingsAmount, setSavingsAmount] = useState(1200)
  const [runwayDuration, setRunwayDuration] = useState(3)
  const [runwayDurationUnit, setRunwayDurationUnit] = useState<"week" | "month" | "year">("month")

  // Commitments State
  const [rent, setRent] = useState(0)
  const [phoneBill, setPhoneBill] = useState(0)
  const [transport, setTransport] = useState(0)
  const [ptptn, setPtptn] = useState(0)
  const [subscriptions, setSubscriptions] = useState(0)

  // Savings Goal State
  const [selectedGoal, setSelectedGoal] = useState("Emergency Fund")

  // Dynamic Insight Calculation helpers
  const getLumpSumMonthlyAverage = () => {
    let factor = 1
    if (lumpDurationUnit === "week") {
      factor = 4.33 // weeks in month
    } else if (lumpDurationUnit === "year") {
      factor = 1 / 12 // year to month multiplier
    }
    const totalMonths = lumpDurationUnit === "month" ? lumpDuration : (lumpDuration / factor)
    if (totalMonths <= 0) return 0
    return Math.round(lumpAmount / totalMonths)
  }

  const handleNext = () => {
    // Validation on step 1: Name must be entered
    if (step === 1 && !name.trim()) {
      alert("Please enter your name to proceed.")
      return
    }

    if (step < 5) {
      setStep(prev => prev + 1)
    } else {
      // Step 5: Save to Zustand store & redirect to dashboard
      // Determine logical next allowance/payday reset date
      const getUpcomingDayDate = (dayName: string) => {
        const daysMap: Record<string, number> = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
        };
        const targetIndex = daysMap[dayName.toLowerCase()] ?? 5;
        const today = new Date();
        const todayIndex = today.getDay();
        let diff = targetIndex - todayIndex;
        if (diff <= 0) {
          diff += 7;
        }
        const targetDate = new Date(today.getTime() + diff * 24 * 60 * 60 * 1000);
        const yyyy = targetDate.getFullYear();
        const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
        const dd = String(targetDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      let finalResetDate = getFirstDayOfNextMonth();
      if (incomeSource === "fixed") {
        if (fixedFrequency === "weekly") {
          finalResetDate = getUpcomingDayDate(weeklyPayDay);
        } else {
          finalResetDate = fixedNextDate;
        }
      } else if (incomeSource === "lump-sum") {
        finalResetDate = lumpStartDate;
      }

      // Calculate commitments
      const totalCommitments = rent + phoneBill + transport + ptptn + subscriptions

      // Calculate Logical Allowance and Period Duration in Days
      let totalAmount = 800
      let durationDays = 30

      if (incomeSource === "fixed") {
        totalAmount = fixedFrequency === "weekly" ? fixedAmount * 4.33 : fixedAmount
        durationDays = fixedFrequency === "weekly" ? 7 : 30
      } else if (incomeSource === "lump-sum") {
        totalAmount = lumpAmount
        if (lumpDurationUnit === "week") {
          durationDays = lumpDuration * 7
        } else if (lumpDurationUnit === "month") {
          durationDays = lumpDuration * 30
        } else if (lumpDurationUnit === "year") {
          durationDays = lumpDuration * 365
        }
      } else { // Irregular or None
        totalAmount = savingsAmount
        if (runwayDurationUnit === "week") {
          durationDays = runwayDuration * 7
        } else if (runwayDurationUnit === "month") {
          durationDays = runwayDuration * 30
        } else if (runwayDurationUnit === "year") {
          durationDays = runwayDuration * 365
        }
      }

      // Calculate dynamic daily safe budget limit based on:
      // (Allowance Amount - Commitments for the relative period) / Period Duration
      const periodMonths = durationDays / 30
      const totalCommitmentsForPeriod = totalCommitments * periodMonths
      const netFunds = Math.max(0, totalAmount - totalCommitmentsForPeriod)
      const calculatedDailySafe = Number((netFunds / durationDays).toFixed(2))

      // Determine the starting balance dynamically to reflect setup details on the dashboard
      let startBalance = 800
      if (incomeSource === "fixed") {
        startBalance = fixedAmount
      } else if (incomeSource === "lump-sum") {
        startBalance = lumpAmount
      } else {
        startBalance = savingsAmount
      }

      // Create initial bills from onboarding commitments
      const initialBills = [
        { id: 'b1', name: 'Rent / Hostel', amount: rent, category: 'Housing', icon: '🏠' },
        { id: 'b2', name: 'Phone Bill', amount: phoneBill, category: 'Utilities', icon: '📱' },
        { id: 'b3', name: 'Transport', amount: transport, category: 'Transport', icon: '🚗' },
        { id: 'b4', name: 'PTPTN', amount: ptptn, category: 'Education', icon: '🎓' },
        { id: 'b5', name: 'Subscriptions', amount: subscriptions, category: 'Entertainment', icon: '📺' },
      ].filter(b => b.amount > 0).map(b => ({
        ...b,
        frequency: 'monthly' as const,
        dueDay: 5, // Default to 5th of month
        nextDueDate: getFirstDayOfNextMonth(),
        isLocked: true,
        autopayEnabled: false,
        autopaySafety: 'balanced' as const,
        reminderDaysBefore: 3,
        status: 'upcoming' as const,
        source: 'onboarding' as const,
        createdAt: new Date().toISOString()
      }));

      // Update Zustand store fields cleanly
      useStore.setState((state) => ({
        user: {
          ...state.user,
          name: name,
          type: employmentStatus,
          monthlyAllowance: Math.round(incomeSource === "fixed" ? totalAmount : (totalAmount / periodMonths)),
          currentBalance: startBalance,
          nextAllowanceDate: new Date(finalResetDate).toISOString(),
          incomeSource: incomeSource,
          fixedFrequency: fixedFrequency,
          setupDate: new Date().toISOString(),
          durationDays: durationDays,
          lumpStartDate: lumpStartDate,
          weeklyPayDay: weeklyPayDay,
          lumpDuration: lumpDuration,
          lumpDurationUnit: lumpDurationUnit,
          runwayDuration: runwayDuration,
          runwayDurationUnit: runwayDurationUnit,
          totalCommitments: totalCommitments,
        },
        bills: initialBills as any[],
        safeDailySpend: calculatedDailySafe > 0 ? calculatedDailySafe : 15.0,
      }))

      router.push("/dashboard")
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(prev => prev - 1)
    } else {
      router.push("/")
    }
  }

  // Calculate Progress Percentage
  const progressPercent = step * 20

  return (
    <div className="min-h-screen bg-slate-50/50 text-foreground flex flex-col items-center justify-between p-6 sm:p-8 overflow-hidden relative font-sans">

      {/* Dynamic blurred glow background effects */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] bg-purple-200/40 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-pink-100/30 blur-[120px] rounded-full" />
      </div>

      {/* Top Header Row */}
      <header className="w-full max-w-sm sm:max-w-md z-10 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-extrabold tracking-widest text-[rgb(147,51,234)] uppercase">
            GX Youth Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1 leading-tight">
            Build your money cockpit
          </h1>
          <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1">
            This prototype uses simulated data and localStorage only.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="w-10 h-10 rounded-full border border-slate-100 bg-white/80 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 self-start animate-pulse"
        >
          <Sun className="w-4 h-4 text-purple-400" />
        </Button>
      </header>

      {/* Progress Bar Container */}
      <div className="w-full max-w-sm sm:max-w-md z-10 mt-6">
        <div className="w-full h-2 bg-purple-100/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="h-full bg-gradient-to-r from-[rgb(168,85,247)] to-[rgb(147,51,234)] rounded-full shadow-inner"
          />
        </div>
      </div>

      {/* Main Form Content Card */}
      <main className="w-full max-w-sm sm:max-w-md z-10 my-8 flex-1 flex flex-col justify-center">
        <div className="w-full bg-white/95 border border-slate-100 shadow-xl shadow-slate-100/50 rounded-[2.5rem] p-6 sm:p-8 min-h-[380px] flex flex-col justify-between backdrop-blur-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >

              {/* Step 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[rgb(147,51,234)]">
                      <User className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">Tell GX Youth about you</h2>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-12 px-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[rgb(147,51,234)] focus:ring-1 focus:ring-[rgb(147,51,234)] outline-none font-bold text-slate-800 transition-all text-sm"
                      placeholder="Enter your name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employment Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Student", "Employed", "Unemployed"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setEmploymentStatus(status)}
                          className={`h-11 rounded-2xl text-xs font-extrabold transition-all border ${employmentStatus === status
                              ? "bg-purple-50/80 border-[rgb(147,51,234)] text-[rgb(147,51,234)] shadow-sm"
                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: The Router Page (Income Source) */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[rgb(147,51,234)]">
                      <Coins className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">How do you receive your money?</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {[
                      {
                        id: "fixed",
                        title: "Fixed / Recurring",
                        desc: "e.g., Monthly allowance, salary, or scholarship",
                        icon: Layers
                      },
                      {
                        id: "lump-sum",
                        title: "Lump Sum",
                        desc: "e.g., A one-time payment meant to last a specific period",
                        icon: Coins
                      },
                      {
                        id: "irregular",
                        title: "Irregular",
                        desc: "e.g., Freelance, part-time, or 'as needed'",
                        icon: Briefcase
                      },
                      {
                        id: "none",
                        title: "None / Savings",
                        desc: "e.g., Currently living off existing savings",
                        icon: Wallet
                      }
                    ].map((source) => {
                      const IconComp = source.icon
                      const isSelected = incomeSource === source.id

                      return (
                        <button
                          key={source.id}
                          type="button"
                          onClick={() => setIncomeSource(source.id as any)}
                          className={`p-3.5 rounded-2xl flex items-start gap-3.5 border text-left transition-all ${isSelected
                              ? "bg-purple-50/80 border-[rgb(147,51,234)] text-[rgb(147,51,234)] shadow-sm"
                              : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                            }`}
                        >
                          <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-purple-100 text-[rgb(147,51,234)]" : "bg-slate-100 text-slate-500"
                            }`}>
                            <IconComp className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-xs font-black text-slate-900 block leading-snug">{source.title}</span>
                            <span className="text-[10px] font-medium text-slate-450 block leading-normal">{source.desc}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Dynamic Combination Page */}
              {step === 3 && (
                <div className="space-y-4">

                  {/* Scenario A: Fixed / Recurring details */}
                  {incomeSource === "fixed" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[rgb(147,51,234)]">
                          <Layers className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-900">Recurring Income Details</h2>
                      </div>

                      {/* Input 1: Amount */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">RM</span>
                          <input
                            type="number"
                            value={fixedAmount}
                            onChange={(e) => setFixedAmount(Number(e.target.value))}
                            className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 transition-all text-sm animate-fade-in"
                          />
                        </div>
                      </div>

                      {/* Input 2: Frequency Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Frequency</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(["monthly", "weekly"] as const).map((freq) => (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setFixedFrequency(freq)}
                              className={`h-9 rounded-xl text-xs font-bold border transition-all ${fixedFrequency === freq
                                  ? "bg-purple-50 border-[rgb(147,51,234)] text-[rgb(147,51,234)] shadow-sm"
                                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                }`}
                            >
                              {freq === "monthly" ? "Monthly" : "Weekly"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Input 3: Next Allowance Date / Pay Day Selector */}
                      <div className="space-y-1.5 animate-fade-in">
                        {fixedFrequency === "weekly" ? (
                          <>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pay Day</label>
                            <div className="relative">
                              <select
                                value={weeklyPayDay}
                                onChange={(e) => setWeeklyPayDay(e.target.value)}
                                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 text-sm appearance-none cursor-pointer"
                              >
                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                                  <option key={day} value={day}>{day}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                </svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Allowance/Payday Date</label>
                            <input
                              type="date"
                              value={fixedNextDate}
                              onChange={(e) => setFixedNextDate(e.target.value)}
                              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 text-sm"
                            />
                          </>
                        )}
                      </div>

                      {/* Insight Note */}
                      <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex gap-2.5 items-start">
                        <Info className="w-4 h-4 text-[rgb(147,51,234)] mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                          {fixedFrequency === "weekly" 
                            ? `We'll automatically reset your budget every week on ${weeklyPayDay}.`
                            : "We'll automatically reset your budget on the 1st of every month."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Scenario B: Lump Sum details */}
                  {incomeSource === "lump-sum" && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[rgb(147,51,234)]">
                          <Coins className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-900">Lump Sum Details</h2>
                      </div>

                      {/* Input 1: Total Amount */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">RM</span>
                          <input
                            type="number"
                            value={lumpAmount}
                            onChange={(e) => setLumpAmount(Number(e.target.value))}
                            className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Input 2: Dynamic Two-Box Duration Selector */}
                      <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">How long should this last?</label>
                        <div className="flex items-center justify-center gap-2.5">
                          <input
                            type="number"
                            value={lumpDuration}
                            onChange={(e) => setLumpDuration(Math.max(1, Number(e.target.value)))}
                            className="w-18 h-10 px-2 rounded-xl bg-white border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 text-sm text-center shadow-sm"
                            min="1"
                          />

                          <div className="relative">
                            <select
                              value={lumpDurationUnit}
                              onChange={(e) => setLumpDurationUnit(e.target.value as any)}
                              className="h-10 pl-4 pr-9 rounded-xl bg-white border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-700 text-xs appearance-none cursor-pointer shadow-sm text-center"
                            >
                              <option value="week">week{lumpDuration > 1 ? "s" : ""}</option>
                              <option value="month">month{lumpDuration > 1 ? "s" : ""}</option>
                              <option value="year">year{lumpDuration > 1 ? "s" : ""}</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Input 3: Start Date */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
                        <input
                          type="date"
                          value={lumpStartDate}
                          onChange={(e) => setLumpStartDate(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 text-sm"
                        />
                      </div>

                      {/* Dynamic Lump Sum Insight */}
                      <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex gap-2.5 items-start">
                        <Info className="w-4 h-4 text-[rgb(147,51,234)] mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                          This averages out to <span className="font-extrabold text-[rgb(147,51,234)]">RM {getLumpSumMonthlyAverage()}/month</span>.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Scenario C: Irregular or None / Savings details */}
                  {(incomeSource === "irregular" || incomeSource === "none") && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[rgb(147,51,234)]">
                          {incomeSource === "irregular" ? <Briefcase className="w-5 h-5" /> : <Wallet className="w-5 h-5" />}
                        </div>
                        <h2 className="text-lg font-extrabold text-slate-900">
                          {incomeSource === "irregular" ? "Savings & Irregular Funds" : "Current Savings Balance"}
                        </h2>
                      </div>

                      {/* Input 1: Total Money You Have Now */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total money you have now</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-sm">RM</span>
                          <input
                            type="number"
                            value={savingsAmount}
                            onChange={(e) => setSavingsAmount(Number(e.target.value))}
                            className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Input 2: Target Duration */}
                      <div className="space-y-1.5 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center font-bold">Target duration to last</label>
                        <div className="flex items-center justify-center gap-2.5">
                          <input
                            type="number"
                            value={runwayDuration}
                            onChange={(e) => setRunwayDuration(Math.max(1, Number(e.target.value)))}
                            className="w-18 h-10 px-2 rounded-xl bg-white border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-800 text-sm text-center shadow-sm"
                            min="1"
                          />

                          <div className="relative">
                            <select
                              value={runwayDurationUnit}
                              onChange={(e) => setRunwayDurationUnit(e.target.value as any)}
                              className="h-10 pl-4 pr-9 rounded-xl bg-white border border-slate-200 focus:border-[rgb(147,51,234)] outline-none font-bold text-slate-700 text-xs appearance-none cursor-pointer shadow-sm text-center"
                            >
                              <option value="week">week{runwayDuration > 1 ? "s" : ""}</option>
                              <option value="month">month{runwayDuration > 1 ? "s" : ""}</option>
                              <option value="year">year{runwayDuration > 1 ? "s" : ""}</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Insight Note */}
                      <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex gap-2.5 items-start">
                        <Info className="w-4 h-4 text-[rgb(147,51,234)] mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                          We'll track your 'runway' to make sure you don't run out.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Step 4: Fixed Commitments (Optimized and more Compact) */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-[rgb(147,51,234)]">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-extrabold text-slate-900">Fixed commitments</h2>
                        <p className="text-[11px] text-fuchsia-600 italic font-bold">per month commitment</p>
                      </div>
                    </div>
                  </div>

                  {/* Ultra compact list representation */}
                  <div className="space-y-2 border border-slate-100 rounded-2xl p-3 bg-slate-50/30">

                    {/* Rent */}
                    <div className="flex justify-between items-center h-8">
                      <span className="text-xs font-bold text-slate-600">Rent</span>
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">RM</span>
                        <input
                          type="number"
                          value={rent}
                          onChange={(e) => setRent(Number(e.target.value))}
                          className="w-full h-8 pl-8 pr-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-bold text-slate-850 text-right"
                        />
                      </div>
                    </div>

                    {/* Phone bill */}
                    <div className="flex justify-between items-center h-8">
                      <span className="text-xs font-bold text-slate-600">Phone bill</span>
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">RM</span>
                        <input
                          type="number"
                          value={phoneBill}
                          onChange={(e) => setPhoneBill(Number(e.target.value))}
                          className="w-full h-8 pl-8 pr-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-bold text-slate-850 text-right"
                        />
                      </div>
                    </div>

                    {/* Transport */}
                    <div className="flex justify-between items-center h-8">
                      <span className="text-xs font-bold text-slate-600">Transport</span>
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">RM</span>
                        <input
                          type="number"
                          value={transport}
                          onChange={(e) => setTransport(Number(e.target.value))}
                          className="w-full h-8 pl-8 pr-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-bold text-slate-850 text-right"
                        />
                      </div>
                    </div>

                    {/* PTPTN */}
                    <div className="flex justify-between items-center h-8">
                      <span className="text-xs font-bold text-slate-600 font-mono">PTPTN</span>
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">RM</span>
                        <input
                          type="number"
                          value={ptptn}
                          onChange={(e) => setPtptn(Number(e.target.value))}
                          className="w-full h-8 pl-8 pr-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-bold text-slate-850 text-right"
                        />
                      </div>
                    </div>

                    {/* Subscriptions */}
                    <div className="flex justify-between items-center h-8">
                      <span className="text-xs font-bold text-slate-600">Subscriptions</span>
                      <div className="relative w-24">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">RM</span>
                        <input
                          type="number"
                          value={subscriptions}
                          onChange={(e) => setSubscriptions(Number(e.target.value))}
                          className="w-full h-8 pl-8 pr-2 rounded-lg bg-white border border-slate-200 outline-none text-xs font-bold text-slate-850 text-right"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Step 5: Main Savings Goal (Align Option Naming Side-by-Side with Logo) */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-[rgb(147,51,234)]">
                      <Target className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-900">Main savings goal</h2>
                  </div>

                  {/* Grid showing logos side-by-side with naming option */}
                  <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {[
                      { name: "Emergency Fund", icon: Shield },
                      { name: "Laptop Fund", icon: Laptop },
                      { name: "Rent Buffer", icon: Home },
                      { name: "Travel", icon: Plane },
                      { name: "Investment Starter", icon: TrendingUp },
                    ].map((goal) => {
                      const IconComponent = goal.icon
                      const isSelected = selectedGoal === goal.name

                      return (
                        <button
                          key={goal.name}
                          type="button"
                          onClick={() => setSelectedGoal(goal.name)}
                          className={`p-3 rounded-2xl flex flex-row items-center gap-2.5 border text-left transition-all ${isSelected
                            ? "bg-purple-50/80 border-[rgb(147,51,234)] text-[rgb(147,51,234)] shadow-sm"
                            : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-purple-100 text-[rgb(147,51,234)]" : "bg-slate-100 text-slate-500"
                            }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-extrabold leading-tight text-slate-800">{goal.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Setup Action Buttons */}
          <div className="flex gap-4 pt-6 mt-6 border-t border-slate-100/80">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-500 font-extrabold text-sm flex items-center justify-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 h-12 rounded-2xl bg-[rgb(147,51,234)] hover:bg-[rgb(126,34,206)] text-white font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/15"
            >
              {step === 5 ? "Get Started" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Footer Branding Mockup Accent */}
      <footer className="w-full max-w-sm sm:max-w-md z-10 flex justify-between items-center opacity-60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md">
            <span className="text-xs font-black italic">GX</span>
          </div>
          <span className="text-[10px] font-extrabold text-slate-400">GX Youth Ecosystem</span>
        </div>
        <div className="w-16 h-1 bg-slate-200 rounded-full" />
      </footer>

    </div>
  )
}
