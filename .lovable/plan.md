

# Plan: Implement Assets & Staff CRUD + Password Visibility Toggle

## Two features in this plan

### Feature A: Password visibility toggle on Auth page

Add an eye/eye-off icon button to the password and confirm-password fields on both the Sign In and Sign Up forms, toggling between `type="password"` and `type="text"`.

**File:** `src/pages/Auth.tsx`
- Add `showLoginPassword`, `showSignupPassword`, `showSignupConfirmPassword` state booleans
- Replace the `Lock` icon area with a clickable Eye/EyeOff toggle on the right side of each password input
- Toggle input `type` between `"password"` and `"text"`

### Feature B: Full CRUD for Assets and Support Staff

#### 1. Database Migration
Create two tables:

```sql
-- assets table
CREATE TABLE public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL,
  type text NOT NULL DEFAULT 'equipment',
  location text,
  status text NOT NULL DEFAULT 'working',
  assigned_to text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
-- Admin full CRUD, authenticated read

-- support_staff table
CREATE TABLE public.support_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  department text NOT NULL,
  role text NOT NULL DEFAULT 'lab_assistant',
  shift text NOT NULL DEFAULT 'full_day',
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_staff ENABLE ROW LEVEL SECURITY;
-- Admin full CRUD, authenticated read
```

#### 2. Hooks
- **`src/hooks/useAssets.ts`** — fetch all assets, add, update, delete via Supabase
- **`src/hooks/useStaff.ts`** — fetch all support staff, add, update, delete via Supabase

#### 3. Form Dialogs
- **`src/components/forms/AssetFormDialog.tsx`** — add/edit asset (name, code, type, location, status, assigned_to)
- **`src/components/forms/StaffFormDialog.tsx`** — add/edit staff (name, email, department, role, shift, status)

#### 4. Pages (replace stubs)
- **`src/pages/Assets.tsx`** — table with filters (type, status), add/edit/delete buttons, stat cards
- **`src/pages/Staff.tsx`** — table with filters (role, status, department), add/edit/delete, stat cards

## Files

| File | Action |
|------|--------|
| Database migration | Create `assets` + `support_staff` tables with RLS |
| `src/pages/Auth.tsx` | Add Eye/EyeOff password visibility toggle |
| `src/hooks/useAssets.ts` | Create — CRUD hook |
| `src/hooks/useStaff.ts` | Create — CRUD hook |
| `src/components/forms/AssetFormDialog.tsx` | Create — form dialog |
| `src/components/forms/StaffFormDialog.tsx` | Create — form dialog |
| `src/pages/Assets.tsx` | Replace stub with full CRUD page |
| `src/pages/Staff.tsx` | Replace stub with full CRUD page |

