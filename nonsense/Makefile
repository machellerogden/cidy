.EXPORT_ALL_VARIABLES:

include $(GD_DIR)/defaults.mk
ENV_FILE := $(ENTRY_DIR)/deploy/$(ENV_KEY).mk
-include $(ENTRY_DIR)/deploy/$(ENV_KEY).mk
REPO_URL := $(shell git config -f '$(ENTRY_DIR)/.git/config' --get remote.origin.url)

ifneq ("$(wildcard $(ENV_FILE))","")
else
$(info Please check ENV_KEY and ensure there is a matching environment config file at ./deploy/<ENV_KEY>.mk)
$(error $(ENV_FILE) does not exist)
endif

ifndef REFSPEC
$(error Please define a REFSPEC)
endif

ifndef REPO_URL
$(error No remote repository found)
endif

ifndef NO_CHECKOUT
TARGET_DIR := $(shell mktemp -d '/tmp/gd.XXXXXXXXXXXX' 2>/dev/null)
DOCKER_IMAGE_TAG = $(DOCKER_IMAGE_NAME):$(shell test -f '$(TARGET_DIR)' && git --git-dir $(TARGET_DIR)/.git rev-parse HEAD)
else
TARGET_DIR := $(ENTRY_DIR)
DOCKER_IMAGE_TAG := $(DOCKER_IMAGE_NAME):$(shell echo "$$(whoami)-$$(date +\%s)")
endif

.PHONY: show-config
show-config:
	$(foreach v, $(.VARIABLES), $(info $(v) = $($(v))))

.PHONY: clean
clean:
	@ [ -z "$(NO_CHECKOUT)" ] && rm -rf $(TARGET_DIR) || true

.PHONY: clone
clone:
	@ [ -z "$(NO_CHECKOUT)" ] && git clone --depth 1 "$(REPO_URL)" --branch "$(REFSPEC)" --single-branch "$(TARGET_DIR)" || true

.PHONY: build
build: SSH_PRIVATE_KEY = $(shell cat ~/.ssh/id_rsa)
build:
	@ echo docker image tag: $(DOCKER_IMAGE_TAG)
	@ docker build -f '$(TARGET_DIR)/Dockerfile' -t $(DOCKER_IMAGE_NAME) --build-arg SSH_PRIVATE_KEY='$(SSH_PRIVATE_KEY)' '$(TARGET_DIR)'

.PHONY: deploy
deploy: clone build clean

