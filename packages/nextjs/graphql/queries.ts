// graphql/queries.ts
import { gql } from "@apollo/client";

export const GET_TRANSFERS = gql`
  query GetTransfers($accountId: Bytes!) {
    transfers(first: 10, orderBy: blockTimestamp, orderDirection: desc, where: { from: $accountId }) {
      id
      from
      to
      value
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

export const GET_ACCOUNTS = gql`
  query GetAccounts($accountId: Bytes!) {
    accounts(where: { id: $accountId }) {
      balance
    }
  }
`;
