build:
	docker build -t github.com/SergTyapkin/where-is-logic-frontend .

run:
	docker run -d --rm --privileged --ipc host --network host --name wms_gui github.com/SergTyapkin/where-is-logic-frontend:latest

stop:
	docker stop wms_gui

pull:
	docker pull github.com/SergTyapkin/where-is-logic-frontend:latest
