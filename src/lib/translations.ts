export type Language = 'en' | 'ms'

type Translations = {
  [key in Language]: {
    // Navigation
    navHome: string
    navAgents: string
    navSave: string
    navReports: string
    navPay: string
    navCards: string

    // Dashboard
    dashGreeting: string
    dashStatus: string
    dashStrong: string
    dashWatch: string
    dashBalance: string
    dashSafeDaily: string
    dashLimitsImpulse: string
    dashNextIn: string
    dashDays: string

    // Dashboard Quick Actions
    actionTransaction: string
    actionTransfer: string
    actionBills: string
    actionShield: string

    // Dashboard Sections
    sectionHealthCheck: string
    riskCashflow: string
    riskDebtShield: string
    sectionInsights: string
    insightBrokeDate: string
    insightBrokeDesc: string
    insightSavings: string
    insightSavingsDesc: string
    sectionRecent: string
    viewAll: string

    // Resilience Modal
    resModalTitle: string
    resModalExcellent: string
    resModalStable: string
    resModalNeedsAttention: string
    resModalDesc: string
    resModalCashflow: string
    resModalSavings: string
    resModalDebt: string
    resModalAI: string
    resModalAIDesc: string

    // Settings
    settingsPreferences: string
    settingsSmartNotif: string
    settingsDebtAuto: string
    settingsAccount: string
    settingsLanguage: string
    settingsPaymentMethods: string
    settingsProfile: string
    settingsHelp: string
    settingsSecureSession: string
    settingsSignOut: string
    
    // Logout Modal
    logoutReady: string
    logoutDesc: string
    logoutCancel: string
    logoutConfirm: string
    logoutSecuring: string

    // Agents Page
    agentHeader: string
    agentSubheader: string
    agentOrchStatus: string
    agentOrchLog: string
    agentConfidence: string
    agentAction: string
    agentSystemLogs: string

    // Agent Names & Findings
    agentNameOrch: string
    agentNameSpend: string
    agentNameCash: string
    agentNameDebt: string
    
    agentFindingOrch: string
    agentFindingSpend: string
    agentFindingCash: string
    agentFindingDebt: string

    agentRecOrch: string
    agentRecSpend: string
    agentRecCash: string
    agentRecDebt: string

    // Savings Page
    saveHeader: string
    saveSubheader: string
    saveTotalLabel: string
    saveActiveGoals: string
    savePocketEmerg: string
    savePocketLaptop: string
    savePocketRent: string
    saveGoalMet: string
    saveCreatePocket: string
    saveSmartAuto: string
    saveSmartDesc: string
    saveAddFunds: string
    saveAddPocket: string
    saveGoalName: string
    saveTargetAmount: string
    saveInitialDeposit: string
    saveChooseIcon: string
    saveAddFundsTo: string
    saveAmountToSave: string
    saveConfirmDeposit: string
    saveEditPocket: string
    saveDeletePocket: string
    saveDeleteConfirm: string
    saveDeleteNotice: string
    saveUpdatePocket: string

    // Reports Page
    reportHeader: string
    reportSubheader: string
    reportBreakdown: string
    reportMilestones: string
    reportMileEmerg: string
    reportMileEmergDesc: string
    reportMileDebt: string
    reportMileDebtDesc: string
    reportProjBal: string
    reportProjDesc: string

    // Coach Page
    coachHeader: string
    coachSubheader: string
    coachInputPlaceholder: string
    coachChipLimit: string
    coachChipSafe: string
    coachChipSave: string
  }
}

