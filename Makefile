build:
	docker build --force-rm -t roleterminal .
rmi:
	docker rmi roleterminal
compose:
	docker-compose up --build
open:
	open http://localhost:8888
logs:
	docker-compose logs
clean:
	docker-compose rm --all

.PHONY: build rmi compose open logs
