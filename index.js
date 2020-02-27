const express = require('express');
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type Namespace {
    uid: String!
    name: String!
  }
  type Query {
    namespaces: [Namespace]
  }
`);

const root = {
  namespaces: [],
}

const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
const server = app.listen(4000, () => {
  console.log(`Started server on port ${server.address().port}...`)
});