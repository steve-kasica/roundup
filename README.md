# Open Roundup
An [OpenRefine](https://github.com/OpenRefine/OpenRefine) extension for wrangling multiple tables.


## Setup

1. Run OpenRefine via `$ refine`.

## Development Notes
Workplace directory is `~/Library/Application Support/OpenRefine`, and a symlink to the Roundup directory is in `extensions/roundup` directory.

Load OpenRefine as an external library via Maven

### Adding a new extension endpoint

* Update the `registerCommands` function in `module/MOD-INF/controller.js`.