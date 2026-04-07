

# Fix: Add missing `NavSection` interface in BottomNav.tsx

## Problem
Build error: `Cannot find name 'NavSection'` at line 32 in `BottomNav.tsx`. The interface is used but never declared.

## Fix
Add the `NavSection` interface definition after the existing `NavItem` interface (around line 16):

```typescript
interface NavSection {
  section: string;
  items: NavItem[];
}
```

This is a one-line interface addition. No other files need changes.

