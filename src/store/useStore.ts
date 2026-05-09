import { create } from 'zustand';

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

export const useStore = create<ResilienceState>((set, get) => ({
  language: 'en',
  user: {
    name: 'Aiman',
    type: 'Student',
    monthlyAllowance: 800,
    currentBalance: 420,
    nextAllowanceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    emergencyFundGoal: 500,
    currentEmergencyFund: 85,
    spendingPersonality: 'Food Overspender + Impulse Buyer',
  },
  transactions: [
    { id: '1', title: 'GrabFood', amount: 25.5, category: 'Food', date: new Date().toISOString(), type: 'expense', confidence: 0.98 },
    { id: '2', title: 'RapidKL', amount: 4.5, category: 'Transport', date: new Date().toISOString(), type: 'expense', confidence: 0.99 },
    { id: '3', title: 'Shopee - Shirt', amount: 45.0, category: 'Shopping', date: new Date().toISOString(), type: 'expense', confidence: 0.95 },
    { id: '4', title: 'Netflix', amount: 35.0, category: 'Subscription', date: new Date().toISOString(), type: 'expense', confidence: 1.0 },
    { id: '5', title: 'Campus Cafe', amount: 8.0, category: 'Food', date: new Date().toISOString(), type: 'expense', confidence: 0.97 },
  ],
  savingsPockets: [
    { id: '1', name: 'Emergency Fund', target: 500, current: 85, icon: '🛡️' },
    { id: '2', name: 'Laptop Fund', target: 2500, current: 120, icon: '💻' },
    { id: '3', name: 'Rent Buffer', target: 400, current: 50, icon: '🏠' },
  ],
  agents: [
    { id: 'orch', name: 'Orchestrator Agent', status: 'idle', latestFinding: 'System nominal. Monitoring cashflow.', confidence: 0.99, recommendedAction: 'No action needed', tools: ['monitor_all', 'dispatch'] },
    { id: 'spend', name: 'Spending Sense Agent', status: 'alert', latestFinding: 'Food spending is 15% above average.', confidence: 0.92, recommendedAction: 'Limit GrabFood to RM15/day', tools: ['analyze_category', 'detect_anomaly'] },
    { id: 'cash', name: 'Cashflow Prediction Agent', status: 'alert', latestFinding: 'Predicted broke date: 18 May', confidence: 0.87, recommendedAction: 'Activate Spend Guard', tools: ['predict_cashflow', 'calculate_safe_daily_spend'] },
    { id: 'debt', name: 'Debt Shield Agent', status: 'idle', latestFinding: 'No new debt detected.', confidence: 0.95, recommendedAction: 'Continue monitoring', tools: ['scan_bnpl', 'check_installments'] },
  ],
  resilienceScore: 68,
  debtRiskScore: 45,
  cashflowRisk: 'medium',
  safeDailySpend: 18.5,
  isSpendGuardActive: false,
  isSurvivalModeActive: false,
  pet: {
    message: 'Stay focused!'
  },

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
}));
