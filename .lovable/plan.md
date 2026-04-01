

# Plan: Add Functional Dark/Light Mode Toggle

## What needs to happen

1. **Add light theme CSS variables** in `src/index.css` — define a proper light color palette under `:root` and move the current dark colors under `.dark`
2. **Create a `ThemeProvider` context** (`src/contexts/ThemeContext.tsx`) that reads/writes theme preference to `localStorage`, applies/removes the `dark` class on `<html>`, and exposes a `toggleTheme` function
3. **Wrap the app** with `ThemeProvider` in `src/main.tsx`
4. **Make the Settings page toggle functional** — wire the existing dark mode `Switch` to the theme context
5. **Add a small theme toggle button in the Header** (`src/components/layout/Header.tsx`) — a Sun/Moon icon button next to the bell icon, visible on all dashboards (admin, faculty, student)

## Files to create/modify

| File | Change |
|------|--------|
| `src/index.css` | Move dark colors to `.dark`, add light theme colors to `:root` |
| `src/contexts/ThemeContext.tsx` | New — theme context with localStorage persistence |
| `src/main.tsx` | Wrap app with `ThemeProvider` |
| `src/pages/Settings.tsx` | Wire dark mode switch to `useTheme()` |
| `src/components/layout/Header.tsx` | Add Sun/Moon toggle button |

## Light theme color palette

Professional university aesthetic — white/gray backgrounds, dark text, same primary (cyan-blue) and accent (green) hues adjusted for light backgrounds.

