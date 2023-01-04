FROM node:18.8

ARG DEBIAN_FRONTEND=noninteractive

USER root

COPY . /home/node/onesimus-operator-gui-front

WORKDIR /home/node/onesimus-operator-gui-front

RUN yarn

RUN yarn dist

RUN chown -R node node_modules

ENTRYPOINT [ "yarn" ]

CMD [ "dev" ]
