# Documentation Directory

This directory contains all documentation for the Open Roundup project, published via **GitHub Pages** using **Jekyll**.

## Structure

```
docs/
├── _config.yml           # Jekyll config used by GitHub Pages (/docs source)
├── _layouts/
│   └── workflow.html     # Workflow layout
├── index.md              # Main documentation homepage
├── guides/               # User and developer guides
│   ├── quick-start.md   # Getting started (5 min guide)
│   ├── using-the-app.md # Application feature guide
│   ├── development-setup.md      # Dev environment setup
│   ├── faq.md           # Frequently asked questions
│   ├── troubleshooting.md        # Common problems & solutions
│   └── ...more guides
└── workflows/            # Reproducible workflow documentation
    ├── example-2018-voter-registration.md
    └── ...more workflows
```

## Types of Documentation

### 1. Guides (User & Developer)

Located in `docs/guides/`, these help people learn how to:

- Use the application
- Set up development environment
- Contribute to the project
- Troubleshoot problems

**File it here if:** It's instructional content helping people do something.

### 2. Workflow Documentation

Located in `docs/workflows/`, these document real-world data journalism examples.

Each workflow includes:

- Overview and data sources
- Step-by-step workflow breakdown
- Tools and technologies used
- Complete reproduction instructions
- Challenges and solutions
- Results and findings

**File it here if:** It documents a real data journalism project.

## Creating Documentation

### Quick Steps

1. **Create a markdown file** in the appropriate directory:
   - User guide? → `docs/guides/[name].md`
   - Workflow? → `docs/workflows/[name].md`

2. **Add YAML front matter** at the top:

   ```yaml
   ---
   layout: default
   title: "Page Title"
   permalink: /guides/page-name/
   ---
   ```

3. **Write your content** using Markdown

4. **Commit and push** - GitHub builds and deploys automatically!

### Full Documentation Templates

See the root directory for templates:

- **[DOCUMENTATION_TEMPLATE.md](../DOCUMENTATION_TEMPLATE.md)** - Complete guide with examples
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - How to contribute documentation

## Front Matter Reference

### For All Pages

```yaml
---
layout: default
title: "Your Page Title"
permalink: /guides/your-page-name/
---
```

| Field       | Purpose                             | Required    |
| ----------- | ----------------------------------- | ----------- |
| `layout`    | Page template (default or workflow) | Yes         |
| `title`     | Page title shown in browser         | Yes         |
| `permalink` | URL path for the page               | Recommended |

### For Workflow Pages

```yaml
---
layout: workflow
title: "[Publication] - [Topic]"
author: "Author Name"
publication: "Publication Name"
date: "2024-01-01"
original_url: "https://..."
github_url: "https://..."
category: "stack"
difficulty: "simple"
---
```

Additional fields for workflows (see [DOCUMENTATION_TEMPLATE.md](../DOCUMENTATION_TEMPLATE.md) for details).

## Writing Guidelines

### Do ✅

- Use clear, descriptive headings (H2: ##, H3: ###)
- Include code examples with syntax highlighting:
  ````markdown
  ```python
  print("Hello, World!")
  ```
  ````
- Link to related pages using relative paths
- Use descriptive link text: `[Quick Start Guide](quick-start.md)`
- Include images with captions for complex topics
- Test links before submitting
- Keep sentences and paragraphs concise

### Don't ❌

- Use complex jargon without explanation
- Leave out important details
- Use non-descriptive link text like "Click here"
- Include outdated information
- Forget to proofread
- Go too deep without heading structure

## Markdown Tips

### Links to Other Pages

```markdown
# Within docs folder

[Quick Start](quick-start.md)
[Workflow Example](workflows/example-2018-voter-registration.md)

# In the root

[Contributing](../CONTRIBUTING.md)
[Setup Info](../GITHUB_PAGES_SETUP.md)
```

### Code Blocks

````markdown
```python
# Python code
import pandas as pd
df = pd.read_csv('data.csv')
```

```sql
-- SQL example
SELECT * FROM voters WHERE year = 2018;
```

```bash
# Terminal commands
npm install
npm run dev
```
````

### Other Formatting

```markdown
**Bold text** for emphasis
_Italic text_ for softer emphasis
`inline code` for commands or filenames

> Quoted text
> Can span multiple lines

- Bullet list
- Another item

1. Numbered list
2. Another item

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
```

## Publishing Process

The entire documentation site is built and published automatically:

1. You edit markdown files in `docs/`
2. You commit and push to GitHub
3. GitHub Pages builds the Jekyll site
4. Site is live at `https://steve-kasica.github.io/open-roundup/`

**Time to publish:** 1-2 minutes after push

## Local Development

To preview changes before pushing:

```bash
# Install dependencies (first time only)
cd /path/to/open-roundup
bundle install

# Start local server
bundle exec jekyll serve --source docs --config docs/_config.yml

# View at http://localhost:4000
```

See [GITHUB_PAGES_SETUP.md](../GITHUB_PAGES_SETUP.md) for detailed setup instructions.

## Customization

To customize the site appearance:

### Change Theme

Edit `docs/_config.yml`:

```yaml
theme: jekyll-theme-minimal
# Try: jekyll-theme-architect, jekyll-theme-cayman, etc.
```

### Customize Workflow Layout

Edit `docs/_layouts/workflow.html`:

- Change colors and styling
- Modify metadata display
- Add new sections

### Edit Site-Wide Settings

Edit `docs/_config.yml`:

- Site title
- Site description
- Logo image
- Excluded files

## File Best Practices

### Naming Conventions

- Use lowercase with hyphens: `quick-start.md`, `voter-registration.md`
- Be descriptive: `guide-name.md` not `doc1.md`
- Match permalink: `quick-start.md` → `permalink: /guides/quick-start/`

### File Organization

- Guides go in `docs/guides/`
- Workflows go in `docs/workflows/`
- Keep related files together
- Don't create deep nesting

### File Size

- Keep individual files under 5000 words
- Split long documentation into multiple pages
- Link between related pages

## Examples

### Simple Guide Example

```markdown
---
layout: default
title: "My Guide"
permalink: /guides/my-guide/
---

# My Guide

## Introduction

What this guide covers.

## Prerequisites

What you need first.

## Step-by-Step

1. First step
2. Second step

## Troubleshooting

Common issues.
```

### Simple Workflow Example

```markdown
---
layout: workflow
title: "Publication - Topic"
author: "Author"
publication: "Publication"
date: "2024-01-01"
original_url: "https://..."
github_url: "https://..."
category: "stack"
difficulty: "simple"
---

# Title

## Overview

Brief description.

## Data Sources

Where data comes from.

## How to Reproduce

Steps to redo the analysis.
```

## Support & Questions

- **Having trouble writing markdown?** - See examples above
- **Questions about Jekyll?** - See [GITHUB_PAGES_SETUP.md](../GITHUB_PAGES_SETUP.md)
- **How to contribute?** - See [CONTRIBUTING.md](../CONTRIBUTING.md)
- **Need help?** - Open an issue on GitHub

## See Also

- **[DOCUMENTATION_TEMPLATE.md](../DOCUMENTATION_TEMPLATE.md)** - Complete templates and guidance
- **[CONTRIBUTING.md](../CONTRIBUTING.md)** - How to contribute
- **[GITHUB_PAGES_SETUP.md](../GITHUB_PAGES_SETUP.md)** - Technical setup details
- **[Jekyll Docs](https://jekyllrb.com/docs/)** - Official Jekyll documentation

---

**Ready to write?** Start with a guide in `docs/guides/` or a workflow in `docs/workflows/`!
