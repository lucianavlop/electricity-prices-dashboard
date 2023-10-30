help:
	@egrep -h '\s#@\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?#@ "}; {printf "\033[36m  %-30s\033[0m %s\n", $$1, $$2}'

start: #@ Start local
	yarn start
build: #@ Build local
	yarn build
image: #@ Build docker image
	docker build -t electricity-prices-dashboard . --load
