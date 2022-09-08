.PHONY: help remove build build-no-cache test which-image run shell push release

PROJECT_NAME ?= benworks-api
PROJECT_PATH = /usr/src/app
IMAGE_OWNER ?= guardiandirect
REGISTRY_URL = ghcr.io/${IMAGE_OWNER}
IMAGE_NAME ?= ${PROJECT_NAME}
RELEASE_TAG ?= "v0"
IMAGE_VERSION ?= ""
IMAGE_FULL_NAME = "${REGISTRY_URL}/${IMAGE_NAME}"
.DEFAULT_GOAL := build

# Run command within container
define run_command_in_container
	@docker-compose \
		--file docker-compose.yml \
		run \
		--rm \
		--service-ports \
		--use-aliases \
		-w $(PROJECT_PATH) \
		$1
endef

# Build docker image by spec
# Parameters:
#	$1 - Docker build target
#	$2 - Docker image tag
define build_image_by_spec
	@DOCKER_BUILDKIT=1 docker build . \
		--target $1 \
		-t $2
endef

help:			## Show help menu
	@grep -E '^[a-zA-Z_\%-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

which-image:	## Image identifier helper
	@echo ${IMAGE_FULL_NAME}:local

build:			## Build production Docker image
	@$(call build_image_by_spec,production,${IMAGE_FULL_NAME}:local)

build-dev:		## Build Development Docker image
	@$(call build_image_by_spec,development,${IMAGE_FULL_NAME}:local-dev)

start: 			## Start the Production version of the server
	docker-compose rm -f
	docker-compose up --force-recreate

shell:			## Shell into the Production container
	@docker-compose \
		--file docker-compose.yml \
		run \
		--rm \
		--service-ports \
		--use-aliases \
		--no-deps \
		-w $(PROJECT_PATH) \
		--entrypoint /bin/bash \
		api

shell-dev:		## Shell into the Development container
	@docker run -it --rm --env-file .env -p 3000:3000 --entrypoint /bin/bash ${IMAGE_FULL_NAME}:local-dev

push:			## Push image to artifact registry
	@docker tag ${IMAGE_FULL_NAME}:local ${IMAGE_FULL_NAME}:${IMAGE_VERSION}
	@docker push ${IMAGE_FULL_NAME}:${IMAGE_VERSION}

release:		## Release Image to Registry
	# Pull baked binary that has passed CI
	@docker pull ${IMAGE_FULL_NAME}:${IMAGE_VERSION}
	# Release versioned artifact
	@docker tag ${IMAGE_FULL_NAME}:${IMAGE_VERSION} ${IMAGE_FULL_NAME}:${RELEASE_TAG}
	@docker push ${IMAGE_FULL_NAME}:${RELEASE_TAG}
	# Tag the same image as 'latest' in accordance with expected Docker behavior
	@docker tag ${IMAGE_FULL_NAME}:${IMAGE_VERSION} ${IMAGE_FULL_NAME}:latest
	@docker push ${IMAGE_FULL_NAME}:latest

start-all: build-dev build start-api-with-postgres