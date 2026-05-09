import { create } from 'zustand';
import { useState, useEffect } from 'react';
import { Language } from '@/lib/translations';
import { calculateNextDueDate, isBillDue, isAutoPaySafe } from '@/lib/billEngine';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
  confidence?: number;
}

export interface SavingsPocket {
  id: string;
  name: string;
  target: number;
  current: number;
  icon: string;
  mode: 'savings' | 'growth';
  riskLevel?: 'low' | 'medium' | 'high';
  isMainGoal?: boolean;
}

export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'analyzing' | 'alert' | 'action';
  latestFinding: string;
  confidence: number;
  recommendedAction: string;
  tools: string[];
}

export type BillFrequency = "one-time" | "weekly" | "monthly" | "yearly";

export type BillStatus =
  | "upcoming"
  | "paid"
  | "missed"
  | "paused"
  | "needs_setup"
  | "low_balance";

export type AutoPaySafety = "strict" | "balanced" | "flexible";

export interface BillPaymentRecord {
  id: string;
  billId: string;
  amount: number;
  paidAt: string;
  method: "manual" | "autopay";
  status: "paid" | "failed";
  transactionId?: string;
}

export interface Bill {
  id: string;
  name: string;
  category: string;
  provider?: string;
  accountNumber?: string;
  referenceNumber?: string;
  amount: number;
  dueDay?: number;
  dueDate?: string;
  nextDueDate: string;
  frequency: BillFrequency;
  isLocked: boolean;
  autopayEnabled: boolean;
  autopaySafety: AutoPaySafety;
  reminderDaysBefore: number;
  status: BillStatus;
  lastPaidAt?: string;
  paymentHistory?: BillPaymentRecord[];
  source: "onboarding" | "manual" | "detected";
  createdAt: string;
  updatedAt?: string;
}

interface ResilienceState {
  language: Language;
  user: {
    name: string;
    type: string;
    monthlyAllowance: number;
    currentBalance: number;
    nextAllowanceDate: string;
    emergencyFundGoal: number;
    currentEmergencyFund: number;
    spendingPersonality: string;
    incomeSource?: string;
    fixedFrequency?: string;
    setupDate?: string;
    durationDays?: number;
    lumpStartDate?: string;
    weeklyPayDay?: string;
    lumpDuration?: number;
    lumpDurationUnit?: string;
    runwayDuration?: number;
    runwayDurationUnit?: string;
    totalCommitments?: number;
  };
  transactions: Transaction[];
  savingsPockets: SavingsPocket[];
  agents: Agent[];
  resilienceScore: number;
  resilienceCashflowScore: number;
  resilienceSavingsScore: number;
  resilienceDebtScore: number;
  debtRiskScore: number;
  cashflowRisk: 'low' | 'medium' | 'high';
  safeDailySpend: number;
  initialSafeDaily: number;
  isSpendGuardActive: boolean;
  isSurvivalModeActive: boolean;
  isAutoSaveActive: boolean;
  autoSaveTargetIds: string[];
  autoSaveFrequency: 'daily' | 'weekly' | 'monthly';
  autoSaveAmount: number;
  lastAutoSaveDate: string | null;
  pet: {
    message: string;
  };
  lastGrowthSimulationDate: string | null;
  isRoundUpActive: boolean;
  bills: Bill[];
  pendingMainGoal: string | null;
  hasNotificationSave: boolean;
  // Actions
  addTransaction: (t: Transaction, skipRoundUp?: boolean) => void;
  addSavingsPocket: (p: SavingsPocket) => void;
  updateSavingsPocket: (id: string, updates: Partial<SavingsPocket>) => void;
  deleteSavingsPocket: (id: string) => void;
  addFundsToPocket: (id: string, amount: number) => void;
  toggleSpendGuard: () => void;
  toggleSurvivalMode: () => void;
  toggleAutoSave: () => void;
  toggleRoundUp: () => void;
  setAutoSaveTargetIds: (ids: string[]) => void;
  processAutoSave: () => void;
  processRoundUp: (amount: number) => void;
  simulateGrowth: () => void;
  updateResilienceScore: () => void;
  setLanguage: (lang: Language) => void;
  
