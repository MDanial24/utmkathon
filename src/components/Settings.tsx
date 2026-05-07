"use client"

import { useStore } from "@/store/useStore"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Moon, Sun, User, Bell, Shield, Wallet, CircleHelp, LogOut, ChevronRight, AlertTriangle, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { t } from "@/lib/translations"
import { Button } from "@/components/ui/button"

export function Settings() {
  const { user, language, setLanguage } = useStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const strings = t[language]
  const [showLogout, setShowLogout] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = () => {
    setIsLoggingOut(true)
    setTimeout(() => {
      // Simulation of secure logout clearing state
      router.push("/")
    }, 1500)
  }

  return (
    <div className="p-4 space-y-6 pb-24 max-w-lg mx-auto">
      <header className="flex flex-col items-center space-y-3 pt-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-primary/20 p-1">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-4 border-background flex items-center justify-center text-slate-900">
            <User className="w-4 h-4" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-xs text-muted-foreground">{user.type} • {user.spendingPersonality}</p>
        </div>
      </header>

      {/* Menu Sections */}
      <div className="space-y-4">
        <section className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">{strings.settingsPreferences}</h3>
          <Card className="glass-card">
            <CardContent className="p-0">
              {/* Theme Toggle */}
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-amber-500" />}
                  <span className="text-xs font-medium">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setTheme('light')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${theme === 'light' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    LIGHT
                  </button>
                  <button 
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${theme === 'dark' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    DARK
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium">{strings.settingsLanguage}</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${language === 'en' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLanguage('ms')}
                    className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${language === 'ms' ? 'bg-white text-primary shadow-sm' : 'text-slate-500'}`}
                  >
                    BM
                  </button>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">{strings.settingsSmartNotif}</span>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-medium">{strings.settingsDebtAuto}</span>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2">
          <h3 className="text-[10px] uppercase font-bold text-muted-foreground px-2 tracking-widest">{strings.settingsAccount}</h3>
          <Card className="glass-card">
            <CardContent className="p-0">
              {[
                { icon: Wallet, label: strings.settingsPaymentMethods, color: "text-primary" },
                { icon: User, label: strings.settingsProfile, color: "text-primary" },
                { icon: CircleHelp, label: strings.settingsHelp, color: "text-amber-500" },
              ].map((item, i) => (
                <div key={item.label} className={`p-4 flex items-center justify-between ${i !== 2 ? 'border-b border-slate-200' : ''}`}>
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-2 mt-8">
          <h3 className="text-[10px] uppercase font-bold text-rose-500/70 px-2 tracking-widest">{strings.settingsSecureSession}</h3>
          <Card className="border-rose-500/20 bg-rose-500/5 shadow-sm">
            <CardContent className="p-2">
              <Button 
                onClick={() => setShowLogout(true)}
                variant="ghost" 
                className="w-full flex items-center justify-center text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 gap-2 font-bold text-xs py-4 rounded-xl transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> {strings.settingsSignOut}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] text-muted-foreground font-medium">Resilience Agent System v1.0.4-alpha</p>
        <p className="text-[10px] text-muted-foreground mt-1">Made with 🧬 in Malaysia</p>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogout && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoggingOut && setShowLogout(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xl z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50"
            >
              <Card className="liquid-glass border-rose-500/20 shadow-2xl max-w-sm mx-auto overflow-hidden">
                <CardContent className="p-6 text-center space-y-6">
                  <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <LogOut className="w-8 h-8 ml-1" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900">{strings.logoutReady}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">
                      {strings.logoutDesc}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button 
                      disabled={isLoggingOut}
                      onClick={() => setShowLogout(false)}
                      className="py-6 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-xs"
                    >
                      {strings.logoutCancel}
                    </Button>
                    <Button 
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="py-6 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 text-xs shadow-lg shadow-rose-500/20"
                    >
                      {isLoggingOut ? strings.logoutSecuring : strings.logoutConfirm}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
