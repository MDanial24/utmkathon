# Implementation Plan - Bills & Commitments Feature

This document outlines the plan to implement the **Bills & Commitments** feature for the GX Wise student fintech PWA. This feature enables users to manage their recurring financial obligations, protect bill money using **Bill Lock**, and simulate **AutoPay** behavior.

---

## 1. Current Codebase Audit

### Existing Relevant Routes
- `/dashboard`: Main entry point after onboarding.
- `/setup`: Onboarding flow where initial commitments are collected.
- `/transactions`: History of all financial movements.
- `/reports`: Financial health and impact summaries.

### Existing Dashboard Quick Actions
- Currently uses 4 columns: **Transaction**, **Transfer**, **Top Up**, **Shield**.
- Layout is defined in `src/components/Dashboard.tsx`.

### Existing Onboarding Commitment Data Structure
- Located in `src/app/setup/page.tsx`.
- Captures: `rent`, `phoneBill`, `transport`, `ptptn`, `subscriptions` (all as numbers).
- **Current Limitation**: These values are used to calculate `safeDailySpend` but are **not** currently saved as individual records in the Zustand store.

### Existing Zustand Store
- `src/store/useStore.ts` manages `user`, `transactions`, `savingsPockets`, and `agents`.
- Persistence is handled via `zustand/middleware` (`resilience-agent-storage`).
- No current `bills` or `commitments` array exists in the state.

### Existing Money Engine
- Logic is currently fragmented (e.g., `safeDailySpend` calculation inside `SetupPage`).
- No centralized `moneyEngine.ts` yet.

---

## 2. Proposed Bills & Commitments Feature Design

### Route
- `[NEW] /bills`: Main page for managing bills.

### Components
- `BillsPage`: Container component for the new route.
- `BillCard`: Displaying bill details (amount, due date, status) and actions (Lock, AutoPay).
- `AddBillModal`: Unified modal for adding or editing bills with templates.
- `AutoPayCheck`: A trigger/status component for the simulation.

### Store Enhancements (`src/store/useStore.ts`)
- **New State**: `bills: Bill[]`
- **New Derived State (Getters)**:
    - `getLockedBillsAmount()`: Sum of amounts for bills with `isLocked: true`.
    - `getSpendableBalance()`: `user.currentBalance - getLockedBillsAmount()`.
- **New Actions**:
    - `addBill(bill)`
    - `updateBill(id, updates)`
    - `deleteBill(id)`
    - `toggleBillLock(id)`
    - `toggleBillAutopay(id)`
    - `payBillNow(id)`
    - `processAutoPay()`: The core simulation engine.

### Onboarding Integration
- **Import Strategy**: Update `src/app/setup/page.tsx`'s `handleNext` to create `Bill` objects from the captured inputs and save them to the store's `bills` array.
- **Mapping**:
    - Rent -> Category: `Housing`, Name: `Rent / Hostel`
    - Phone Bill -> Category: `Utilities`, Name: `Phone Bill`
    - PTPTN -> Category: `Education`, Name: `PTPTN`
    - Subscriptions -> Category: `Entertainment`, Name: `Subscriptions`

### Bill Lock & AutoPay Simulation
- **Bill Lock**: Reduces `safeDailySpend` and `spendableBalance`. If a user attempts a transaction exceeding `spendableBalance`, a warning is shown.
- **AutoPay Simulation**: Runs on app load. If `autopayEnabled` and safety rules pass, it automatically creates a transaction and marks the bill as paid.

---

## 3. Data Model Proposal

