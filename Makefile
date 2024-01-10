help:
	@egrep -h '\s#@\s' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?#@ "}; {printf "\033[36m  %-30s\033[0m %s\n", $$1, $$2}'

start: #@ Start local
	yarn start
build: #@ Build local
	yarn build
.PHONY:build

docker-up: #@ Start docker
	docker compose up --build -d
docker-down: #@ Stop docker
	docker compose down
