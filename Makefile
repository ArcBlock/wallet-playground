TOP_DIR=.
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))

build:
	@echo "Building the software..."

init: install dep
	@echo "Initializing the repo..."

travis-init: install dep
	@echo "Initialize software required for travis (normally ubuntu software)"

install:
	@echo "Install software required for this repo..."
	@npm install -g lerna yarn

dep:
	@echo "Install dependencies required for this repo..."
	@lerna clean --yes
	@lerna bootstrap
	@lerna run build --scope @arcblock/*

pre-build: install dep
	@echo "Running scripts before the build..."

post-build:
	@echo "Running scripts after the build is done..."

all: pre-build build post-build

test:
	@echo "Running test suites..."

lint:
	@echo "Linting the software..."
	@yarn lint

doc:
	@echo "Building the documenation..."

coverage:
	@echo "Collecting test coverage ..."
	@lerna run coverage

lint:
	@echo "Linting the software..."
	@lerna run lint

precommit: dep lint build test

travis: init coverage

travis-deploy:
	@echo "Deploy the software by travis"
	@bash ./tools/publish.sh

clean:
	@echo "Cleaning the build..."

run:
	@echo "Running the software..."
	@yarn start

include .makefiles/*.mk

.PHONY: build init travis-init install dep pre-build post-build all test doc precommit travis clean watch run bump-version create-pr
