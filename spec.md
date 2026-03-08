# FilmUpload

## Current State

A cinema-themed film upload and browsing app with:
- Navbar with logo, Browse/Upload nav links, and Sign In/Out button
- BrowsePage with a hero section, sticky genre filter bar + search, and a film grid
- FilmDetailPage with poster, metadata, video player, and delete option
- UploadPage with a form for title, description, genre, year, poster, and video
- FilmCard component with poster, genre badge, hover play overlay
- Footer with branding
- Dark cinematic design (obsidian + amber gold) using Fraunces display font and Outfit body font
- Sample films shown when no backend data available

## Requested Changes (Diff)

### Add
- Featured/spotlight film banner at top of BrowsePage (highlights the most recently added film with a large hero visual)
- "Recently Added" horizontal scroll section showing the latest films with larger cards
- Hindi language support in the UI labels and placeholder text (bilingual: English + Hindi)
- Film count badge on genre filter tabs
- Improved empty state with a call-to-action upload button
- "Back to top" floating button on long pages

### Modify
- Hero section: make it more immersive — use a cinematic widescreen ratio, bigger typography, more dramatic overlay
- FilmCard: add description snippet (1 line) beneath the title for richer context
- Navbar: make it slightly taller with better visual separation, show Upload button even when logged out (disabled with tooltip "Sign in to upload")
- BrowsePage: improve the filter/search bar sticky behavior and visual clarity
- Footer: add quick links (Browse, Upload) and a Hindi tagline line

### Remove
- Nothing to remove

## Implementation Plan

1. Update BrowsePage hero to be more immersive with larger text and subtitle in Hindi
2. Add "Recently Added" horizontal scroll row using the latest films
3. Update FilmCard to show a description snippet
4. Add film count badges to genre filter tabs
5. Improve empty state with upload CTA
6. Update Navbar to always show Upload link (disabled if not logged in) with tooltip
7. Update Footer with quick links and Hindi tagline
8. Add floating "back to top" button
9. Run validation
