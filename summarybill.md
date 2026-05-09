# Bills & Commitments Feature Summary

The **Bills & Commitments** feature is a financial protection layer for GX Wise students. It ensures that essential money (rent, utilities, education fees) is set aside before it can be accidentally spent on non-essentials.

## Core Capabilities

### 1. Onboarding Integration
- Automatically converts commitments entered during onboarding (Rent, Phone, Transport, PTPTN, Subscriptions) into manageable **Bill** records.
- No duplicate data entry required for new users.

### 2. Bill Lock (Protection)
- Users can "Lock" any bill.
- Locked amounts are subtracted from the **Spendable Balance**, effectively "hiding" that money from the daily spending limit and safe-to-spend metrics.
- This creates a psychological and functional barrier against overspending.

### 3. Simulated AutoPay
- **Safety First**: AutoPay checks the user's financial health before executing.
- **Safety Rules**:
  - **Strict**: Only pays if the remaining balance allows for a healthy daily budget (RM10+/day).
  - **Balanced**: Pays if the bill is already locked/protected.
  - **Flexible**: Pays if there is enough total balance.
- **Setup Required**: AutoPay only activates once the user provides an account or reference number, encouraging financial organization.

### 4. Smart Insights & Coach Integration
- **Dashboard Nudges**: Shows exactly how much is protected and what's next.
- **Resilience Coach**: DuitBuddy and the Resilience Council can now answer questions like *"How much is locked for bills?"* or *"Can I afford my phone bill?"*
- **Reports**: Bill impact is now visible in the monthly financial summary.

## Data Security & Privacy
- **Masked Data**: Account numbers are masked in the UI (`****1234`).
- **Local Persistence**: All bill data is saved locally on the device using Zustand persistence; no sensitive data is sent to external servers.

## Simulated Behavior
- This feature is a **functional prototype**. No real banking transactions or bill payments are made. It creates "bill" type transactions within the app to demonstrate the budget impact.