```typescript
type BillFrequency = "one-time" | "weekly" | "monthly" | "yearly";

type BillStatus =
  | "upcoming"
  | "paid"
  | "missed"
  | "paused"
  | "needs_setup"
  | "low_balance";

type AutoPaySafety = "strict" | "balanced" | "flexible";

interface Bill {
  id: string;
  name: string;
  category: string;
  provider?: string;
  accountNumber?: string;
  referenceNumber?: string;
  amount: number;
  dueDay?: number; // e.g., 5th of every month
  dueDate?: string; // for one-time or specific dates
  nextDueDate: string;
  frequency: BillFrequency;
  isLocked: boolean;
  autopayEnabled: boolean;
  autopaySafety: AutoPaySafety;
  reminderDaysBefore: number;
  status: BillStatus;
  lastPaidAt?: string;
  source: "onboarding" | "manual" | "detected";
  createdAt: string;
}

interface BillPaymentRecord {
  id: string;
  billId: string;
  amount: number;
  paidAt: string;
  method: "manual" | "autopay";
  status: "paid" | "failed";
  transactionId: string;
}
```

---

## 4. Exact Files to Add/Modify

### [NEW]
- `src/app/bills/page.tsx`
- `src/components/Bills.tsx` (Main UI container)
- `src/components/bills/BillCard.tsx`
- `src/components/bills/AddBillModal.tsx`
- `src/lib/billEngine.ts` (Shared logic for dates and safety)

### [MODIFY]
- `src/store/useStore.ts`: Add `bills` state and actions.
- `src/app/setup/page.tsx`: Update to save commitments to the store.
- `src/components/Dashboard.tsx`: Add "Bills" quick action and bill insights.
- `src/components/Reports.tsx`: Include bill impact in the summary.
- `src/components/Transactions.tsx`: Add "bill" type support.
- `src/lib/translations.ts`: Add new strings for Bills feature (EN/MS).

---

## 5. Rules and Calculations

### Bill Lock Logic
- `lockedAmount = sum(bills.filter(b => b.isLocked && b.status !== "paid").map(b => b.amount))`
- `spendableBalance = totalBalance - lockedAmount`
- `safeDailySpend` should be adjusted to: `(monthlyAllowance - lockedAmount) / daysRemaining`

### AutoPay Safety Rules
1. **Strict**: Only pay if `spendableBalance - billAmount > (10 * daysUntilNextAllowance)`.
2. **Balanced**: Pay if `isLocked` is true AND `totalBalance >= billAmount`.
3. **Flexible**: Pay if `totalBalance >= billAmount`.

### Date Calculation
- Next due date is calculated based on `dueDay` and `frequency`. If `paid`, the `nextDueDate` advances by the frequency interval.

---

## 6. UX Flow

1. **Discovery**: User sees "Bills" button on Dashboard.
2. **Onboarding Import**: First-time users see their Rent/Phone bills already listed.
3. **Setup**: Bills from onboarding show "Complete Setup" to add Account Numbers.
4. **Protection**: User toggles "Bill Lock". Dashboard balance updates to show "RM XXX Protected".
5. **Automation**: User enables AutoPay. System runs check on load. Success/Warning nudges appear.
6. **History**: Paid bills generate transactions and appear in the "Paid" section of Bills page.

---

## 7. Acceptance Criteria

- [ ] Bills button appears in dashboard quick actions (horizontal scroll if needed).
- [ ] Onboarding commitments are successfully saved as Bill objects in the store.
- [ ] `/bills` page displays Protected Amount, Next Bill, and AutoPay status.
- [ ] Bill Lock reduces spendable balance shown on Dashboard.
- [ ] AutoPay only triggers if Account Number is present; otherwise, status is `needs_setup`.
- [ ] AutoPay simulation follows Safety Rules (Strict/Balanced/Flexible).
- [ ] Manual "Pay Now" creates a transaction of type `bill`.
- [ ] Bill status updates correctly (Upcoming -> Paid -> Next Due Date).
- [ ] All UI matches the existing "Liquid Glass" / Premium aesthetic.
- [ ] Multi-language support (EN/MS) for all new strings.

---

## 8. Risk and Safety Notes

- **Simulation Only**: All references to payments will use "Simulated" or "Demo" context.
- **No Data Loss**: Changes to `useStore.ts` will maintain backward compatibility with existing persisted state.
- **Static Compatibility**: No server-side logic; everything remains client-side/localStorage.