export const t: Translations = {
  en: {
    navHome: "Home",
    navAgents: "Agents",
    navSave: "Save",
    navReports: "Reports",
    navPay: "PAY",
    navCards: "Cards",

    dashGreeting: "Hi",
    dashStatus: "Status",
    dashStrong: "Strong",
    dashWatch: "Watch",
    dashBalance: "Balance",
    dashSafeDaily: "Safe Daily",
    dashLimitsImpulse: "Limits impulse risk",
    dashNextIn: "Next in",
    dashDays: "days",

    actionTransaction: "Transaction",
    actionTransfer: "Transfer",
    actionBills: "Bills",
    actionShield: "Shield",

    sectionHealthCheck: "Financial Health Check",
    riskCashflow: "Cashflow Risk",
    riskDebtShield: "Debt Shield Score",
    sectionInsights: "Active Insights",
    insightBrokeDate: "Broke Date Warning",
    insightBrokeDesc: "Your current spending pace will lead to a RM0 balance. Activate Budget Guard.",
    insightSavings: "Savings Opportunity",
    insightSavingsDesc: "Saving just RM2.50/day will secure your Laptop Fund by August. Start Auto-Save?",
    sectionRecent: "Recent Activity",
    viewAll: "VIEW ALL",

    resModalTitle: "Resilience Score",
    resModalExcellent: "Excellent",
    resModalStable: "Stable",
    resModalNeedsAttention: "Needs Attention",
    resModalDesc: "Your Resilience Score is the heartbeat of your financial health.",
    resModalCashflow: "Cashflow Safety",
    resModalSavings: "Savings Progress",
    resModalDebt: "Debt Health",
    resModalAI: "AI Recommendation",
    resModalAIDesc: "To reach a 'Strong' 75% score, try keeping your daily expenses under RM15 for the next 3 days. Your Debt Health is currently excellent!",

    settingsPreferences: "Preferences",
    settingsSmartNotif: "Smart Notifications",
    settingsDebtAuto: "Debt Shield Auto-Analyze",
    settingsAccount: "Account",
    settingsLanguage: "Language / Bahasa",
    settingsPaymentMethods: "Payment Methods",
    settingsProfile: "Profile Information",
    settingsHelp: "Help & Support",
    settingsSecureSession: "Secure Session",
    settingsSignOut: "Sign Out securely",

    logoutReady: "Ready to go?",
    logoutDesc: "Your financial data is securely saved. You will need to re-authenticate to access your dashboard.",
    logoutCancel: "Cancel",
    logoutConfirm: "Sign Out",
    logoutSecuring: "Securing...",

    // Agents Page
    agentHeader: "Agent Command",
    agentSubheader: "Orchestrating 10 financial guardians",
    agentOrchStatus: "ACTIVE",
    agentOrchLog: '"Analyzing user behavior... all agents synchronized. Current priority: Cashflow protection."',
    agentConfidence: "Confidence",
    agentAction: "ACTION",
    agentSystemLogs: "System Logs",

    // Agent Names & Findings
    agentNameOrch: "Orchestrator Agent",
    agentNameSpend: "Spending Sense Agent",
    agentNameCash: "Cashflow Prediction Agent",
    agentNameDebt: "Debt Shield Agent",
    
    agentFindingOrch: "System nominal. Monitoring cashflow.",
    agentFindingSpend: "Food spending is 15% above average.",
    agentFindingCash: "Predicted broke date: 18 May",
    agentFindingDebt: "No new debt detected.",

    agentRecOrch: "No action needed",
    agentRecSpend: "Limit GrabFood to RM15/day",
    agentRecCash: "Activate Budget Guard",
    agentRecDebt: "Continue monitoring",

    // Savings Page
    saveHeader: "Savings Pockets",
    saveSubheader: "Automated goal tracking",
    saveTotalLabel: "Total Saved",
    saveActiveGoals: "Active Goals",
    savePocketEmerg: "Emergency Fund",
    savePocketLaptop: "Laptop Fund",
    savePocketRent: "Rent Buffer",
    saveGoalMet: "Goal Met",
    saveCreatePocket: "Create New Pocket",
    saveSplitSummary: "Saving will be split between {count} pockets (RM {amount} each)",
    saveMode: "Management Mode",
    saveModeSavings: "Safe Savings",
    saveModeGrowth: "Growth Portfolio",
    saveRiskLevel: "Risk Profile",
    saveRiskLow: "Low (Stable)",
    saveRiskMed: "Medium (Balanced)",
    saveRiskHigh: "High (Growth)",
    saveInvestedBadge: "Managed",
    saveSmartAuto: "Smart Auto-Save",
    saveSmartDesc: "Moving RM 2.00 daily to Emergency Fund",
    saveAddFunds: "ADD FUNDS",
    saveAddPocket: "New Savings Goal",
    saveGoalName: "Goal Name",
    saveTargetAmount: "Target Amount (RM)",
    saveInitialDeposit: "Initial Deposit (RM)",
    saveChooseIcon: "Choose Icon",
    saveAddFundsTo: "Add Funds to",
    saveAmountToSave: "Amount to Save (RM)",
    saveConfirmDeposit: "Confirm Deposit",
    saveEditPocket: "Edit Pocket",
    saveDeletePocket: "Delete Pocket",
    saveDeleteConfirm: "Are you sure?",
    saveDeleteNotice: "The balance in this pocket will be returned to your main account.",
    saveUpdatePocket: "Update Pocket",

    // Reports Page
    reportHeader: "Reports & Insights",
    reportSubheader: "Data-driven financial clarity",
    reportBreakdown: "Spending Breakdown",
    reportMilestones: "In-Progress Milestones",
    reportMileEmerg: "Emergency Fund 50%",
    reportMileEmergDesc: "You are RM165 away from your first major milestone.",
    reportMileDebt: "Debt-Free Month",
    reportMileDebtDesc: "Keep it up! 12 days without BNPL usage.",
    reportProjBal: "Projected Month-End Balance",
    reportProjDesc: "Based on current cashflow agents.",

    // Coach Page
    coachHeader: "Resilience Coach",
    coachSubheader: "Ask me anything about your finances",
    coachInputPlaceholder: "Ask about your spending...",
    coachChipLimit: "How to limit impulse buys?",
    coachChipSafe: "What is my safe daily spend?",
    coachChipSave: "How to save for a laptop?",
  },
  ms: {
    navHome: "Utama",
    navAgents: "Ejen",
    navSave: "Simpan",
    navReports: "Laporan",
    navPay: "BAYAR",
    navCards: "Kad",

    dashGreeting: "Hai",
    dashStatus: "Status",
    dashStrong: "Kukuh",
    dashWatch: "Awas",
    dashBalance: "Baki",
    dashSafeDaily: "Perbelanjaan Harian",
    dashLimitsImpulse: "Kawal nafsu belanja",
    dashNextIn: "Masuk dlm",
    dashDays: "hari",

    actionTransaction: "Transaksi",
    actionTransfer: "Pindah",
    actionBills: "Bil",
    actionShield: "Pelindung",

    sectionHealthCheck: "Pemeriksaan Kewangan",
    riskCashflow: "Risiko Aliran Tunai",
    riskDebtShield: "Skor Pelindung Hutang",
    sectionInsights: "Maklumat Aktif",
    insightBrokeDate: "Amaran Pokai",
    insightBrokeDesc: "Corak perbelanjaan anda akan menyebabkan baki RM0. Aktifkan Pengawal Bajet.",
    insightSavings: "Peluang Simpanan",
    insightSavingsDesc: "Simpan hanya RM2.50/hari untuk Dana Komputer Riba menjelang Ogos. Mulakan Simpanan Automatik?",
    sectionRecent: "Aktiviti Terkini",
    viewAll: "LIHAT SEMUA",

    resModalTitle: "Skor Ketahanan",
    resModalExcellent: "Cemerlang",
    resModalStable: "Stabil",
    resModalNeedsAttention: "Perlu Perhatian",
    resModalDesc: "Skor Ketahanan adalah nadi kesihatan kewangan anda.",
    resModalCashflow: "Keselamatan Aliran Tunai",
    resModalSavings: "Kemajuan Simpanan",
    resModalDebt: "Kesihatan Hutang",
    resModalAI: "Cadangan AI",
    resModalAIDesc: "Untuk mencapai skor 75% 'Kukuh', cuba kekalkan perbelanjaan harian di bawah RM15 selama 3 hari akan datang. Kesihatan Hutang anda kini cemerlang!",

    settingsPreferences: "Pilihan",
    settingsSmartNotif: "Notifikasi Pintar",
    settingsDebtAuto: "Analisis Auto Pelindung Hutang",
    settingsAccount: "Akaun",
    settingsLanguage: "Language / Bahasa",
    settingsPaymentMethods: "Cara Pembayaran",
    settingsProfile: "Maklumat Profil",
    settingsHelp: "Bantuan & Sokongan",
    settingsSecureSession: "Sesi Selamat",
    settingsSignOut: "Log Keluar dengan selamat",

    logoutReady: "Sedia untuk keluar?",
    logoutDesc: "Data kewangan anda disimpan dengan selamat. Anda perlu log masuk semula untuk mengakses papan pemuka anda.",
    logoutCancel: "Batal",
    logoutConfirm: "Log Keluar",
    logoutSecuring: "Mengamankan...",

    // Agents Page
    agentHeader: "Pusat Arahan Ejen",
    agentSubheader: "Mengurus 10 pengawal kewangan",
    agentOrchStatus: "AKTIF",
    agentOrchLog: '"Menganalisis tingkah laku pengguna... semua ejen disegerakkan. Keutamaan: Perlindungan aliran tunai."',
    agentConfidence: "Keyakinan",
    agentAction: "TINDAKAN",
    agentSystemLogs: "Log Sistem",

    // Agent Names & Findings
    agentNameOrch: "Ejen Pengurus Utama",
    agentNameSpend: "Ejen Analisis Belanja",
    agentNameCash: "Ejen Ramalan Tunai",
    agentNameDebt: "Ejen Pelindung Hutang",
    
    agentFindingOrch: "Sistem normal. Memantau aliran tunai.",
    agentFindingSpend: "Perbelanjaan makanan 15% lebih dari biasa.",
    agentFindingCash: "Tarikh pokai diramal: 18 Mei",
    agentFindingDebt: "Tiada hutang baharu dikesan.",

    agentRecOrch: "Tiada tindakan diperlukan",
    agentRecSpend: "Hadkan GrabFood kepada RM15/hari",
    agentRecCash: "Aktifkan Pengawal Bajet",
    agentRecDebt: "Teruskan pemantauan",

    // Savings Page
    saveHeader: "Poket Simpanan",
    saveSubheader: "Penjejakan matlamat automatik",
    saveTotalLabel: "Jumlah Disimpan",
    saveActiveGoals: "Matlamat Aktif",
    savePocketEmerg: "Dana Kecemasan",
    savePocketLaptop: "Dana Komputer Riba",
    savePocketRent: "Penampan Sewa",
    saveGoalMet: "Matlamat Tercapai",
    saveCreatePocket: "Cipta Poket Baharu",
    saveSplitSummary: "Simpanan akan dibahagikan antara {count} poket (RM {amount} setiap satu)",
    saveMode: "Mod Pengurusan",
    saveModeSavings: "Simpanan Selamat",
    saveModeGrowth: "Portfolio Pertumbuhan",
    saveRiskLevel: "Profil Risiko",
    saveRiskLow: "Rendah (Stabil)",
    saveRiskMed: "Sederhana (Seimbang)",
    saveRiskHigh: "Tinggi (Pertumbuhan)",
    saveInvestedBadge: "Diuruskan",
    saveSmartAuto: "Simpanan Automatik Pintar",
    saveSmartDesc: "Memindahkan RM 2.00 setiap hari ke Dana Kecemasan",
    saveAddFunds: "TAMBAH DANA",
    saveAddPocket: "Matlamat Simpanan Baru",
    saveGoalName: "Nama Matlamat",
    saveTargetAmount: "Jumlah Sasaran (RM)",
    saveInitialDeposit: "Deposit Permulaan (RM)",
    saveChooseIcon: "Pilih Ikon",
    saveAddFundsTo: "Tambah Dana ke",
    saveAmountToSave: "Jumlah Simpanan (RM)",
    saveConfirmDeposit: "Sahkan Deposit",
    saveEditPocket: "Edit Poket",
    saveDeletePocket: "Padam Poket",
    saveDeleteConfirm: "Adakah anda pasti?",
    saveDeleteNotice: "Baki dalam poket ini akan dikembalikan ke akaun utama anda.",
    saveUpdatePocket: "Kemaskini Poket",

    // Reports Page
    reportHeader: "Laporan & Maklumat",
    reportSubheader: "Kejelasan kewangan dipacu data",
    reportBreakdown: "Pecahan Perbelanjaan",
    reportMilestones: "Pencapaian Sedang Berjalan",
    reportMileEmerg: "Dana Kecemasan 50%",
    reportMileEmergDesc: "Anda kekurangan RM165 lagi untuk pencapaian pertama.",
    reportMileDebt: "Bulan Bebas Hutang",
    reportMileDebtDesc: "Teruskan! 12 hari tanpa penggunaan BNPL.",
    reportProjBal: "Unjuran Baki Akhir Bulan",
    reportProjDesc: "Berdasarkan ejen aliran tunai semasa.",

    // Coach Page
    coachHeader: "Jurulatih Ketahanan",
    coachSubheader: "Tanya apa sahaja tentang kewangan anda",
    coachInputPlaceholder: "Tanya tentang perbelanjaan anda...",
    coachChipLimit: "Cara elak beli ikut nafsu?",
    coachChipSafe: "Berapa bajet harian saya?",
    coachChipSave: "Cara simpan untuk komputer riba?",
  }
}
