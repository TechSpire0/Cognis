# COGNIS Color Palette Migration Guide

## New Dark Modern Color Palette

### Primary Colors
- **Primary Background**: `#0D1117` - Main background across all screens
- **Card / Surface**: `#161B22` - Cards, panels, and elevated surfaces
- **Accent (Primary)**: `#00BFA5` - Main accent for buttons, highlights, active states
- **Accent (Secondary)**: `#6C63FF` - Secondary accent for analytical/AI components
- **Highlight / Hover**: `#03DAC6` - Hover and interaction feedback
- **Text Primary**: `#E6EDF3` - Primary text for high readability
- **Text Secondary**: `#9BA1A6` - Secondary text for supporting information
- **Danger / Alerts**: `#FF5252` - Delete, warning, error indicators
- **Border**: `#30363D` - Borders and dividers

## Old → New Color Mapping

### Background Colors
- `bg-[#E7F2EF]` → `bg-[#161B22]` (cards/surfaces)
- `bg-[#19183B]` → `bg-[#0D1117]` or `bg-[#161B22]` (depending on context)
- `bg-[#A1C2BD]/30` → `bg-[#0D1117]` (darker backgrounds)
- `bg-[#708993]/20` → `bg-[#00BFA5]/10` or `bg-[#6C63FF]/10` (accent backgrounds)

### Text Colors
- `text-[#19183B]` → `text-[#E6EDF3]` (primary text)
- `text-[#708993]` → `text-[#9BA1A6]` (secondary text)
- `text-[#E7F2EF]` → `text-[#E6EDF3]` (light text)
- `text-[#A1C2BD]` → `text-[#9BA1A6]` (muted text)

### Border Colors
- `border-[#708993]` → `border-[#30363D]` (normal borders)
- `border-[#19183B]` → `border-[#00BFA5]` (accent borders/hover)
- `border-[#A1C2BD]` → `border-[#30363D]` (subtle borders)

### Button & Interactive States
- Primary button: `bg-[#00BFA5] text-[#0D1117] hover:bg-[#03DAC6]`
- Secondary button: `bg-[#6C63FF] text-[#E6EDF3] hover:bg-[#6C63FF]/80`
- Outline button: `border-[#30363D] text-[#9BA1A6] hover:bg-[#161B22] hover:text-[#E6EDF3]`
- Danger button: `bg-[#FF5252] text-[#E6EDF3] hover:bg-[#FF5252]/80`

### Badge Colors
- Success: `bg-[#00BFA5]/20 text-[#00BFA5] border-[#00BFA5]`
- Info: `bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]`
- Warning: `bg-[#9BA1A6]/20 text-[#9BA1A6] border-[#9BA1A6]`
- Danger: `bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]`

### Card Styling
- Normal card: `bg-[#161B22] border-[#30363D] card-glow`
- Hover state: `hover:border-[#00BFA5] glow-hover`

## Application Guidelines

1. **Consistent Background Hierarchy**: Use `#0D1117` for main page background, `#161B22` for cards and panels
2. **Text Hierarchy**: Primary headings use `#E6EDF3`, secondary text/labels use `#9BA1A6`
3. **Interactive Elements**: Use `#00BFA5` for primary actions, `#6C63FF` for AI/analytical features
4. **Hover States**: Apply `#03DAC6` for hover effects and active states
5. **Borders**: Use `#30363D` for subtle separation, `#00BFA5` for emphasis
6. **Utility Classes**: Use `glow-primary`, `glow-secondary`, `glow-hover`, and `card-glow` from globals.css
