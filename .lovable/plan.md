

# Fix: Admin Signup Not Assigning Role

## Problem
The `handle_new_user()` database function exists but **no trigger** is attached to `auth.users` to invoke it on signup. So when you sign up, no row is inserted into `user_roles` or `profiles`. The role query returns `[]`, meaning `role` is `null` -- you land on the dashboard without admin privileges (effectively a "viewer" experience).

## Solution

### 1. Create the missing trigger (database migration)
Attach a trigger on `auth.users` AFTER INSERT that calls `handle_new_user()`:
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 2. Fix existing user's missing role
Insert the admin role for the already-signed-up user (`fe96fc6b-5fd5-4c04-b8a8-7e645ed9edff`), and create their profile row:
```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('fe96fc6b-5fd5-4c04-b8a8-7e645ed9edff', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO public.profiles (user_id, display_name)
VALUES ('fe96fc6b-5fd5-4c04-b8a8-7e645ed9edff', 'salina pradhan')
ON CONFLICT (user_id) DO NOTHING;
```

### 3. No frontend changes needed
The `AuthContext` already fetches the role from `user_roles` and the routing logic is correct. Once the role row exists, the admin dashboard will load properly.

## Technical Details
- The trigger must be on `auth.users` (not the public schema), using `SECURITY DEFINER` on the function (already set)
- The `handle_new_user` function already handles first-admin logic: if `role=admin` is requested and no admin exists yet, it grants admin; otherwise it falls back to `viewer`
- Since this user is the first signup, they will correctly get `admin`

