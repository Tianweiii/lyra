// graphql/client.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/117787/lyra/version/latest",
  cache: new InMemoryCache(),
});

export default client;
