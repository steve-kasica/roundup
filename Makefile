# Makefile for installing Open Roundup as a OpenRefine extension

WORKPLACE_DIR := ~/Library/Application\ Support/OpenRefine
EXTENSIONS_DIR := $(WORKPLACE_DIR)/extensions

EXTENSION_SRC := $(CURDIR)/module  # Directory where Makefile is located
EXTENSION_NAME := open-roundup  # Name of the extension (folder name)

.PHONY: all install clean restart

all: install

install:
	@echo "Installing extension"
	mkdir -p $(EXTENSIONS_DIR)
	ln -sfn $(EXTENSION_SRC) $(EXTENSIONS_DIR)/$(EXTENSION_NAME)
	@echo "Restarting OpenRefine (TODO)" 

clean:
	@echo "Removing Open Roundup extension..."
	rm -f $(EXTENSIONS_DIR)/$(EXTENSION_NAME)

restart:
	@echo "Restarting OpenRefine..."
	pkill -f openrefine || true

dev:
	@echo "Starting development server"
	npm run dev --prefix webapp/react-src