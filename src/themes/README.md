# Themes


## Default
Notes on the choice of theme

## Font Family

This theme uses these san-serif fonts because they're clean, highly legible on screens, and work well at a various sizes.

1. _Inter_: Specifically designed for UI work with excellent legibility at small sizes. Great for data-dense interfaces
2. _Roboto_: Google's workhorse font, very readable and professional. Works well for both labels and data.
3. _IBM Plex Sans_: Designed for technical/data contexts, with good monospace companion options for tabular data.
4. _Source Sans Pro_:Adobe's versatile UI font with excellent clarity.
5. _San Francisco / Segoe UI (Mac / windows, respectively)_: Fast-loading and familiar to users.

These typefaces have the following advantages:

- Legibility at small sizes. Analytics often require compact displays
- Clear differentiation between similar characters (1, l, I or 0, O)
- Font weights availability: Multiple weights help establish visual hierarchy
- Tabular/lining figures: Numbers that align properly in tables

## Typography

### Primary Hierarchy (8 Levels)
1. title (32px, 700 weight) - Dashboard/page titles
2. section-title (24px, 600 weight) - Major section headers
3. subsection-title (18px, 600 weight) - Component headers, chart titles
4. label (14px, 600 weight, uppercase) - Metric labels, axis titles
5. data-primary (16px, 400 weight) - Main data content
6. data-secondary (14px, 400 weight) - Supporting metadata
7. data-small (12px, 400 weight) - Annotations, hints
8. data-micro (10px, 500 weight) - Compact labels, badges

### Special Purpose Variants
* metric-large (40px) - Key performance indicators
* metric-medium (28px) - Emphasized metrics
* code (14px, monospace) - SQL, technical IDs
* code-small (12px, monospace) - Small code snippets

### Key Design Principles Applied
* Scale ratios for visual harmony (1.25× ratio between levels)
* Negative letter-spacing on large text for better readability
* Increased letter-spacing on small text for clarity
* Weight differentiation between display and data text
* Monospace variants for technical content
* Semantic color usage (primary vs secondary text)