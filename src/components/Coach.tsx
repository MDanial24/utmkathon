"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Shield, Brain, Target, TrendingUp, Send, ChevronLeft } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { Pet } from "@/components/ui/Pet"
import Link from "next/link"

const AGENTS = [
  { id: 'save', name: 'Savings Sentinel', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'debt', name: 'Debt Shield', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'invest', name: 'Growth Guru', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'finance', name: 'Finance Strategist', icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

interface ChatAction {
  id: string;
  label: string;
  type: 'create_pocket' | 'postpone' | 'prioritize_emergency';
  payload?: any;
}

interface Message {
  role: 'user' | 'assistant';
  agent?: string;
  content: string;
  actions?: ChatAction[];
  proposal?: any; // New field for interactive card preview
}

export function Coach() {
  const { user, safeDailySpend, resilienceScore, language, addSavingsPocket, savingsPockets, bills } = useStore()
  const strings = t[language]
  const scrollRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollArea = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollArea) {
        scrollArea.scrollTop = scrollArea.scrollHeight
      }
    }
  }, [messages, isThinking])

  const handleAction = (action: ChatAction) => {
    let responseText = "";

    switch (action.type) {
      case 'create_pocket':
        addSavingsPocket({
          id: Math.random().toString(36).substring(2, 11),
          name: action.payload.name,
          target: action.payload.target,
          current: action.payload.current || 0,
          icon: action.payload.icon || '💰',
          mode: 'savings'
        });
        responseText = `Done! I've set up your ${action.payload.name} pocket with an initial RM ${action.payload.current}. Your Resilience Score is recalculating...`;
        break;
      case 'postpone':
        responseText = "Wise choice. We'll revisit this goal when your liquidity improves.";
        break;
      case 'prioritize_emergency':
        responseText = "I've noted your focus on the Emergency Fund. Your safety net is your priority.";
        break;
    }

    setMessages(prev => [
      ...prev,
      { role: 'user', content: action.label },
      { role: 'assistant', agent: 'Savings Sentinel', content: responseText }
    ]);
  }

  const sendMessage = (overrideText?: string) => {
    const textToSubmit = (overrideText || input).toLowerCase();
    if (!textToSubmit.trim() || isThinking) return

    const newMessages = [...messages, { role: 'user', content: overrideText || input }]
    setMessages(newMessages)
    if (!overrideText) setInput("")
    setIsThinking(true)

    // Council dispatch logic
    setTimeout(() => {
      const responses: any[] = []

      const triggerFinance = textToSubmit.includes("spend") || textToSubmit.includes("safe") || textToSubmit.includes("limit") || textToSubmit.includes("daily") || textToSubmit.includes("budget") || textToSubmit.includes("money") || textToSubmit.includes("impulse")
      const triggerGrowth = textToSubmit.includes("invest") || textToSubmit.includes("stock") || textToSubmit.includes("crypto") || textToSubmit.includes("gold") || textToSubmit.includes("growth") || textToSubmit.includes("opportunity") || textToSubmit.includes("market")
      const triggerSave = textToSubmit.includes("save") || textToSubmit.includes("goal") || textToSubmit.includes("fund") || textToSubmit.includes("laptop") || textToSubmit.includes("emergency")
      const triggerDebt = textToSubmit.includes("debt") || textToSubmit.includes("bnpl") || textToSubmit.includes("loan") || textToSubmit.includes("risk") || textToSubmit.includes("credit")
      const triggerBills = textToSubmit.includes("bill") || textToSubmit.includes("rent") || textToSubmit.includes("autopay") || textToSubmit.includes("commitment") || textToSubmit.includes("lock") || textToSubmit.includes("protected")

      if (triggerFinance || (!triggerGrowth && !triggerSave && !triggerDebt && !triggerBills)) {
        responses.push({
          role: 'assistant',
          agent: 'Finance Strategist',
          content: `Based on your current balance of RM 420, your absolute safe limit for today is RM ${safeDailySpend.toFixed(2)}. This ensures you stay on track for your upcoming bills.`
        })
      }

      if (triggerSave) {
        if (user.currentBalance > 1000) {
          responses.push({
            role: 'assistant',
            agent: 'Savings Sentinel',
            content: `You have a healthy surplus (RM ${user.currentBalance.toFixed(2)}). I've prepared a proposal for your Laptop goal. Shall we execute it?`,
            proposal: {
              name: 'Laptop Fund',
              target: 2500,
              current: 200,
              icon: '💻',
              mode: 'growth',
              riskLevel: 'medium'
            },
            actions: [
              {
                id: 'create_laptop_pocket',
                label: 'Approve',
                type: 'create_pocket',
                payload: { name: 'Laptop Fund', target: 2500, current: 200, icon: '💻', mode: 'growth', riskLevel: 'medium' }
              },
              {
                id: 'postpone',
                label: 'Decline',
                type: 'postpone'
              }
            ]
          })
        } else if (user.currentBalance < 500 || resilienceScore < 60) {
          responses.push({
            role: 'assistant',
            agent: 'Savings Sentinel',
            content: `Your current liquidity is tight (RM ${user.currentBalance.toFixed(2)}). I recommend focusing on your safety net first.`,
            actions: [
              {
                id: 'prioritize_emergency',
                label: '🛡️ Prioritize Emergency Fund instead',
                type: 'prioritize_emergency'
              },
              {
                id: 'postpone',
                label: '🕒 Remind me later',
                type: 'postpone'
              }
            ]
          })
        } else {
          responses.push({
            role: 'assistant',
            agent: 'Savings Sentinel',
            content: `Analyzing your goals... I see you're saving for a Laptop. If you maintain your current pace, you'll reach your RM 2,500 target in approximately 4 months.`
          })
        }
      }

      if (triggerDebt) {
        responses.push({
          role: 'assistant',
          agent: 'Debt Shield',
          content: `Risk alert: I've scanned your recent transactions. You have no active BNPL installments, which is excellent for your Money Health score.`
        })
      }

      if (triggerGrowth) {
        responses.push({
          role: 'assistant',
          agent: 'Growth Guru',
          content: `The best growth opportunity right now is your ASB or high-yield savings account. Market volatility in crypto makes it a high-risk move for your current resilience level.`
        })
      }

      if (triggerBills) {
        const lockedAmount = bills.filter(b => b.isLocked && b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0);
        const nextBill = bills.filter(b => b.status !== 'paid').sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];
        
        responses.push({
          role: 'assistant',
          agent: 'Finance Strategist',
          content: `You have RM ${lockedAmount.toFixed(2)} protected for bills. ${nextBill ? `Your next bill is ${nextBill.name} due soon.` : 'No upcoming bills detected.'} Protecting your bill money early is why your spendable balance might look lower than your total balance.`
        })
      }
      setMessages([...newMessages, ...responses])
      setIsThinking(false)
    }, 1500)
  }

  const starterPrompts = [
    { text: "What is my safe daily spend?", icon: Brain, color: "text-amber-500" },
    { text: "How to save for a laptop?", icon: Target, color: "text-emerald-500" },
    { text: "How to limit impulse buys?", icon: Shield, color: "text-purple-500" },
    { text: "Should I invest in crypto?", icon: TrendingUp, color: "text-blue-500" }
  ]

  return (
    <div className="flex flex-col h-[100dvh] max-w-lg mx-auto overflow-hidden bg-slate-50/50 dark:bg-background">
      {/* Top Header */}
      <header className="p-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm z-20 shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </Link>
            <div className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 shadow-inner">
              <Pet animation={isThinking ? "think" : "idle"} size={40} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{strings.coachHeader}</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Resilience Council Active</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold px-2 py-1">
            HEALTH: {resilienceScore}%
          </Badge>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="space-y-6 py-6 h-full">

            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col justify-center h-full pt-10"
                >
                  <div className="mb-8">
                    <h2 className="text-xl font-medium text-muted-foreground mb-1">Hi {user.name}</h2>
                    <h1 className="text-3xl font-bold tracking-tight">Where should we start?</h1>
                  </div>

                  <div className="space-y-3">
                    {starterPrompts.map((prompt, i) => (
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={prompt.text}
                        onClick={() => sendMessage(prompt.text)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-all text-left group"
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-black/20 shrink-0", prompt.color)}>
                          <prompt.icon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                          {prompt.text}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="chat-history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {messages.map((m: any, i) => {
                    const agent = AGENTS.find(a => a.name === m.agent)
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex flex-col gap-1",
                          m.role === 'user' ? "items-end" : "items-start"
                        )}
                      >
                        {m.role === 'assistant' && (
                          <span className={cn("text-[8px] font-bold uppercase tracking-widest ml-11", agent?.color)}>
                            {m.agent}
                          </span>
                        )}
                        <div className={cn(
                          "flex gap-3",
                          m.role === 'user' ? "flex-row-reverse" : ""
                        )}>
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                            m.role === 'assistant' ? cn(agent?.bg, "border-white/20") : "bg-slate-200 border-slate-300 text-slate-600"
                          )}>
                            {m.role === 'assistant' ? (
                              agent ? <agent.icon className={cn("w-4 h-4", agent.color)} /> : <Pet animation="idle" size={32} />
                            ) : <User className="w-4 h-4" />}
                          </div>
                          <div className={cn("flex flex-col gap-3 max-w-[90%]", m.role === 'user' ? "items-end" : "items-start")}>
                            <div className={cn(
                              "p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm w-fit",
                              m.role === 'assistant' ? "bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5" : "bg-primary text-white font-medium"
                            )}>
                              {m.content}
                            </div>

                            {/* Proposal Card Rendering */}
                            {m.proposal && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-full max-w-[280px]"
                              >
                                <Card className="glass-card bg-slate-900/40 border-primary/20 overflow-hidden">
                                  <CardContent className="p-4 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-xl">
                                        {m.proposal.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <p className="text-xs font-bold text-white">{m.proposal.name}</p>
                                          {m.proposal.mode === 'growth' && (
                                            <Badge className="text-[7px] h-3 bg-primary/20 text-primary border-primary/20 px-1 font-black">
                                              Managed
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                          <p className="text-[9px] text-muted-foreground">RM {m.proposal.current} / RM {m.proposal.target}</p>
                                          <span className="text-[9px] text-emerald-500 font-bold">+4.2% p.a.</span>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center text-[9px]">
                                        <span className="text-primary/80 font-bold capitalize">({m.proposal.riskLevel} Risk)</span>
                                        <span className="font-bold text-primary">{Math.round((m.proposal.current / m.proposal.target) * 100)}%</span>
                                      </div>
                                      <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-primary" 
                                          style={{ width: `${(m.proposal.current / m.proposal.target) * 100}%` }}
                                        />
                                      </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                      <span className="text-[8px] text-emerald-500 font-bold flex items-center gap-1">
                                        <TrendingUp className="w-2 h-2" /> Growth Enabled
                                      </span>
                                      <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Proposal Preview</span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}

                            {m.actions && m.actions.length > 0 && (
                              <div className="flex gap-2 mt-1 w-full max-w-[280px]">
                                {m.actions.map((action: ChatAction) => (
                                  <button
                                    key={action.id}
                                    onClick={() => handleAction(action)}
                                    className={cn(
                                      "flex-1 text-[10px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 text-center",
                                      action.type === 'create_pocket' 
                                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20" 
                                        : "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20"
                                    )}
                                  >
                                    {action.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}

                  {isThinking && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-primary/10 border-primary/20">
                          <Pet animation="think" size={32} />
                        </div>
                        <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 flex gap-1 items-center shadow-sm">
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                          <span className="text-[9px] text-muted-foreground ml-2 font-medium">Council is deliberating...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Sticky Chat Input Area */}
        <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 space-y-3 shrink-0 z-20">
          <AnimatePresence>
            {messages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <div className="flex gap-2 px-1">
                    {[strings.coachChipLimit, strings.coachChipSafe, strings.coachChipSave].map((suggestion) => (
                      <button
                        key={suggestion}
                        disabled={isThinking}
                        onClick={() => sendMessage(suggestion)}
                        className="inline-flex items-center rounded-full bg-white dark:bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors border border-slate-200 dark:border-white/10 shrink-0 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Input
              placeholder={isThinking ? "Wait for the council..." : strings.coachInputPlaceholder}
              disabled={isThinking}
              className="pr-12 bg-white dark:bg-zinc-900/50 border-slate-200 dark:border-white/10 h-12 rounded-2xl text-xs shadow-sm focus:ring-primary/20 disabled:bg-slate-50 dark:disabled:bg-white/5"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              size="icon"
              disabled={isThinking || !input.trim()}
              className="absolute right-1 top-1 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
              onClick={() => sendMessage()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
