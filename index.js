'use strict';
const { readFileSync, existsSync } = require('fs');
const express = require('express');
const graphqlHTTP = require('express-graphql');
const { createGraphQLSchema } = require('openapi-to-graphql');
const fetch = require('node-fetch');
const logger = require('pino')();
const pino = require('express-pino-logger');

async function getOpenApiSpec(token) {
  const res = await fetch(`${process.env.BASE_URL}/openapi/v2`, {
    headers: token && {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (res.status != 200) {
    throw new Error(`Error fetching API: ${res.status}`);
  }
  const body = await res.json();
  logger.info({
    msg: 'Fetched OAS',
    paths: Object.keys(body.paths).length,
  });
  return body;
}

function main(token) {
  return async function(oas) {
    const app = express();
    const { schema } = await createGraphQLSchema(oas, {
      viewer: false,
      baseUrl: process.env.BASE_URL,
      requestOptions: token && {
        auth: {
          bearer: '',
        },
      },
    });
    app.use(pino({
      logger,
    }));
    app.use('/graphql', graphqlHTTP({
      schema,
      graphiql: true,
    }));
    const server = app.listen(Number(process.env.PORT) || 4000, () => {
      logger.info(`Started server on port ${server.address().port}...`)
    });
  }
}

function getToken() {
  if (existsSync(process.env.TOKEN_FILE || null)) {
    return readFileSync(process.env.TOKEN_FILE).toString();
  }
  return null;
}

const token = getToken();
getOpenApiSpec(token)
  .then(main(token))
  .catch(err => logger.error({ err }));