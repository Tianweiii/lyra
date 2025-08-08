// graphql/client.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/<your-subgraph-name>",
  cache: new InMemoryCache(),
});

export default client;