  // Bills Actions
  addBill: (b: Bill) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  toggleBillLock: (id: string) => void;
  toggleBillAutopay: (id: string) => void;
  payBillNow: (id: string) => void;
  processAutoPay: () => void;
}

const RISK_RETURNS = {
  low: 0.035, // 3.5% p.a.
  medium: 0.042, // 4.2% p.a.
  high: 0.065, // 6.5% p.a.
};

const initialStoreState = {
  language: 'en' as Language,
  user: {
    name: 'Aiman',
    type: 'Student',
    monthlyAllowance: 800,
    currentBalance: 420,
    nextAllowanceDate: "2026-05-23T05:00:00.000Z",
    emergencyFundGoal: 500,
    currentEmergencyFund: 85,
    spendingPersonality: 'Food Overspender + Impulse Buyer',
  },
  transactions: [
    { id: '1', title: 'GrabFood', amount: 25.5, category: 'Food', date: "2026-05-09T05:00:00.000Z", type: 'expense' as const, confidence: 0.98 },
    { id: '2', title: 'RapidKL', amount: 4.5, category: 'Transport', date: "2026-05-09T05:00:00.000Z", type: 'expense' as const, confidence: 0.99 },
    { id: '3', title: 'Shopee - Shirt', amount: 45.0, category: 'Shopping', date: "2026-05-09T05:00:00.000Z", type: 'expense' as const, confidence: 0.95 },
    { id: '4', title: 'Netflix', amount: 35.0, category: 'Subscription', date: "2026-05-09T05:00:00.000Z", type: 'expense' as const, confidence: 1.0 },
    { id: '5', title: 'Campus Cafe', amount: 8.0, category: 'Food', date: "2026-05-09T05:00:00.000Z", type: 'expense' as const, confidence: 0.97 },
  ],
  savingsPockets: [
    { id: '1', name: 'Emergency Fund', target: 500, current: 85, icon: '🛡️', mode: 'savings' as const },
    { id: '2', name: 'Laptop Fund', target: 2500, current: 120, icon: '💻', mode: 'growth' as const, riskLevel: 'medium' as const },
    { id: '3', name: 'Rent Buffer', target: 400, current: 50, icon: '🏠', mode: 'savings' as const },
  ],
  agents: [
    { id: 'orch', name: 'Orchestrator Agent', status: 'idle' as const, latestFinding: 'System nominal. Monitoring cashflow.', confidence: 0.99, recommendedAction: 'No action needed', tools: ['monitor_all', 'dispatch'] },
    { id: 'spend', name: 'Spending Sense Agent', status: 'alert' as const, latestFinding: 'Food spending is 15% above average.', confidence: 0.92, recommendedAction: 'Limit GrabFood to RM15/day', tools: ['analyze_category', 'detect_anomaly'] },
    { id: 'cash', name: 'Cashflow Prediction Agent', status: 'alert' as const, latestFinding: 'Predicted broke date: 18 May', confidence: 0.87, recommendedAction: 'Activate Spend Guard', tools: ['predict_cashflow', 'calculate_safe_daily_spend'] },
    { id: 'debt', name: 'Debt Shield Agent', status: 'idle' as const, latestFinding: 'No new debt detected.', confidence: 0.95, recommendedAction: 'Continue monitoring', tools: ['scan_bnpl', 'check_installments'] },
  ],
  resilienceScore: 68,
  resilienceCashflowScore: 65,
  resilienceSavingsScore: 40,
  resilienceDebtScore: 95,
  debtRiskScore: 45,
  cashflowRisk: 'medium' as const,
  safeDailySpend: 18.5,
  initialSafeDaily: 18.5,
  isSpendGuardActive: false,
  isSurvivalModeActive: false,
  isAutoSaveActive: false,
  autoSaveTargetIds: ['1'],
  autoSaveFrequency: 'daily' as const,
  autoSaveAmount: 2.0,
  lastAutoSaveDate: null,
  pet: {
    message: 'Stay focused!'
  },
  lastGrowthSimulationDate: null,
  isRoundUpActive: true,
  bills: [],
  pendingMainGoal: null,
  hasNotificationSave: false,
};

