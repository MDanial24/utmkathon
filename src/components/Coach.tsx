"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Zap, Activity, Cpu, Shield, Brain, Target, MessageCircle, AlertCircle, CheckCircle2, TrendingUp, Wallet, PieChart, LineChart, BarChart3, ChevronRight, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { t } from "@/lib/translations"
import { Pet, PetAnimation } from "@/components/ui/Pet"
import { Progress } from "@/components/ui/progress"

type Tab = 'chat' | 'agents' | 'insights'

const AGENTS = [
  { id: 'save', name: 'Savings Sentinel', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { id: 'debt', name: 'Debt Shield', icon: Shield, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { id: 'invest', name: 'Growth Guru', icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'finance', name: 'Finance Strategist', icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10' },
]

export function Coach() {
  const { user, safeDailySpend, resilienceScore, language } = useStore()
  const strings = t[language]
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      agent: 'Finance Strategist',
      content: language === 'ms' 
        ? `Hai ${user.name}! Saya Jurulatih Ketahanan anda. Had selamat semasa anda ialah RM ${safeDailySpend.toFixed(2)} sehari. Bagaimana kami boleh bantu anda kekal di landasan yang betul?`
        : `Hi ${user.name}! I'm your Resilience Strategist. Your current safety limit is RM ${safeDailySpend.toFixed(2)} per day. How can the council help you today?` 
    }
  ])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)

  const sendMessage = (overrideText?: string) => {
    const textToSubmit = overrideText || input;
    if (!textToSubmit.trim()) return
    const newMessages = [...messages, { role: 'user', content: textToSubmit }]
    setMessages(newMessages)
    if (!overrideText) setInput("")
    setIsThinking(true)

    // Council response logic
    setTimeout(() => {
      const councilResponses = [
        {
          agent: 'Savings Sentinel',
          content: `Analyzing goal impact... Spending on this would delay your Laptop Fund by 4 days. I recommend a 24-hour cooling period.`
        },
        {
          agent: 'Debt Shield',
          content: `Risk check complete. No BNPL usage detected for this transaction. Resilience score will remain stable at 72%.`
        },
        {
          agent: 'Growth Guru',
          content: `Opportunity cost analysis: This RM${(Math.random() * 50 + 10).toFixed(0)} could earn RM12.50 in your high-yield account by end of year.`
        },
        {
          agent: 'Finance Strategist',
          content: `Overall strategy: Your safe limit is RM${safeDailySpend.toFixed(2)}. This fits within your 'discretionary' bucket for this week.`
        }
      ]
      
      setMessages([...newMessages, ...councilResponses])
      setIsThinking(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-lg mx-auto overflow-hidden">
      {/* Top Header */}
      <header className="p-4 bg-background/60 backdrop-blur-md border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 overflow-hidden rounded-full flex items-center justify-center bg-primary/10 border border-primary/20">
              <Pet animation={isThinking ? "think" : "idle"} size={40} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">{strings.coachHeader}</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Resilience Council</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 border-emerald-500/20 text-emerald-500 font-bold">
            HEALTH: {resilienceScore}%
          </Badge>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
          {(['chat', 'agents', 'insights'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all capitalize",
                activeTab === tab ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-muted-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full flex flex-col p-4"
            >
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-6 pb-4">
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
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                            m.role === 'assistant' ? cn(agent?.bg, "border-white/20") : "bg-slate-200 border-slate-300 text-slate-600"
                          )}>
                            {m.role === 'assistant' ? (
                              agent ? <agent.icon className={cn("w-4 h-4", agent.color)} /> : <Pet animation="idle" size={32} />
                            ) : <User className="w-4 h-4" />}
                          </div>
                          <div className={cn(
                            "p-3 rounded-2xl text-[11px] leading-relaxed max-w-[85%] shadow-sm",
                            m.role === 'assistant' ? "bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5" : "bg-primary text-white font-medium"
                          )}>
                            {m.content}
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
                        <div className="p-3 rounded-2xl bg-card border border-slate-200 flex gap-1 items-center">
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                          <span className="text-[9px] text-muted-foreground ml-2 font-medium">Strategizing...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat Input */}
              <div className="mt-4 space-y-3 pb-20">
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <div className="flex gap-2 px-1">
                    {[strings.coachChipLimit, strings.coachChipSafe, strings.coachChipSave].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="inline-flex items-center rounded-full bg-slate-100 dark:bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors border border-slate-200 dark:border-white/10 shrink-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
                <div className="relative">
                  <Input 
                    placeholder={strings.coachInputPlaceholder} 
                    className="pr-12 bg-card border-slate-200 h-12 rounded-2xl text-xs"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button 
                    size="icon" 
                    className="absolute right-1 top-1 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white"
                    onClick={() => sendMessage()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div 
              key="agents"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="h-full overflow-auto p-4 space-y-6 pb-24"
            >
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">System Orchestrator</h3>
                  <p className="text-[10px] text-muted-foreground italic">"Analyzing behavior... all agents synchronized."</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {AGENTS.map((agent) => (
                  <Card key={agent.id} className="glass-card">
                    <CardContent className="p-4 flex gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", agent.bg)}>
                        <agent.icon className={cn("w-5 h-5", agent.color)} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                          <h4 className="text-xs font-bold">{agent.name}</h4>
                          <Badge className="text-[8px] bg-emerald-500/10 text-emerald-500 border-none">ACTIVE</Badge>
                        </div>
                        <Progress value={85} className="h-1 bg-slate-100" />
                        <p className="text-[10px] text-muted-foreground pt-1 line-clamp-1">Monitoring real-time {agent.id} metrics...</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div 
              key="insights"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full overflow-auto p-4 space-y-6 pb-24"
            >
              <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card border-emerald-500/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="text-[8px] font-bold text-emerald-500">+12%</span>
                    </div>
                    <p className="text-[10px] font-bold">Savings Rate</p>
                    <div className="h-10 flex items-end gap-0.5">
                      {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card border-purple-500/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="text-[8px] font-bold text-purple-500">Low Risk</span>
                    </div>
                    <p className="text-[10px] font-bold">Debt Health</p>
                    <div className="flex items-center justify-center py-2">
                      <div className="w-8 h-8 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <section className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest px-2">Market Insights</h3>
                <Card className="glass-card overflow-hidden">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold">Investments</span>
                    </div>
                    <span className="text-[10px] font-bold text-blue-500">View Trends</span>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {[
                        { label: 'Stock Portfolio', value: '+4.2%', color: 'text-emerald-500' },
                        { label: 'Crypto Assets', value: '-1.8%', color: 'text-rose-500' },
                        { label: 'Gold Savings', value: '+0.5%', color: 'text-emerald-500' },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                          <span className="text-[10px] text-muted-foreground">{item.label}</span>
                          <span className={cn("text-[10px] font-bold", item.color)}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
