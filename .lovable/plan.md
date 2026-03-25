

# Plan: Remove Lovable Branding from Website

## Problem
The `index.html` file still contains Lovable branding in the page title, meta tags, and Open Graph images. This is what shows up on GitHub and when sharing the site link.

## Changes

### 1. Update `index.html`
Replace all Lovable references with your app's branding:

- **Title**: "Lovable App" → "TROS - University Resource Management"
- **Description**: "Lovable Generated Project" → "University Resource & Timetable Management System"
- **Author**: "Lovable" → "TROS"
- **OG tags**: Update `og:title`, `og:description`, remove Lovable OG image URL
- **Twitter tags**: Remove `@Lovable` site reference, remove Lovable image URL

### 2. Update `vite.config.ts`
The `lovable-tagger` plugin injects the Lovable badge component at build time. We'll remove it from the production build by conditionally disabling it (or removing the tagger call entirely).

## Files Modified
- `index.html` — Replace all Lovable branding with TROS branding
- `vite.config.ts` — Remove/disable `componentTagger` plugin

