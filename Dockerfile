FROM node:latest

ENV PORT=4000 \
    BASE_URL=https://kubernetes.default.svc.cluster.local \
    TOKEN_FILE=/var/run/secrets/kubernetes.io/serviceaccount/token \
    NODE_EXTRA_CA_CERTS=/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

EXPOSE 4000

USER node
WORKDIR /home/node
COPY --chown=node:node * ./

RUN npm install --production

CMD [ "npm", "start" ]