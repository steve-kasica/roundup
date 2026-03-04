---
layout: default
title: "Quick Start Guide"
permalink: /guides/quick-start/
---

# Quick Start Guide

Get up and running with Open Roundup in just 5 minutes!

## What You'll Learn

By the end of this guide, you'll be able to:

- Access the Open Roundup application
- Browse example workflows
- Explore a workflow in detail

## Part 1: Accessing Open Roundup

### Option A: Online (Recommended for First-Time Users)

1. Open your browser to: `https://steve-kasica.github.io/open-roundup/`
2. You're now on the Open Roundup documentation site
3. Look for the "Application" link in the navigation to access the web app

### Option B: Running Locally (For Developers)

1. Clone the repository:

   ```bash
   git clone https://github.com/steve-kasica/open-roundup.git
   cd open-roundup
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser to: `http://localhost:5173`

## Part 2: Interface overview

When you upload tabular data files to Roundup, you'll see:

- **Objects List (left sidebar)** - List of data objects; tables, operations, columns; loaded into the application.
- **Root Operation Schema (left sidebar bottom)** - A visual representation of the root operation's schema, showing tables color-coded by operation.
- **Schema View (top middle/right window)** - A visual representation of focused object's schema, restricted to tables and operations.
- **Table View (bottom middle/right window)** - A tabular view of the focused object's data values, restricted to tables and operations.
- **Column View (right sidebar, on demand)** - A detailed view of a specific column's metadata and sample values, shown when a column is focused.

## Part 3: Browsing example workflows

You are able to upload your own data and explore, but you can also browse example workflows to see how journalists wrangled their data to produce real-world stories in code-based tools, such as Python and R, and how Roundup can reproduce the same workflows in a clicked-based interface.

1. Click "Browse Workflows" or find the workflows link in navigation
2. You'll see a list of available workflows
3. Each workflow shows:
   - **Title** - Name and publication
   - **Author** - The journalist who created it
   - **Category** - Stack, Pack, Hybrid, or Uncharacterized
   - **Difficulty** - Simple, Intermediate, or Advanced

### Filter by Category

Look for filters to narrow your view:

- **Stack** - Data transformation workflows
- **Pack** - Data merging workflows
- **Hybrid** - Combined transformation and merging
- **All** - Show all workflows

### Filter by Difficulty

- **Simple** ⭐ - Good for beginners
- **Intermediate** ⭐⭐ - Some experience helpful
- **Advanced** ⭐⭐⭐ - Advanced skills needed

## Part 4: Exploring a Workflow

### Click on a Workflow

Try: **Maryland Voter Registration Analysis** by Baltimore Sun (difficulty: Simple)

1. Click on the workflow title
2. You'll see detailed documentation including:
   - **Overview** - What the workflow does
   - **Data Sources** - Where the data comes from
   - **Workflow Steps** - How it's done
   - **Tools & Technologies** - What's used
   - **How to Reproduce** - Steps to recreate the analysis

### Understanding the Sections

- **Overview**: 1-2 sentence summary of the analysis
- **Author & Source**: Who created it and where it was published
- **Data Sources**: What data is used and how to get it
- **Workflow Steps**:
  - Data Acquisition (obtaining the data)
  - Data Processing (cleaning and transforming)
  - Analysis (what questions are answered)
  - Output (what results are produced)
- **How to Reproduce**: Complete instructions to redo the analysis yourself

### Try to Reproduce

1. Read the "Prerequisites" section
2. Check if you have the required tools
3. Follow the "Installation & Setup" steps
4. Run the provided commands

## Part 5: Learning More

### Recommended Next Steps

1. **Start Simple** - Try a "Simple" difficulty workflow first
2. **Pick Your Interest** - Look for topics you care about
3. **Study the Methodology** - Understand how journalists approach data
4. **Adapt the Workflow** - Try applying methods to your own data

### Available Guides

- **[Using the Application](using-the-app.md)** - In-depth application features
- **[Navigating Workflows](workflows-navigation.md)** - Advanced workflow browsing
- **[Understanding Categories](understanding-categories.md)** - What Stack/Pack mean
- **[FAQ](faq.md)** - Answers to common questions

## Tips for Success

✅ **Do:**

- Read the overview before diving into code
- Check the data sources section first
- Try simpler workflows before advanced ones
- Experiment with the analysis steps
- Ask for help if stuck

❌ **Don't:**

- Skip the prerequisites section

## What's Next?

1. **Explore a Workflow** - Pick one that interests you
2. **Read the Documentation** - Understand the approach
3. **Set Up Your Environment** - Install needed tools
4. **Reproduce the Analysis** - Follow the steps
5. **Adapt & Experiment** - Modify it for your own work

## Getting Help

- **Browser-based issues?** - Check [Troubleshooting](troubleshooting.md)
- **Want to use the app differently?** - See [Using the Application](using-the-app.md)
- **Ready to code?** - Check [Development Setup](development-setup.md)
- **Questions?** - Ask in [Discussions](https://github.com/steve-kasica/open-roundup/discussions)

---

**Ready to explore?** Go to [Browse Workflows]() and pick your first workflow.

**Need more detail?** Check [Using the Application](using-the-app.md) for advanced features.

**Questions?** See our [FAQ](faq.md) or [ask the community](https://github.com/steve-kasica/open-roundup/discussions).

Happy exploring! 🚀
