import { GET_TRANSFERS_LAST_30_DAYS } from "../graphql/queries";
import { useQuery } from "@apollo/client";

export const useWalletData = (
  accountId: string | undefined,
): { loading: boolean; data: { date: string; amount: number }[] } => {
  const now = Math.floor(Date.now() / 1000);
  const fromTimestamp = now - 30 * 24 * 60 * 60; // 30 days ago

  const { data: transferData } = useQuery(GET_TRANSFERS_LAST_30_DAYS, {
    variables: {
      accountId,
      fromTimestamp: fromTimestamp.toString(),
    },
  });

  if (!transferData) {
    return { loading: true, data: [] };
  }

  // Group by day
  const groupByDay = transfers => {
    const dailyTotals = {};

    transfers.forEach(tx => {
      const date = new Date(Number(tx.blockTimestamp) * 1000).toISOString().slice(0, 10); // YYYY-MM-DD
      const value = Number(tx.value); // TODO: adjust for token decimals

      dailyTotals[date] = (dailyTotals[date] || 0) + value;
    });

    // Fill in missing days with 0
    const results: { date: string; amount: number }[] = [];
    for (let i = 30; i >= 0; i--) {
      const day = new Date(now * 1000 - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      results.push({
        date: day,
        amount: dailyTotals[day] || 0,
      });
    }

    return results;
  };

  return { loading: false, data: groupByDay(transferData?.transfers || []) };
};
