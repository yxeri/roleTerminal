build:
	docker build --force-rm -t roleooc .
rmi:
	docker rmi roleooc
compose:
	docker-compose build && docker-compose up -d
boot2open:
	open http://$(shell boot2docker ip):8888
boot2logs:
	docker logs roleooc_roleooc_1
eslint:
	docker run -it -v $(PWD):/usr/src/app stanislavb/iojs-eslint