// Raw store in-memory with zero local storage persistence to clean state on refresh
const useStoreBase = create<ResilienceState>()(
  (set, get) => ({
      ...initialStoreState,
      addTransaction: (t, skipRoundUp = false) => {
        set((state) => {
          const nextTransactions = [t, ...state.transactions];
          const updatedBalance = state.user.currentBalance - (t.type === 'expense' ? t.amount : -t.amount);
          
          let nextInitialSafeDaily = state.initialSafeDaily;
          
          // Recalculate and update initialSafeDaily if it is an income transaction (new money added)
          if (t.type === 'income') {
             // Calculate days remaining
             const getDaysRemainingInternal = () => {
               if (state.user.incomeSource === "fixed" && state.user.fixedFrequency === "weekly" && state.user.weeklyPayDay) {
                 const daysMap: Record<string, number> = {
                   sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
                 };
                 const targetIndex = daysMap[state.user.weeklyPayDay.toLowerCase()] ?? 5;
                 const today = new Date();
                 const todayIndex = today.getDay();
                 let diff = targetIndex - todayIndex;
                 if (diff <= 0) diff += 7;
                 return diff;
               }
               if (!state.user.nextAllowanceDate) return 14;
               const today = new Date();
               const nextDate = new Date(state.user.nextAllowanceDate);
               const diffTime = nextDate.getTime() - today.getTime();
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               return diffDays > 0 ? diffDays : 30;
             };

             const daysLeft = getDaysRemainingInternal();
             const totalCommitments = state.user.totalCommitments || 0;
             let calculatedDaily = 15.0;

             if (state.user.incomeSource === "fixed") {
               if (state.user.fixedFrequency === "weekly") {
                 const weeklyCommitment = totalCommitments / 4;
                 const remainingBalance = Math.max(0, updatedBalance - weeklyCommitment);
                 calculatedDaily = daysLeft > 0 ? remainingBalance / daysLeft : remainingBalance;
               } else {
                 const remainingBalance = Math.max(0, updatedBalance - totalCommitments);
                 calculatedDaily = daysLeft > 0 ? remainingBalance / daysLeft : remainingBalance;
               }
             } else {
               // lump-sum / irregular / none
               const start = state.user.lumpStartDate ? new Date(state.user.lumpStartDate) : (state.user.setupDate ? new Date(state.user.setupDate) : new Date());
               const duration = state.user.durationDays || 30;
               const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
               const today = new Date();
               const diffTime = end.getTime() - today.getTime();
               const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
               const remainingDays = diffDays > 0 ? diffDays : duration;
               const remainingMonths = remainingDays / 30;
               const commitmentsForRemainingPeriod = totalCommitments * remainingMonths;
               const remainingBalance = Math.max(0, updatedBalance - commitmentsForRemainingPeriod);
               calculatedDaily = remainingBalance / remainingDays;
             }

             const flooredDaily = Math.floor(calculatedDaily * 100) / 100;
             nextInitialSafeDaily = flooredDaily > 0 ? flooredDaily : 15.0;
          }

          return {
            transactions: nextTransactions,
            user: { ...state.user, currentBalance: updatedBalance },
            initialSafeDaily: nextInitialSafeDaily
          };
        });
        
        if (!skipRoundUp && t.type === 'expense') {
          get().processRoundUp(t.amount);
        }
        get().updateResilienceScore();
      },
      addSavingsPocket: (p) => {
        set((state) => {
          const cleanedPockets = p.isMainGoal
            ? state.savingsPockets.map(pocket => ({ ...pocket, isMainGoal: false }))
            : state.savingsPockets;
          return {
            savingsPockets: [...cleanedPockets, p],
            user: { ...state.user, currentBalance: state.user.currentBalance - p.current }
          };
        });
        get().updateResilienceScore();
      },
      updateSavingsPocket: (id, updates) => {
        set((state) => {
          const cleanedPockets = updates.isMainGoal
            ? state.savingsPockets.map(pocket => pocket.id === id ? pocket : { ...pocket, isMainGoal: false })
            : state.savingsPockets;
          return {
            savingsPockets: cleanedPockets.map(p =>
              p.id === id ? { ...p, ...updates } : p
            )
          };
        });
        get().updateResilienceScore();
      },
      deleteSavingsPocket: (id) => {
        set((state) => {
          const pocket = state.savingsPockets.find(p => p.id === id);
          if (!pocket) return state;
          return {
            savingsPockets: state.savingsPockets.filter(p => p.id !== id),
            user: { ...state.user, currentBalance: state.user.currentBalance + pocket.current }
          };
        });
        get().updateResilienceScore();
      },
      addFundsToPocket: (id, amount) => {
        set((state) => ({
          savingsPockets: state.savingsPockets.map(p =>
            p.id === id ? { ...p, current: p.current + amount } : p
          ),
          user: { ...state.user, currentBalance: state.user.currentBalance - amount }
        }));
        get().updateResilienceScore();
      },
      toggleSpendGuard: () => set((state) => ({ isSpendGuardActive: !state.isSpendGuardActive })),
      toggleSurvivalMode: () => set((state) => ({ isSurvivalModeActive: !state.isSurvivalModeActive })),
      toggleAutoSave: () => set((state) => ({ isAutoSaveActive: !state.isAutoSaveActive })),
      toggleRoundUp: () => set((state) => ({ isRoundUpActive: !state.isRoundUpActive })),
      setAutoSaveTargetIds: (ids) => set({ autoSaveTargetIds: ids }),
      processAutoSave: () => set((state) => {
        const today = new Date();
        const todayStr = today.toDateString();

        if (!state.isAutoSaveActive || state.lastAutoSaveDate === todayStr || state.autoSaveTargetIds.length === 0) return state;

        // Mock frequency logic for demo
        if (state.autoSaveFrequency === 'weekly' && today.getDay() !== 1) return state; // Only Mondays
        if (state.autoSaveFrequency === 'monthly' && today.getDate() !== 1) return state; // Only 1st of month

        const totalAmount = state.autoSaveAmount;

        if (state.user.currentBalance < 20) {
          return {
            lastAutoSaveDate: todayStr,
            pet: { message: "Auto-save paused: Balance too low!" }
          };
        }

        const splitAmount = totalAmount / state.autoSaveTargetIds.length;
        const newPockets = state.savingsPockets.map(p => {
          if (state.autoSaveTargetIds.includes(p.id)) {
            return { ...p, current: p.current + splitAmount };
          }
          return p;
        });

        return {
          lastAutoSaveDate: todayStr,
          user: { ...state.user, currentBalance: state.user.currentBalance - totalAmount },
          savingsPockets: newPockets,
          pet: { message: `Nice! Saved RM ${totalAmount.toFixed(2)} automatically today.` }
        };
      }),
      processRoundUp: (amount) => set((state) => {
        if (!state.isRoundUpActive || state.autoSaveTargetIds.length === 0) return state;
        
        const nextDollar = Math.ceil(amount);
        const roundUp = nextDollar - amount;
        
        if (roundUp <= 0) return state;
        if (state.user.currentBalance < roundUp) return state;

        const splitAmount = roundUp / state.autoSaveTargetIds.length;
        const newPockets = state.savingsPockets.map(p => {
          if (state.autoSaveTargetIds.includes(p.id)) {
            return { ...p, current: p.current + splitAmount };
          }
          return p;
        });

        return {
          user: { ...state.user, currentBalance: state.user.currentBalance - roundUp },
          savingsPockets: newPockets,
          pet: { message: `Spare change alert! RM ${roundUp.toFixed(2)} rounded up into pockets.` }
        };
      }),
      simulateGrowth: () => set((state) => {
        const today = new Date().toDateString();
        if (state.lastGrowthSimulationDate === today) return state;

        let totalGrowth = 0;
        const newPockets = state.savingsPockets.map(p => {
          if (p.mode === 'growth' && p.riskLevel) {
            const annualRate = RISK_RETURNS[p.riskLevel];
            // Simulate daily growth (compounded daily for effect)
            const dailyRate = annualRate / 365;
            const growth = p.current * dailyRate;
            totalGrowth += growth;
            return { ...p, current: p.current + growth };
          }
          return p;
        });

        if (totalGrowth === 0) return { lastGrowthSimulationDate: today };

        return {
          savingsPockets: newPockets,
          lastGrowthSimulationDate: today,
          pet: { message: `Market update: Your growth pockets earned RM ${totalGrowth.toFixed(2)} today! 📈` }
        };
      }),
      updateResilienceScore: () => {
        set((state) => {
          // 1. Cashflow Safety (50% Weight)
          // Compare Actual Daily Spending vs. Safe Daily Spend Quota. If Actual > Safe, the score drops.
          const todayStr = new Date().toDateString();
          const todayExpenses = state.transactions
            .filter(t => t.type === 'expense' && new Date(t.date).toDateString() === todayStr)
            .reduce((sum, t) => sum + t.amount, 0);

          const safeQuota = state.initialSafeDaily || 15.0;
          const cashflowScore = todayExpenses <= safeQuota 
            ? 100 
            : Math.max(0, 100 - ((todayExpenses - safeQuota) / safeQuota) * 100);

          // 2. Savings Progress (20% Weight)
          // Current Saved Amount vs. Total Goal Target
          const currentSaved = state.savingsPockets.reduce((sum, p) => sum + p.current, 0) + (state.user.currentEmergencyFund || 0);
          const targetSaved = state.savingsPockets.reduce((sum, p) => sum + p.target, 0) + (state.user.emergencyFundGoal || 500);
          const savingsScore = targetSaved > 0 ? Math.min(100, (currentSaved / targetSaved) * 100) : 50;

          // 3. Debt Health (30% Weight)
          // Simple Formula: (1 - (total commitment / total balance)) * 100
          const commitments = state.user.totalCommitments || 0;
          const totalBalance = state.user.currentBalance || 800;
          const debtScore = totalBalance > 0 
            ? Math.max(0, Math.min(100, (1 - (commitments / totalBalance)) * 100)) 
            : 100;

          // Total Resilience Score weighted calculation
          const finalScore = Math.round((0.5 * cashflowScore) + (0.3 * debtScore) + (0.2 * savingsScore));
          
          return {
            resilienceScore: finalScore,
            resilienceCashflowScore: Math.round(cashflowScore),
            resilienceSavingsScore: Math.round(savingsScore),
            resilienceDebtScore: Math.round(debtScore)
          };
        });
      },
      setLanguage: (lang) => set({ language: lang }),

      // Bills Actions
      addBill: (b) => set((state) => ({ bills: [...state.bills, b] })),
      updateBill: (id, updates) => set((state) => ({
        bills: state.bills.map(b => b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b)
      })),
      deleteBill: (id) => set((state) => ({
        bills: state.bills.filter(b => b.id !== id)
      })),
      toggleBillLock: (id) => set((state) => ({
        bills: state.bills.map(b => b.id === id ? { ...b, isLocked: !b.isLocked } : b)
      })),
      toggleBillAutopay: (id) => set((state) => ({
        bills: state.bills.map(b => b.id === id ? { ...b, autopayEnabled: !b.autopayEnabled } : b)
      })),
      payBillNow: (id) => {
        const state = get();
        const bill = state.bills.find(b => b.id === id);
        if (!bill) return;

        const transactionId = Math.random().toString(36).substring(7);
        const paymentRecord: BillPaymentRecord = {
          id: Math.random().toString(36).substring(7),
          billId: id,
          amount: bill.amount,
          paidAt: new Date().toISOString(),
          method: 'manual',
          status: 'paid',
          transactionId
        };

        state.addTransaction({
          id: transactionId,
          title: `Bill: ${bill.name}`,
          amount: bill.amount,
          category: bill.category,
          date: new Date().toISOString(),
          type: 'expense'
        });

        set((state) => ({
          bills: state.bills.map(b => b.id === id ? {
            ...b,
            status: 'paid',
            lastPaidAt: paymentRecord.paidAt,
            nextDueDate: calculateNextDueDate(b.nextDueDate, b.frequency),
            paymentHistory: [paymentRecord, ...(b.paymentHistory || [])]
          } : b),
          pet: { message: `Bill for ${bill.name} paid! Great job.` }
        }));
      },
      processAutoPay: () => {
        const state = get();
        const today = new Date();
        const nextAllowance = new Date(state.user.nextAllowanceDate);
        const daysUntilNextAllowance = Math.max(1, Math.ceil((nextAllowance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Calculate current locked amount for spendable balance logic
        const lockedAmount = state.bills
          .filter(b => b.isLocked && b.status !== 'paid')
          .reduce((sum, b) => sum + b.amount, 0);
        const spendableBalance = state.user.currentBalance - lockedAmount;

        state.bills.forEach(bill => {
          if (bill.autopayEnabled && bill.status !== 'paid' && isBillDue(bill.nextDueDate)) {
            // Check if setup is complete
            if (!bill.accountNumber && !bill.referenceNumber) {
              state.updateBill(bill.id, { status: 'needs_setup' });
              return;
            }

            const safety = isAutoPaySafe(bill, state.user.currentBalance, spendableBalance, daysUntilNextAllowance);
            
            if (safety.safe) {
              const transactionId = Math.random().toString(36).substring(7);
              const paymentRecord: BillPaymentRecord = {
                id: Math.random().toString(36).substring(7),
                billId: bill.id,
                amount: bill.amount,
                paidAt: new Date().toISOString(),
                method: 'autopay',
                status: 'paid',
                transactionId
              };

              state.addTransaction({
                id: transactionId,
                title: `AutoPay: ${bill.name}`,
                amount: bill.amount,
                category: bill.category,
                date: new Date().toISOString(),
                type: 'expense'
              });

              set((s) => ({
                bills: s.bills.map(b => b.id === bill.id ? {
                  ...b,
                  status: 'paid',
                  lastPaidAt: paymentRecord.paidAt,
                  nextDueDate: calculateNextDueDate(b.nextDueDate, b.frequency),
                  paymentHistory: [paymentRecord, ...(b.paymentHistory || [])]
                } : b),
                pet: { message: `AutoPay: ${bill.name} RM${bill.amount} paid successfully!` }
              }));
            } else {
              state.updateBill(bill.id, { status: 'paused' });
              set({ pet: { message: `AutoPay paused for ${bill.name}: ${safety.reason}` } });
            }
          }
        });
      }
    })
);

interface UseStoreHook {
  (): ResilienceState;
  <T>(selector: (state: ResilienceState) => T): T;
  getState: typeof useStoreBase.getState;
  setState: typeof useStoreBase.setState;
  subscribe: typeof useStoreBase.subscribe;
}

// Safe Hydration Selector Hook wrapper with static Zustand bindings
export const useStore = (() => {
  const hook = <T>(selector?: (state: ResilienceState) => T): T | ResilienceState => {
    const storeState = useStoreBase();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
      setHydrated(true);
    }, []);

    const actions = {
      addTransaction: storeState.addTransaction,
      addSavingsPocket: storeState.addSavingsPocket,
      updateSavingsPocket: storeState.updateSavingsPocket,
      deleteSavingsPocket: storeState.deleteSavingsPocket,
      addFundsToPocket: storeState.addFundsToPocket,
      toggleSpendGuard: storeState.toggleSpendGuard,
      toggleSurvivalMode: storeState.toggleSurvivalMode,
      toggleAutoSave: storeState.toggleAutoSave,
      toggleRoundUp: storeState.toggleRoundUp,
      setAutoSaveTargetIds: storeState.setAutoSaveTargetIds,
      processAutoSave: storeState.processAutoSave,
      processRoundUp: storeState.processRoundUp,
      simulateGrowth: storeState.simulateGrowth,
      updateResilienceScore: storeState.updateResilienceScore,
      setLanguage: storeState.setLanguage,
      addBill: storeState.addBill,
      updateBill: storeState.updateBill,
      deleteBill: storeState.deleteBill,
      toggleBillLock: storeState.toggleBillLock,
      toggleBillAutopay: storeState.toggleBillAutopay,
      payBillNow: storeState.payBillNow,
      processAutoPay: storeState.processAutoPay,
    };

    const stateToUse = hydrated
      ? storeState
      : { ...initialStoreState, ...actions };

    // Apply selector if provided, otherwise cast whole state
    return selector ? selector(stateToUse as ResilienceState) : (stateToUse as ResilienceState);
  };

  hook.getState = useStoreBase.getState;
  hook.setState = useStoreBase.setState;
  hook.subscribe = useStoreBase.subscribe;

  return hook as unknown as UseStoreHook;
})();
