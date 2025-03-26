# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
# Open Roundup
An [OpenRefine](https://github.com/OpenRefine/OpenRefine) extension for wrangling multiple tables.


## Setup

1. Run OpenRefine via `$ refine`.

## Development Notes
Workplace directory is `~/Library/Application Support/OpenRefine`, and a symlink to the Roundup directory is in `extensions/roundup` directory.

Load OpenRefine as an external library via Maven

### Adding a new extension endpoint

* Update the `registerCommands` function in `module/MOD-INF/controller.js`.
