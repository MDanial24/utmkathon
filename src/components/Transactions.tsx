"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Filter, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"

export function Transactions() {
  const { transactions, user } = useStore()

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex justify-between items-end">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary text-glow" />
            <h1 className="text-2xl font-bold">Transactions</h1>
          </div>
          <p className="text-muted-foreground text-sm">Monthly balance: RM {user.currentBalance.toFixed(2)}</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-slate-900 shadow-lg shadow-primary/20">
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input 
          placeholder="Search transactions..." 
          className="w-full bg-card border border-slate-200 rounded-2xl h-10 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <Filter className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="space-y-3">
          {transactions.map((t) => (
            <Card key={t.id} className="glass-card">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                    {t.type === 'income' ? '💰' : 
                     t.category === 'Food' ? '🍱' : 
                     t.category === 'Transport' ? '🚗' : 
                     t.category === 'Housing' ? '🏠' : 
                     t.category === 'Utilities' ? '📱' :
                     t.category === 'Education' ? '🎓' :
                     t.category === 'Entertainment' ? '📺' : '🛍️'}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{t.title}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-muted-foreground">{t.category}</p>
                      <Badge variant="outline" className="text-[8px] h-3 px-1 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                        {Math.round((t.confidence || 0) * 100)}% MATCH
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-bold",
                    t.type === 'expense' ? "text-rose-500" : "text-emerald-500"
                  )}>
                    {t.type === 'expense' ? '-' : '+'}RM {t.amount.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
