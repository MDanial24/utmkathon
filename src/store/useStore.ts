import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  isAutoSaveActive: boolean;
  autoSaveTargetIds: string[];
  autoSaveFrequency: 'daily' | 'weekly' | 'monthly';
  autoSaveAmount: number;
  lastAutoSaveDate: string | null;
  pet: {
    message: string;
  };
  
  // Actions
  addTransaction: (t: Transaction) => void;
  addSavingsPocket: (p: SavingsPocket) => void;
  updateSavingsPocket: (id: string, updates: Partial<SavingsPocket>) => void;
  deleteSavingsPocket: (id: string) => void;
  addFundsToPocket: (id: string, amount: number) => void;
  toggleSpendGuard: () => void;
  toggleSurvivalMode: () => void;
  toggleAutoSave: () => void;
  setAutoSaveTargetIds: (ids: string[]) => void;
  processAutoSave: () => void;
  updateResilienceScore: () => void;
  setLanguage: (lang: Language) => void;
}

export const useStore = create<ResilienceState>()(
  persist(
    (set, get) => ({
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
        { id: '1', name: 'Emergency Fund', target: 500, current: 85, icon: '🛡️', mode: 'savings' },
        { id: '2', name: 'Laptop Fund', target: 2500, current: 120, icon: '💻', mode: 'growth', riskLevel: 'medium' },
        { id: '3', name: 'Rent Buffer', target: 400, current: 50, icon: '🏠', mode: 'savings' },
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
      isAutoSaveActive: false,
      autoSaveTargetIds: ['1'],
      autoSaveFrequency: 'daily',
      autoSaveAmount: 2.0,
      lastAutoSaveDate: null,
      pet: {
        message: 'Stay focused!'
      },

      addTransaction: (t) => set((state) => ({ 
        transactions: [t, ...state.transactions],
        user: { ...state.user, currentBalance: state.user.currentBalance - (t.type === 'expense' ? t.amount : -t.amount) }
      })),
      addSavingsPocket: (p) => set((state) => ({
        savingsPockets: [...state.savingsPockets, p]
      })),
      updateSavingsPocket: (id, updates) => set((state) => ({
        savingsPockets: state.savingsPockets.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      deleteSavingsPocket: (id) => set((state) => {
        const pocket = state.savingsPockets.find(p => p.id === id);
        if (!pocket) return state;
        return {
          savingsPockets: state.savingsPockets.filter(p => p.id !== id),
          user: { ...state.user, currentBalance: state.user.currentBalance + pocket.current }
        };
      }),
      addFundsToPocket: (id, amount) => set((state) => ({
        savingsPockets: state.savingsPockets.map(p => 
          p.id === id ? { ...p, current: p.current + amount } : p
        ),
        user: { ...state.user, currentBalance: state.user.currentBalance - amount }
      })),
      toggleSpendGuard: () => set((state) => ({ isSpendGuardActive: !state.isSpendGuardActive })),
      toggleSurvivalMode: () => set((state) => ({ isSurvivalModeActive: !state.isSurvivalModeActive })),
      toggleAutoSave: () => set((state) => ({ isAutoSaveActive: !state.isAutoSaveActive })),
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
      updateResilienceScore: () => {
        // Logic to recalculate based on state
      },
      setLanguage: (lang) => set({ language: lang })
    }),
    {
      name: 'resilience-storage',
    }
  )
);

