# Open Roundup

An [OpenRefine](https://github.com/OpenRefine/OpenRefine) extension for combining multiple projects.

## Setup

1. Run OpenRefine via `$ refine`.

## Development Notes

Workplace directory is `~/Library/Application Support/OpenRefine`, and a symlink to the Roundup directory is in `extensions/roundup` directory.

Load OpenRefine as an external library via Maven

### Adding a new extension endpoint

- Update the `registerCommands` function in `module/MOD-INF/controller.js`.

### TODO:

### Easy ones

- Re-org: Move `slices`, `sagas`, etc... folder out of data folder

### Medium ones

- Fix coordinated hover between CTS and Ops detail

### Hard ones

- Implement between table selection in Stack Detail view
- Add Pack Operation detail view
