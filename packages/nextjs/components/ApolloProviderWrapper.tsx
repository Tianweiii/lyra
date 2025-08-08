// components/ApolloProviderWrapper.tsx
"use client";

import { ReactNode } from "react";
import client from "../graphql/client";
import { ApolloProvider } from "@apollo/client";

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

// components/ApolloProviderWrapper.tsx

export default function ApolloProviderWrapper({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
