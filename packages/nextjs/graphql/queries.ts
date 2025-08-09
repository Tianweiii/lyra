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

export const GET_TRANSFERS_LAST_30_DAYS = gql`
  query GetTransfersLast30Days($accountId: Bytes!, $fromTimestamp: BigInt!) {
    transfers(
      first: 1000
      orderBy: blockTimestamp
      orderDirection: desc
      where: { from: $accountId, blockTimestamp_gte: $fromTimestamp }
    ) {
      id
      from
      to
      value
      blockTimestamp
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
