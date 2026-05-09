import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useState, useEffect } from 'react';


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

import { Language } from '@/lib/translations';

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
  };
  transactions: Transaction[];
  savingsPockets: SavingsPocket[];
  agents: Agent[];
  resilienceScore: number;
  debtRiskScore: number;
  cashflowRisk: 'low' | 'medium' | 'high';
  safeDailySpend: number;
  isSpendGuardActive: boolean;
  isSurvivalModeActive: boolean;
  pet: {
    message: string;
  };
  
  // Actions
  addTransaction: (t: Transaction) => void;
  toggleSpendGuard: () => void;
  toggleSurvivalMode: () => void;
  updateResilienceScore: () => void;
  setLanguage: (lang: Language) => void;
}

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
    { id: '1', name: 'Emergency Fund', target: 500, current: 85, icon: '🛡️' },
    { id: '2', name: 'Laptop Fund', target: 2500, current: 120, icon: '💻' },
    { id: '3', name: 'Rent Buffer', target: 400, current: 50, icon: '🏠' },
  ],
  agents: [
    { id: 'orch', name: 'Orchestrator Agent', status: 'idle' as const, latestFinding: 'System nominal. Monitoring cashflow.', confidence: 0.99, recommendedAction: 'No action needed', tools: ['monitor_all', 'dispatch'] },
    { id: 'spend', name: 'Spending Sense Agent', status: 'alert' as const, latestFinding: 'Food spending is 15% above average.', confidence: 0.92, recommendedAction: 'Limit GrabFood to RM15/day', tools: ['analyze_category', 'detect_anomaly'] },
    { id: 'cash', name: 'Cashflow Prediction Agent', status: 'alert' as const, latestFinding: 'Predicted broke date: 18 May', confidence: 0.87, recommendedAction: 'Activate Spend Guard', tools: ['predict_cashflow', 'calculate_safe_daily_spend'] },
    { id: 'debt', name: 'Debt Shield Agent', status: 'idle' as const, latestFinding: 'No new debt detected.', confidence: 0.95, recommendedAction: 'Continue monitoring', tools: ['scan_bnpl', 'check_installments'] },
  ],
  resilienceScore: 68,
  debtRiskScore: 45,
  cashflowRisk: 'medium' as const,
  safeDailySpend: 18.5,
  isSpendGuardActive: false,
  isSurvivalModeActive: false,
  pet: {
    message: 'Stay focused!'
  },
};

// Raw store with persistence enabled
const useStoreBase = create<ResilienceState>()(
  persist(
    (set, get) => ({
      ...initialStoreState,
      addTransaction: (t) => set((state) => ({ 
        transactions: [t, ...state.transactions],
        user: { ...state.user, currentBalance: state.user.currentBalance - (t.type === 'expense' ? t.amount : -t.amount) }
      })),
      toggleSpendGuard: () => set((state) => ({ isSpendGuardActive: !state.isSpendGuardActive })),
      toggleSurvivalMode: () => set((state) => ({ isSurvivalModeActive: !state.isSurvivalModeActive })),
      updateResilienceScore: () => {
        // Logic to recalculate based on state
      },
      setLanguage: (lang) => set({ language: lang })
    }),
    {
      name: 'resilience-agent-storage',
    }
  )
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
      toggleSpendGuard: storeState.toggleSpendGuard,
      toggleSurvivalMode: storeState.toggleSurvivalMode,
      updateResilienceScore: storeState.updateResilienceScore,
      setLanguage: storeState.setLanguage,
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
