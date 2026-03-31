

# Plan: Stocknix Prompt Complet — 30 Corrections

This document requests 30 corrections across roles, navigation, POS, reports, dashboards, profile, settings, and more. After auditing the codebase, many items are **partially done** but need refinement. Here is the complete plan.

---

## Current State Assessment

| Area | Status |
|------|--------|
| PREDEFINED_ROLES (TeamManagement) | Partially done — missing descriptions, icons, colors, deliveries perm for Stock |
| hasPermission (AuthContext) | Done but missing `settings: false` handling for Manager |
| shouldShowGroup / filterItems (AppSidebar) | Mostly done, Factures/Devis missing from BOUTIQUE group |
| BottomNav role navs | Done |
| RoleDashboard order | Wrong — Fusionné tested AFTER Stock/Commandes |
| PIN 6 digits (Caisse) | Done |
| sessionPin verification | Done |
| effectiveUserId in Caisse | Needs verification |
| created_by_member_id migration | Needs SQL migration |
| Performance employee filter | Partially done |
| RapportEmployes Manager access | Needs fix |
| ProtectedRoute — /app/performance | Still requires 'reports' permission — must remove |
| CommandesDashboard | Needs real data |
| FusionDashboard | Needs real data |
| Profile employee view | Not implemented — employees see full owner profile |
| Settings role filter | Done |
| InvoiceEditor 4-step | Partially done |
| LivreurDashboard lock | Already has LockScreen |
| Stock alerts realtime | Hook exists but not wired in AppLayout |
| Bouton livraison (StoreOrders) | Done |
| Employee session timeout | Not in AuthContext |

---

## Implementation Plan

### Step 1 — Roles & Permissions (4 files)

**TeamManagement.tsx**: Update `PREDEFINED_ROLES` to include full descriptions, icons, colors, and correct permissions (add `deliveries: true, reports: true` to Stock role).

**AuthContext.tsx**: Fix `hasPermission` to handle Manager's `settings: false` case:
```
if (perms.all === true) {
  if (module === "settings") return perms.settings !== false;
  return true;
}
```
Add employee session timeout via `useEffect` using `company.lock_timeout_minutes`.

**ProtectedRoute.tsx**: Remove `/app/performance': 'reports'` from `ROUTE_PERMISSIONS` so all employees can access Performance (the page itself handles filtering).

### Step 2 — Navigation (2 files)

**AppSidebar.tsx**: Add Factures and Devis items to the BOUTIQUE EN LIGNE group. Ensure `filterItems` shows them for Commandes and Fusionné roles.

**RoleDashboard.tsx**: Fix detection order — test `fusionn` BEFORE `stock` and `commande`:
```
if (role.includes('manager')) return <ManagerDashboard />;
if (role.includes('caissier')) return <CaissierDashboard />;
if (role.includes('livreur')) return <LivreurRoleDashboard />;
if (role.includes('fusionn')) return <FusionDashboard />;
if (role.includes('commande')) return <CommandesDashboard />;
if (role.includes('stock')) return <StockDashboard />;
```

### Step 3 — POS Caisse Corrections (1 file)

**Caisse.tsx**: 
- Ensure `effectiveUserId` is used consistently in all Supabase queries (session, movements, categories).
- Fix cashier name in close report to use `memberInfo.member_first_name` for employees.
- Add sale guard: block `handleSale` if `currentSession` is not open.

### Step 4 — SQL Migration

Create migration to add `created_by_member_id` column to `sales` table:
```sql
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS created_by_member_id UUID
REFERENCES public.company_members(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sales_member_id
ON public.sales(created_by_member_id);
```

### Step 5 — useSales.ts — Insert created_by_member_id

Update `addSale` / `createSale` to include `created_by_member_id: isEmployee ? memberInfo?.member_id : null` in sale data.

### Step 6 — Reports & Performance (2 files)

**Performance.tsx**: Add `isPersonalView` logic — employees without `all` permission only see their own sales filtered by `created_by_member_id`.

**RapportEmployes.tsx**: 
- Allow Manager access (don't block if `role.includes('manager')`).
- Implement real stats calculation (today/week/month/year) using `isWithinInterval` from date-fns.

### Step 7 — Dashboards (2 files)

**CommandesDashboard.tsx**: Full rebuild with real data from `useStoreOrders` and `useInvoices`. Show pending orders count, today's orders, total invoices, quick action buttons.

**FusionDashboard.tsx**: Full rebuild with real data from `useProducts`, `useStoreOrders`. Show product count, low stock alerts, pending orders, quick action buttons for stocks/boutique/factures/devis/livraisons.

### Step 8 — Profile Employee View (1 file)

**Profile.tsx**: Add early return for employees showing a simplified read-only profile card with their name, role, company name, and avatar — no password change, no email edit.

### Step 9 — Stock Alerts in AppLayout (1 file)

**AppLayout.tsx**: Wire `useStockAlerts(effectiveUserId)` to trigger toast notifications when product quantity drops below minimum.

### Step 10 — LivreurDashboard Lock (already done)

Already has `LockScreen` and `useAutoLock`. No changes needed.

---

## Technical Details

### Files to Create
- `supabase/migrations/XXXXXXXX_add_created_by_member_id.sql`

### Files to Modify
- `src/pages/TeamManagement.tsx` — PREDEFINED_ROLES
- `src/contexts/AuthContext.tsx` — hasPermission + session timeout
- `src/components/layout/AppSidebar.tsx` — BOUTIQUE group items
- `src/components/layout/BottomNav.tsx` — minor (already mostly correct)
- `src/components/dashboard/RoleDashboard.tsx` — detection order
- `src/pages/Caisse.tsx` — effectiveUserId, cashier name, sale guard
- `src/hooks/useSales.ts` — created_by_member_id
- `src/pages/Performance.tsx` — employee filter
- `src/pages/RapportEmployes.tsx` — Manager access + real stats
- `src/components/dashboard/CommandesDashboard.tsx` — real data
- `src/components/dashboard/FusionDashboard.tsx` — real data
- `src/pages/Profile.tsx` — employee view
- `src/components/auth/ProtectedRoute.tsx` — remove performance restriction
- `src/components/layout/AppLayout.tsx` — stock alerts

### No Breaking Changes
All modifications are additive or corrective. No routes change, no DB schema breaks.

